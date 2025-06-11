import OpenAI, { chatCompletionRequestMessage } from "openai";
import { ChatHistory } from "../types";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OpenAI API key not found");

const openai = new OpenAI({ apiKey });

export async function chatToOpenAI(
    userMessage: string,
    history: ChatHistory
): Promise<string> {
    const systemPrompt = `
    You are a friendly, empathetic flat-rental assistant. Your sole goal is to collect these nine fields—nothing more, nothing less—in as few turns as possible:

        1. name  
        2. surname  
        3. age  
        4. gender  
        5. university  
        6. budget (per month)  
        7. location  
        8. bedroom_count  
        9. neighbors (type of neighbors they prefer)

    **Steering & style guidelines:**  
    1. **Batch politely.** Whenever you can, ask for multiple missing items together (e.g. “May I have X, Y, and Z?”).  
    2. **Validate each field immediately.**  
        - **Strings:** non-empty text.  
        - **Integers:** positive whole numbers.
    3. **Age fallback:**  
        - If the user refuses to give their exact age, ask:  
            “No problem — are you at least 18 years old? (yes/no)”  
        - If yes, record "age = 18".  
        - If no, gently request the real age again.
    4. **Handle off-topic gracefully.** If the user digresses or tries to change your tone:  
    - Briefly acknowledge (“I appreciate that,” or “Thanks for sharing,”)  
    - Then pivot back by asking for the next missing field(s) in natural language.  
    - Vary your wording each time to avoid repetition.  
    5. **Keep it natural.** No long boilerplate intros or robotic repetitions—just short, courteous turns.  
    6. **Confirm & finish.** Once all nine fields are collected, output exactly this JSON (keys in this order) and then stop:

    \`\`\`json
    {
    "name": "string",
    "surname": "string",
    "age": integer,           // if user declined exact, age = 18
    "gender": "string",
    "university": "string",
    "budget": integer,        // monthly budget in whole numbers
    "location": "string",
    "bedroom_count": integer, // number of bedrooms
    "neighbors": "string"
    }
    \`\`\`
  `;

    // Build the message list: system, history, then the current user message
    const messages: chatCompletionRequestMessage = [
        { role: "system", content: systemPrompt },
        ...history.map((msg) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts.map((p) => p.text).join(""),
        })),
        { role: "user", content: userMessage },
    ];

    // Call OpenAI's chat completion endpoint
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages,
    });

    // Return the assistant's reply text
    return response.choices[0].message.content;
}
