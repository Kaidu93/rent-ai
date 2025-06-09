import { chatToGemini } from "@/src/utils/geminiHelper";
import { NextResponse } from "next/server";
import { ChatHistory, ChatSettings } from "@/src/types";

export async function POST(request: Request) {
    try {
        const { userMessage, history, settings } = await request.json() as {
            userMessage: string; history: ChatHistory; settings: ChatSettings;
        }

        const aiResponse = await chatToGemini(userMessage, history, settings);
        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error with the model response" },
            { status: 500 }
        )
    }
}