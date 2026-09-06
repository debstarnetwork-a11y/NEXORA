import { GoogleGenAI } from "@google/genai";
async function test() {
    try {
        const ai = new GoogleGenAI({ apiKey: "invalid_key" });
        await ai.models.generateContent({
            model: 'gemini-3.1-flash-image',
            contents: { parts: [{ text: "test" }] }
        });
    } catch(error: any) {
      let errorMsg = "An error occurred with the Image API";
      if (error && typeof error.message === 'string') {
          errorMsg = error.message;
      } else if (typeof error === 'string') {
          errorMsg = error;
      }

      console.log("errorMsg before parse:", errorMsg);

      let cleanErrorMsg = errorMsg;
      try {
          const jsonMatch = errorMsg.match(/\{.*\}/s);
          if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0].replace(/\n/g, '\\n'));
              if (parsed?.error?.message) {
                  cleanErrorMsg = parsed.error.message;
              }
          }
      } catch(e) {}
      
      console.log("cleanErrorMsg:", cleanErrorMsg);
      if (/quota|resource_exhausted|429/i.test(cleanErrorMsg)) {
          cleanErrorMsg = "Gemini API quota exceeded.";
      }
      console.log("final cleanErrorMsg:", cleanErrorMsg);
    }
}
test();
