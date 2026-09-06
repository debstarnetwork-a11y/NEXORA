import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

let aiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;
let xaiClient: OpenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function getXAIClient() {
  if (!xaiClient) {
    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not set.");
    }
    xaiClient = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }
  return xaiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Chat/Text generation API
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      
      // Prefer xAI if the key is configured
      if (process.env.XAI_API_KEY) {
        try {
          const xai = getXAIClient();
          const response = await xai.chat.completions.create({
            model: "grok-beta",
            messages: [
              { role: "system", content: "You are a helpful AI research assistant." },
              { role: "user", content: prompt }
            ]
          });
          return res.json({ text: response.choices[0].message.content });
        } catch (error: any) {
          // Silent fallback for xAI
        }
      }

      // Prefer OpenAI if the key is configured
      if (process.env.OPENAI_API_KEY) {
        try {
          const openai = getOpenAIClient();
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Free tier friendly model
            messages: [
              { role: "system", content: "You are a helpful AI research assistant." },
              { role: "user", content: prompt }
            ]
          });
          return res.json({ text: response.choices[0].message.content });
        } catch (error: any) {
          // Silent fallback for OpenAI
          // Fall through to Gemini below
        }
      }

      const ai = getAIClient();
      const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
          systemInstruction: "You are a helpful AI research assistant.",
        },
      });

      if (history && history.length > 0) {
        // We'll just pass the latest prompt for simplicity, or we could rebuild the chat
        // To be safe, we just use generateContent if history is complex, but let's use generateContent directly
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      let errorMessage = error.message || "An unknown error occurred";
      if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = `API Quota Exceeded: ${errorMessage}`;
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Image generation API
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1", quality = "1K", negativePrompt, model = "gemini-3.1-flash-image", style = "" } = req.body;
      
      let styleModifier = "";
      switch(style) {
          case "Nexora Vision Fast": styleModifier = ", 8k resolution, highly detailed, sharp focus, fast action, dynamic"; break;
          case "Nexora Vision Pro": styleModifier = ", 8k resolution, raw photo, masterpiece, photorealistic, cinematic lighting, ultra-sharp focus"; break;
          case "Nexora Vision Lite": styleModifier = ", 4k resolution, clean, well-lit, realistic"; break;
          case "Nexora Studio XL": styleModifier = ", medium format photography, studio lighting, hyper-detailed, 8k, professional photoshoot"; break;
          case "Nexora Cinematic": styleModifier = ", cinematic lighting, anamorphic lens, movie still, dramatic color grading, 8k"; break;
          case "Nexora Film Noir": styleModifier = ", film noir style, high contrast black and white, dramatic shadows, 1940s cinematic"; break;
          case "Nexora Polaroid": styleModifier = ", polaroid vintage photo, retro color grading, soft focus, instant film artifacts, nostalgic"; break;
          case "Nexora Animate Cartoon": styleModifier = ", high quality 3D animation style, vibrant colors, detailed textures, cartoon"; break;
          case "Nexora Stick Cartoon": styleModifier = ", high quality stick figure cartoon style, simple crisp lines, 2D flat illustration, minimalist drawing"; break;
          default:
              if (!prompt.includes("realistic") && !prompt.includes("realism")) {
                  styleModifier = ", 8k resolution, raw photo, highly detailed, masterpiece, photorealistic, cinematic lighting, ultra-sharp focus";
              }
              break;
      }
      const enhancedPrompt = `${prompt}${styleModifier}`;

      if (model === 'replicate-flux-dev') {
        const replicateKey = (process.env.REPLICATE_API_TOKEN || "").trim();
        if (!replicateKey) {
          return res.status(400).json({ error: "Missing REPLICATE_API_TOKEN. Please add your key in Settings > Secrets." });
        }
        
        let repRatio = "1:1";
        if (aspectRatio === "16:9") repRatio = "16:9";
        else if (aspectRatio === "9:16") repRatio = "9:16";
        else if (aspectRatio === "4:3") repRatio = "3:2";
        else if (aspectRatio === "3:4") repRatio = "2:3";

        const replicateResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${replicateKey}`,
            "Content-Type": "application/json",
            "Prefer": "wait"
          },
          body: JSON.stringify({
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: repRatio,
              output_format: "jpg",
              output_quality: 90
            }
          })
        });

        if (!replicateResponse.ok) {
          const errText = await replicateResponse.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            if (parsed.detail) parsedMsg = parsed.detail;
            if (parsed.error) parsedMsg = parsed.error;
          } catch {}
          throw new Error(`Replicate API error: ${parsedMsg}`);
        }

        const data = await replicateResponse.json();
        
        if (data.status === "failed") {
            throw new Error(`Replicate failed: ${data.error || 'Unknown error'}`);
        }

        const url = Array.isArray(data.output) ? data.output[0] : data.output;
        if (!url) {
            // Sometimes prefer: wait times out and returns processing status
            if (data.status === "starting" || data.status === "processing") {
                throw new Error("Replicate is taking longer than expected. Please try again in a moment.");
            }
            throw new Error("No image URL returned by Replicate.");
        }

        return res.json({ imageUrl: url });
      }

      if (model === 'together-flux') {
        const togetherKey = (process.env.TOGETHER_API_KEY || "").trim();
        if (!togetherKey) {
          return res.status(400).json({ error: "Missing TOGETHER_API_KEY secret. Please add your Together API key in Settings > Secrets to use Flux." });
        }
        
        let width = 1024;
        let height = 1024;
        if (aspectRatio === "16:9") { width = 1280; height = 768; }
        else if (aspectRatio === "9:16") { width = 768; height = 1280; }
        else if (aspectRatio === "4:3") { width = 1024; height = 768; }
        else if (aspectRatio === "3:4") { width = 768; height = 1024; }

        const togetherResponse = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${togetherKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: enhancedPrompt,
            width: width,
            height: height,
            steps: 4,
            n: 1,
            response_format: "url"
          })
        });

        if (!togetherResponse.ok) {
          const errText = await togetherResponse.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            if (parsed.error?.message) {
              parsedMsg = parsed.error.message;
            }
          } catch {}
          throw new Error(`Together API error: ${parsedMsg}`);
        }

        const data = await togetherResponse.json();
        const url = data.data?.[0]?.url;
        if (!url) throw new Error("No image URL returned by Together AI");
        return res.json({ imageUrl: url });
      }

      if (model === 'huggingface-flux') {
        const hfToken = (process.env.HF_TOKEN || "").trim();
        if (!hfToken) {
          return res.status(400).json({ 
            error: "Missing HF_TOKEN secret. Hugging Face is completely free with no credit card required! 1) Sign up free at huggingface.co, 2) Go to Settings > Access Tokens > Create 'Read' token, 3) Add it in Settings > Secrets as HF_TOKEN." 
          });
        }

        const hfResponse = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: enhancedPrompt })
        });

        if (!hfResponse.ok) {
          const errText = await hfResponse.text();
          let parsedMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            if (parsed.error) parsedMsg = parsed.error;
          } catch {}
          throw new Error(`Hugging Face error: ${parsedMsg}`);
        }

        const arrayBuffer = await hfResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = hfResponse.headers.get('content-type') || 'image/jpeg';
        return res.json({ imageUrl: `data:${mimeType};base64,${base64}` });
      }
      
      // Default to Gemini
      const ai = getAIClient();
      const imageConfig: { aspectRatio?: string; imageSize?: string } = {
        aspectRatio: aspectRatio || "1:1",
      };
      if (model === 'gemini-3.1-flash-image' || model === 'gemini-3-pro-image') {
        imageConfig.imageSize = quality || "1K";
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: enhancedPrompt }], // Use enhanced prompt
        },
        config: {
          imageConfig,
        },
      });

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          break;
        }
      }

      if (!imageUrl) {
        throw new Error("No image generated");
      }

      res.json({ imageUrl });
    } catch (error: any) {
      let errorMsg = "An error occurred with the Image API";
      if (error && typeof error.message === 'string') {
          errorMsg = error.message;
      } else if (typeof error === 'string') {
          errorMsg = error;
      }

      if (req.body.model === 'replicate-flux-dev' && (errorMsg.includes("402") || /insufficient credit|billing/i.test(errorMsg))) {
          errorMsg = "Replicate Error: Insufficient credits on your Replicate account. Please switch to Gemini 3.1 Flash Image in the model selector, or add credits at replicate.com/account/billing.";
      } else if (req.body.model === 'replicate-flux-dev' && errorMsg.toLowerCase().includes("nsfw")) {
          errorMsg = "Replicate Error: The prompt triggered Replicate's safety filter.";
      }
      
      // Try to parse the original error to not show raw JSON
      try {
          const jsonMatch = errorMsg.match(/\{.*\}/s);
          if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0].replace(/\n/g, '\\n'));
              if (parsed?.error?.message) {
                  errorMsg = parsed.error.message;
              }
          }
      } catch(e) {}
      
      if (/quota|resource_exhausted|429/i.test(errorMsg)) {
          errorMsg = "Gemini Quota Exceeded: Image models require an active paid API key / billing project. You can link your Google Cloud project or switch models.";
      }
      
      return res.status(500).json({ error: errorMsg });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
