import { GoogleGenAI } from "@google/genai";
async function test() {
    try {
        const ai = new GoogleGenAI({});
        const response = await ai.models.list();
        for await (const model of response) {
            if (model.name.includes("image") || model.name.includes("imagen")) {
                console.log(model.name);
            }
        }
    } catch(error: any) {
        console.log("Error:", error.message);
    }
}
test();
