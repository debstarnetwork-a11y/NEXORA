import { GoogleGenAI } from "@google/genai";
async function test() {
    try {
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: "a beautiful sunset" }] }
        });
        console.log("Success!", response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType);
    } catch(error: any) {
        console.log("Error:", error.message);
    }
}
test();
