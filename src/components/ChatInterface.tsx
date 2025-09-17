import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponseCard } from "./ResponseCard";
import { DomainIndicator } from "./DomainIndicator";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";   // ✅ shadcn/ui Switch
import { Label } from "@/components/ui/label";
import { HelpButton } from "./HelpButton";

export interface AIResponse {
  id: string;
  responseId: number;
  model: "openai" | "gemini" | "grok";
  content: string;
  timestamp: Date;
  rating?: number;
  error?: string;
  isLoading: boolean;
}

export interface ChatMessage {
  id: string;
  prompt: string;
  responses: AIResponse[];
  domain?: string;
  optimizedModel?: string;
  timestamp: Date;
  promptId?: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedMode, setOptimizedMode] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null); // ✅ Track conversation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------- CALL BACKEND -----------------
  const callBackend = async (prompt: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          optimized: !optimizedMode ? hasRated : optimizedMode, // ✅ logic for optimized mode
          conversation_id: conversationId, // ✅ include conversationId
        }),
      });
      if (!res.ok) throw new Error("Backend request failed");
      return await res.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI responses.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ----------------- SUBMIT -----------------
  const handleSubmit = async () => {
    if (!input.trim()) return;

    const messageId = Date.now().toString();
    const placeholderResponses: AIResponse[] = ["openai", "gemini", "grok"].map(
      (model) => ({
        id: `${messageId}-${model}`,
        responseId: 0,
        model: model as "openai" | "gemini" | "grok",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      })
    );

    const newMessage: ChatMessage = {
      id: messageId,
      prompt: input,
      responses: placeholderResponses,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await callBackend(input);

      // ✅ Set conversationId if new
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const responses: AIResponse[] = Object.entries(data.responses).map(
        ([model, content]) => ({
          id: `${messageId}-${model}`,
          responseId: 0,
          model: model as "openai" | "gemini" | "grok",
          content: String(content),
          timestamp: new Date(),
          isLoading: false,
        })
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                responses,
                promptId: data.prompt_id,
                domain: data.domain,
                optimizedModel:
                  data.mode === "rated"
                    ? data.providers_used.join(", ")
                    : undefined,
              }
            : msg
        )
      );
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                responses: msg.responses.map((r) => ({
                  ...r,
                  isLoading: false,
                  content: "Error fetching response",
                })),
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------- NEW CHAT -----------------
  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    toast({ title: "New Chat", description: "Started a fresh conversation." });
  };

  // ----------------- FEEDBACK -----------------
  const sendRating = async (
    promptId: number,
    provider: string,
    rating: number
  ) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_id: promptId,
          provider,
          rating,
        }),
      });
    } catch (error) {
      console.error("Failed to send feedback", error);
    }
  };

  const handleRating = (
    messageId: string,
    responseId: string,
    rating: number
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              responses: msg.responses.map((res) =>
                res.id === responseId ? { ...res, rating } : res
              ),
            }
          : msg
      )
    );

    const message = messages.find((m) => m.id === messageId);
    const response = message?.responses.find((r) => r.id === responseId);

    if (message?.promptId && response) {
      sendRating(message.promptId, response.model, rating);
      setHasRated(true);
    }

    toast({
      title: "Rating saved",
      description: "Thank you for your feedback!",
    });
  };

  // ----------------- RENDER -----------------
  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Multi-Model Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Query multiple AI models simultaneously and compare their responses
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* ✅ Optimized toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="optimized-mode">Optimized</Label>
            <Switch
              id="optimized-mode"
              checked={optimizedMode}
              onCheckedChange={setOptimizedMode}
            />
          </div>

          {/* ✅ New Chat */}
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <RefreshCcw className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:bg-transparent
                      [&::-webkit-scrollbar-thumb]:bg-primary/40
                      [&::-webkit-scrollbar-thumb:hover]:bg-primary"
      >
        {messages.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-glass backdrop-blur-glass border-muted">
            <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Start a conversation
            </h2>
            <p className="text-muted-foreground">
              Enter a prompt below to query multiple AI models at once
            </p>
          </Card>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* User Prompt */}
              <div className="flex justify-end">
                <Card className="max-w-3xl p-4 bg-primary text-primary-foreground">
                  <p className="font-medium mb-2">You</p>
                  <p>{message.prompt}</p>
                  {message.domain && (
                    <div className="mt-3 flex items-center gap-2">
                      <DomainIndicator domain={message.domain} />
                      {message.optimizedModel && (
                        <Badge
                          variant="secondary"
                          className="bg-primary-glow text-primary-foreground"
                        >
                          Optimized: {message.optimizedModel}
                        </Badge>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* AI Responses */}
              {message.responses.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {message.responses.map((response) =>
                    response.isLoading ? (
                      <div
                        key={response.id}
                        className="flex justify-center py-6 text-muted-foreground"
                      >
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2 text-sm">
                          Loading {response.model}...
                        </span>
                      </div>
                    ) : (
                      <ResponseCard
                        key={response.id}
                        response={response}
                        onRate={(rating) =>
                          handleRating(message.id, response.id, rating)
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Card className="p-4 bg-card/50 backdrop-blur-glass border-border">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
            className="resize-none bg-input border-border"
            rows={3}
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Querying AI models...</span>
          </div>
        )}
      </Card>
      <HelpButton />
    </div>
  );
}
