'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, Video, Phone, FileText, Paperclip } from 'lucide-react';
import FileUpload from './file-upload';
import DocumentSummary from './document-summary';
import { AIChatbot } from './ai-chatbot';

export function ChatMessages({ contact, messages, onBack }) {
  const [newMessage, setNewMessage] = React.useState('');
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const [documentSummary, setDocumentSummary] = React.useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [loadedMessages, setLoadedMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  // Access the avatar image correctly from the PlaceHolderImages object
  const avatarImage = contact.avatarId ? PlaceHolderImages[contact.avatarId] : null;
  const messagesEndRef = React.useRef(null);
  const wsRef = React.useRef(null);

  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!contact?.id || typeof window === 'undefined') return;
      try {
        setLoading(true);
        setError(null);
        const token = window.localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }
        const response = await fetch(
          `/api/messages?contactId=${encodeURIComponent(contact.id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load messages');
        }
        setLoadedMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err.message || 'Failed to load messages');
        setLoadedMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [contact?.id]);

  // WebSocket connection for real-time updates
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('authToken');
    if (!token) return;

    try {
      const ws = new WebSocket(
        `ws://localhost:3001?token=${encodeURIComponent(token)}`
      );
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'message' && data.fromUserId === contact?.id) {
            setLoadedMessages((prev) => [
              ...prev,
              {
                id: `ws-${Date.now()}`,
                content: data.content,
                timestamp: data.timestamp,
                from: 'contact',
              },
            ]);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
      };

      ws.onerror = () => {
        // Non-fatal: if the WS server isn't running or the connection fails,
        // we just silently fall back to HTTP-only messaging.
        console.warn('WebSocket connection failed – falling back to HTTP-only messaging.');
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [contact?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !contact?.id || typeof window === 'undefined') return;
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const token = window.localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactId: contact.id, content }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      // Append to local list
      setLoadedMessages((prev) => [...prev, data]);

      // Notify recipient in real time via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'message',
            contactId: contact.id,
            content,
          })
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.message || 'Failed to send message');
    }
  };

  const handleFileUpload = (file) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileRemove = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleGenerateSummary = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock summary data
    const mockSummary = {
      summary: "This document covers fundamental concepts in machine learning, including supervised and unsupervised learning algorithms, neural networks, and deep learning architectures. The material provides a comprehensive overview suitable for intermediate-level students.",
      keyPoints: [
        "Supervised learning uses labeled training data to make predictions",
        "Unsupervised learning finds patterns in data without labels",
        "Neural networks are inspired by biological brain structures",
        "Deep learning uses multiple layers of neural networks",
        "Overfitting occurs when models memorize training data"
      ],
      importantTerms: [
        "Machine Learning",
        "Neural Networks",
        "Deep Learning",
        "Supervised Learning",
        "Unsupervised Learning",
        "Overfitting",
        "Backpropagation"
      ],
      studyQuestions: [
        "What is the difference between supervised and unsupervised learning?",
        "How do neural networks learn from data?",
        "What causes overfitting in machine learning models?",
        "Explain the concept of backpropagation in neural networks"
      ],
      relatedTopics: [
        "Artificial Intelligence",
        "Data Science",
        "Statistics",
        "Linear Algebra",
        "Probability Theory"
      ],
      summaryLength: "medium",
      confidence: 0.87
    };
    
    setDocumentSummary(mockSummary);
    setIsGeneratingSummary(false);
  };

  const handleRegenerateSummary = () => {
    setDocumentSummary(null);
    handleGenerateSummary();
  };

  const handleDownloadSummary = () => {
    if (!documentSummary) return;
    
    const summaryText = `
Document Summary
================

${documentSummary.summary}

Key Points:
${documentSummary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Important Terms:
${documentSummary.importantTerms.join(', ')}

Study Questions:
${documentSummary.studyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Related Topics:
${documentSummary.relatedTopics.join(', ')}

Generated with AI • ${documentSummary.summaryLength} length • ${Math.round(documentSummary.confidence * 100)}% confidence
    `;
    
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loadedMessages]);

  // For the AI Assistant contact, delegate to the dedicated Groq-backed chatbot
  if (contact?.isAI) {
    return <AIChatbot />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-4 p-3 border-b sticky top-0 bg-background z-10">
        {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
        )}
        <Avatar className="h-10 w-10 border">
          {contact.isAI ? (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
          ) : (
            <>
              {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={contact.name} data-ai-hint={avatarImage.imageHint} />}
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="flex-grow">
          <p className="font-semibold">{contact.name}</p>
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={cn(
              "w-2 h-2 rounded-full mr-1.5",
              contact.isAI ? "bg-blue-500" : "bg-green-500"
            )}></span>
            {contact.isAI ? "AI Assistant" : "Online"}
          </p>
        </div>
        {!contact.isAI && (
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5"/>
              </Button>
               <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5"/>
              </Button>
          </div>
        )}
      </header>

      <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading messages…</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {loadedMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2 max-w-[85%] sm:max-w-[75%]',
                  message.from === 'me' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {message.from !== 'me' && (
                  <Avatar className="h-8 w-8 border">
                    {contact.isAI ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        AI
                      </div>
                    ) : (
                      <>
                        {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={contact.name} />}
                        <AvatarFallback className="text-xs">{contact.name.charAt(0)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2',
                    message.from === 'me'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.from === 'me' ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-right"
                  )}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Document Summary */}
      {documentSummary && (
        <div className="p-4 border-t bg-muted/30">
          <DocumentSummary 
            summary={documentSummary}
            onRegenerate={handleRegenerateSummary}
            onDownload={handleDownloadSummary}
          />
        </div>
      )}

      {/* File Upload Section */}
      {showFileUpload && (
        <div className="p-4 border-t bg-muted/30">
          <FileUpload 
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            uploadedFiles={uploadedFiles}
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {uploadedFiles.length} file(s) uploaded
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFileUpload(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating Summary...
                    </>
                  ) : (
                    'Generate Summary'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="p-4 border-t sticky bottom-0 bg-background">
        <div className="space-y-3">
          {/* File Upload Toggle */}
          {contact.isAI && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {showFileUpload ? 'Hide File Upload' : 'Upload Documents for Summary'}
              </Button>
            </div>
          )}
          
          {/* Message Input */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim()} className="h-9 w-9">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}