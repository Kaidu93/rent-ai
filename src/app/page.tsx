"use client";

import { useState } from "react";
import ChatInput from "../components/ui/ChatInput";
import MessageWindow from "../components/ui/MessageWindow";
import { ChatHistory, ChatSettings, Message, MessageRole } from "../types";

export default function Home() {
  const [history, setHistory] = useState<ChatHistory>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 1,
    model: "gemini-2.0-flash",
    systemInstructions: `
    You are a friendly, efficient flat-rental assistant whose sole job is to collect exactly these eight pieces of information—nothing more, nothing less—from every user in as few messages as possible:

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

    Validate as you go. If the user omits or gives an invalid answer (e.g. “budget” isn’t a number), immediately re-ask only that field.

    Confirm at the end. Once you have all eight valid values, present them back in a final confirmation.

    Output-ready. When everything is collected, output a single JSON object with keys exactly name, surname, age, gender, university, budget, location, bedroom_count, and neighbors.

    Your goal is 1) completeness — all fields gathered, and 2) brevity — the fewest back-and-forth turns.`,
  });

  const handleSend = async (message: string) => {
    const newUserMessage: Message = {
      role: "user",
      parts: [{ text: message }],
    };

    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          history: updatedHistory,
          settings,
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error("AI Error", data.error);
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: data.response }],
      };

      setHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error("Request Failed", error);
    }
  };

  return (
    <div className="flex flex-col py-36">
      <MessageWindow history={history} />
      <ChatInput onSend={handleSend} onOpenSettings={() => {}} />
    </div>
  );
}
