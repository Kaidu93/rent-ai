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
    `,
  });

  const handleSend = async (message: string) => {
    const newUserMessage: Message = {
      role: "user" as MessageRole,
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
        role: "model" as MessageRole,
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
