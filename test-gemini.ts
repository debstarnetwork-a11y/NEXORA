import { GoogleGenAI } from "@google/genai";
async function test() {
    try {
        const ai = new GoogleGenAI({ apiKey: "invalid_key" });
        await ai.models.generateContent({
            model: 'gemini-3.1-flash-image',
            contents: { parts: [{ text: "test" }] }
        });
    } catch(e) {
        console.log("e.message type:", typeof e.message);
        console.log("e.message value:", e.message);
        console.log("Stringified e:", String(e));
    }
}
test();
