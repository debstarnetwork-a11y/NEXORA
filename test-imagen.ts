import { GoogleGenAI } from "@google/genai";
async function test() {
    try {
        const ai = new GoogleGenAI({}); // Uses process.env.GEMINI_API_KEY
        const response = await ai.models.generateContent({
            model: 'imagen-3.0-generate-001',
            contents: { parts: [{ text: "a beautiful sunset" }] }
        });
        console.log("Success!", response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType);
    } catch(error: any) {
        console.log("Error:", error.message);
    }
}
test();
