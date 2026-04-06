import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
  StopCircle,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function RuixenMoonChat() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const hasMessages = history.length > 0 || isStreaming;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingContent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setError("");
    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setMessage("");
    adjustHeight(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? res.statusText);
      }

      const reader = res.body!.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              accumulated += parsed.content;
              setStreamingContent(accumulated);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: accumulated },
      ]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setHistory((prev) => [...prev, { role: "assistant", content: `⚠ ${msg}` }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      readerRef.current = null;
    }
  }, [history, isStreaming, adjustHeight]);

  const handleStop = () => {
    readerRef.current?.cancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex flex-col items-center"
      style={{
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Center area: title or chat history */}
      <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden">
        {!hasMessages ? (
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-white drop-shadow-sm">
              Ruixen AI
            </h1>
            <p className="mt-2 text-neutral-200">
              Build something amazing — just start typing below.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl px-4 h-full overflow-y-auto py-6 flex flex-col gap-4">
            {history.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    ✦
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-br-sm"
                      : "bg-black/50 backdrop-blur-sm border border-white/10 text-neutral-100 rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/80 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🧑
                  </div>
                )}
              </div>
            ))}

            {/* Streaming response */}
            {isStreaming && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ✦
                </div>
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-black/50 backdrop-blur-sm border border-white/10 text-neutral-100">
                  {streamingContent || (
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                  {streamingContent && <span className="animate-pulse text-indigo-400">▌</span>}
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">
                ⚠ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Section */}
      <div className="w-full max-w-3xl mb-[8vh] px-4">
        <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your request..."
            disabled={isStreaming}
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-white text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[48px]",
              "disabled:opacity-60"
            )}
            style={{ overflow: "hidden" }}
          />

          <div className="flex items-center justify-between p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-700"
              disabled={isStreaming}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="text-xs">Stop</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => sendMessage(message)}
                  disabled={!message.trim()}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    message.trim()
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions — only on landing */}
        {!hasMessages && (
          <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
            <QuickAction
              icon={<Code2 className="w-4 h-4" />}
              label="Generate Code"
              onClick={() => sendMessage("Generate a React component for a dashboard")}
            />
            <QuickAction
              icon={<Rocket className="w-4 h-4" />}
              label="Launch App"
              onClick={() => sendMessage("How do I deploy a Node.js app to production?")}
            />
            <QuickAction
              icon={<Layers className="w-4 h-4" />}
              label="UI Components"
              onClick={() => sendMessage("Suggest modern UI components for a SaaS app")}
            />
            <QuickAction
              icon={<Palette className="w-4 h-4" />}
              label="Theme Ideas"
              onClick={() => sendMessage("Give me 3 color palette ideas for a dark mode app")}
            />
            <QuickAction
              icon={<CircleUserRound className="w-4 h-4" />}
              label="User Dashboard"
              onClick={() => sendMessage("Design a user dashboard layout with key metrics")}
            />
            <QuickAction
              icon={<MonitorIcon className="w-4 h-4" />}
              label="Landing Page"
              onClick={() => sendMessage("Write copy for a SaaS landing page hero section")}
            />
            <QuickAction
              icon={<FileUp className="w-4 h-4" />}
              label="Upload Docs"
              onClick={() => sendMessage("How do I handle file uploads in an Express API?")}
            />
            <QuickAction
              icon={<ImageIcon className="w-4 h-4" />}
              label="Image Assets"
              onClick={() => sendMessage("What are best practices for optimizing images in web apps?")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
