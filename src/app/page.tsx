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
    systemInstructions:
      "You are a flat rental assistant who's job is to gather information from clients to know their rental requirements",
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userMessage: message,
          history: updatedHistory,
          settings
        })
      });
      const data = await response.json();
      if(data.error) {
        console.error("AI Error", data.error);
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: data.response }]
      }

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
