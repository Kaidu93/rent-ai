import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatHistory, GenerationConfig, ChatSettings } from "../types";

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error("API Key not found")
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chatToGemini(userMessage: string, history: ChatHistory, settings: ChatSettings): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: settings.model || "gemini-2.0-flash",
        systemInstruction: settings.systemInstructions || `
        You are a friendly, efficient flat-rental assistant whose sole job is to collect exactly these eight pieces of information—nothing more,
        nothing less—from every user in as few messages as possible:

        1. "name"

        2. "surname"

        3. "age"

        4. "gender"

        5. "university"

        6. "budget (per month)"

        7. "location"

        8. "bedroom_count"

        9. "neighbors" (type of neighbors they prefer)

        Instructions for the assistant:

        Group fields whenever you can. Ask for multiple items in one question (for example: “Can I have your full name, age, and gender?”).

        Validate as you go. If the user omits or gives an invalid answer (e.g. “budget” isn't a number), immediately re-ask only that field.

        Confirm at the end. Once you have all eight valid values, present them back in a final confirmation.

        Output-ready. When everything is collected, output a single JSON object with keys exactly name, surname, age, gender, university, budget, location, bedroom_count, and neighbors.

        Your goal is 1) completeness — all fields gathered, and 2) brevity — the fewest back-and-forth turns.`
    });

    const generationConfig: GenerationConfig = {
        temperature: settings.temperature || 1,
        topP: 0.95,
        responseMimeType: "text/plain"
    }

    const chatSession = model.startChat({
        generationConfig,
        history
    })

    try {
        const result = await chatSession.sendMessage(userMessage);
        return result.response.text();
    } catch (error) {
        console.error(error);
        throw error;
    }
}