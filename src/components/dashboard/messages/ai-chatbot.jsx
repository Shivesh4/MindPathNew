import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Lightbulb, FileText, Send } from "lucide-react";

export function AIChatbot() {
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [topic, setTopic] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      content:
        "Hello! I'm your AI study assistant (powered by Groq). Ask me anything about your studies or upload a document for help.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = React.useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFile(event.target.files[0]);
    }
  };

  const callGroq = async (prompt, system) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, system }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }
      return data.reply || "I was not able to generate a response.";
    } finally {
      setIsLoading(false);
    }
  };

  const pushUserAndAiMessage = async (userText, system) => {
    const userMessage = {
      id: Date.now(),
      content: userText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const reply = await callGroq(userText, system);
      const aiMessage = {
        id: Date.now() + 1,
        content: reply,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMessage = {
        id: Date.now() + 2,
        content:
          "Sorry, I couldn’t reach the AI service. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleExplain = () => {
    if (!topic.trim()) return;
    const prompt = `Explain the topic "${topic}" in a clear, student-friendly way. Include key ideas and one or two concrete examples.`;
    pushUserAndAiMessage(prompt, "You are a helpful study explainer.");
    setTopic("");
  };

  const handleFileAction = async (action) => {
    if (!uploadedFile) return;

    const userMessage = {
      id: Date.now(),
      content: `${action} document: ${uploadedFile.name}`,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("action", action);

      const response = await fetch("/api/ai/document", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyse document");
      }

      const aiMessage = {
        id: Date.now() + 1,
        content: data.reply,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error analysing document:", error);
      const errorMessage = {
        id: Date.now() + 2,
        content:
          "Sorry, I couldn’t process that document. Please make sure it’s a PDF and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    pushUserAndAiMessage(
      text,
      "You are a friendly academic assistant helping with any learning questions."
    );
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div>
          <p className="font-semibold">AI Assistant</p>
          <p className="text-xs text-muted-foreground">Always available</p>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-primary-foreground/70 text-right"
                      : "text-muted-foreground text-right"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Explain a Topic</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Quantum Physics, The French Revolution"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <Button onClick={handleExplain} disabled={isLoading || !topic}>
                  {isLoading ? "Thinking..." : "Explain"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                <span>Upload a Document (PDF)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 5MB)</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {uploadedFile && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Uploaded: {uploadedFile.name}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleFileAction("Summarise")} disabled={isLoading}>Summarise</Button>
                    <Button variant="outline" size="sm" onClick={() => handleFileAction("Quiz")} disabled={isLoading}>Generate Quiz</Button>
                    <Button variant="outline" size="sm" onClick={() => handleFileAction("Flashcards")} disabled={isLoading}>Create AI Flashcards</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}