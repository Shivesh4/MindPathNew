"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatLayout from "@/components/dashboard/messages/chat-layout";

function TutorMessagesContent() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId");
  const [contacts, setContacts] = React.useState([]);

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("authToken")
            : null;
        if (!token) {
          setContacts([]);
          return;
        }

        // Reuse the tutor students API so the chat list shows
        // all students this tutor is actually connected with.
        const response = await fetch("/api/tutor/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Failed to load students");
        }

        const students = Array.isArray(data.students) ? data.students : [];

        const mappedContacts = students.map((student) => ({
          id: student.id, // this is the student userId from the API
          name: student.name,
          avatarId: student.avatarId,
          isAI: false,
          lastMessage:
            student.status === "active"
              ? "Active student"
              : "No recent sessions",
          timestamp:
            student.lastSessionDate ||
            student.joinDate ||
            "",
        }));

        setContacts(mappedContacts);
      } catch (err) {
        console.error("Error loading tutor students for messages:", err);
        setContacts([]);
      }
    };

    fetchContacts();
  }, []);

  const initialContactId =
    contacts.length === 0
      ? undefined
      : initialStudentId && contacts.some((c) => c.id === initialStudentId)
      ? initialStudentId
      : contacts[0].id;

  return (
    <div className="h-full w-full">
      <ChatLayout contacts={contacts} initialContactId={initialContactId} />
    </div>
  );
}

export default function TutorMessagesPage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading...</div>}>
      <TutorMessagesContent />
    </Suspense>
  );
}
