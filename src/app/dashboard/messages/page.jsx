// AI Assisted code, model name : Gemini 2.5 Pro Prompt : Create a comprehensive messaging interface for a tutoring platform with AI chatbot integration, real-time messaging capabilities, and mobile-responsive design
"use client";

import * as React from "react";
import ChatLayout from "@/components/dashboard/messages/chat-layout";

export default function MessagesPage() {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("authToken")
            : null;
        if (!token) {
          setContacts([]);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/messages/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Failed to load conversations");
        }

        const aiContact = {
          id: "ai-chatbot",
          name: "AI Assistant",
          avatarId: "ai-avatar",
          isAI: true,
          lastMessage: "Ask me anything or upload a document!",
          timestamp: "Just now",
        };

        const conversationContacts = Array.isArray(data.conversations)
          ? data.conversations
          : [];

        setContacts([aiContact, ...conversationContacts]);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="h-full w-full">
      <ChatLayout contacts={contacts} />
    </div>
  );
}