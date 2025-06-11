// import { chatToGemini } from "@/src/utils/geminiHelper";
import { chatToOpenAI } from "@/src/utils/openaiHelper";
import { NextResponse } from "next/server";
import { ChatHistory } from "@/src/types";

export async function POST(request: Request) {
    try {
        const { userMessage, history } = (await request.json()) as {
            userMessage: string; history: ChatHistory;
        }

        const aiResponse = await chatToOpenAI(userMessage, history);
        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error with the model response" },
            { status: 500 }
        )
    }
}