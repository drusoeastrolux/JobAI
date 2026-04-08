import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpIcon,
  StopCircle,
  Paperclip,
  FileText,
  Briefcase,
  MessageSquare,
  PenLine,
  Search,
  ClipboardCheck,
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
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface RuixenMoonChatProps {
  onBack?: () => void;
}

const quickActions = [
  {
    icon: FileText,
    label: "Revise my resume",
    prompt: "I'd like help revising my resume. Let me paste it and tell you the role I'm targeting.",
  },
  {
    icon: Briefcase,
    label: "Find matching jobs",
    prompt: "Can you help me find job roles that match my background? I'll describe my experience and what I'm looking for.",
  },
  {
    icon: MessageSquare,
    label: "Prep for an interview",
    prompt: "I have an upcoming interview and want to practice. Can you give me likely questions for my role and give feedback on my answers?",
  },
  {
    icon: PenLine,
    label: "Write a cover letter",
    prompt: "Help me write a cover letter. I'll share the job description and my resume.",
  },
  {
    icon: Search,
    label: "Optimize for ATS",
    prompt: "I want to optimize my resume for ATS systems. Can you analyze it and suggest improvements?",
  },
  {
    icon: ClipboardCheck,
    label: "Review a job posting",
    prompt: "I found a job posting I'm interested in. Can you help me assess my fit and identify what to emphasize in my application?",
  },
];

export default function RuixenMoonChat({ onBack }: RuixenMoonChatProps) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Ruixen, your AI career coach. Paste your resume, share a job posting, or tell me what you're working on — I'll help you stand out.",
    },
  ]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 160,
  });

  const hasMessages = history.length > 0 || isStreaming;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingContent]);

  const sendMessage = useCallback(
    async (text: string) => {
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
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        readerRef.current = null;
      }
    },
    [history, isStreaming, adjustHeight]
  );

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
    <div className="min-h-[100dvh] bg-[#fafaf9] font-sans flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#fafaf9]/90 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-4">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-zinc-400 text-xs hover:text-zinc-950 transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <span className="text-zinc-200 select-none">|</span>
            </>
          )}
          <span className="font-display text-lg font-medium tracking-tight text-zinc-950">
            Ruixen AI
          </span>
          <span className="hidden sm:block text-xs text-zinc-400 font-sans">
            Career Coach
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          <span className="text-xs text-zinc-400">Online</span>
        </div>
      </header>

      {/* ── Messages / Empty state ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 w-full">

          {!hasMessages ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-8">
                <span className="font-display text-base font-medium text-zinc-500">
                  R
                </span>
              </div>
              <h2 className="font-display text-3xl font-light tracking-tight text-zinc-950 mb-3 leading-tight">
                What would you like
                <br />
                to work on today?
              </h2>
              <p className="text-zinc-400 text-sm max-w-[38ch] mb-10 leading-relaxed">
                Paste your resume, describe a role, or ask anything about your
                job search.
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2 text-zinc-600 text-xs font-medium rounded-full border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950 transition-all duration-200 active:scale-[0.98] bg-white"
                  >
                    <action.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Message list ── */
            <div className="flex flex-col gap-5 py-8">
              {history.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-display text-xs font-medium text-zinc-500">
                        R
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-zinc-950 text-white rounded-br-sm"
                        : "bg-white border border-zinc-100 text-zinc-700 rounded-bl-sm shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Quick actions — show only until user sends first message */}
              {history.length === 1 && !isStreaming && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-center gap-2 px-4 py-2 text-zinc-600 text-xs font-medium rounded-full border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950 transition-all duration-200 active:scale-[0.98] bg-white"
                    >
                      <action.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Streaming response */}
              {isStreaming && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-display text-xs font-medium text-zinc-500">
                      R
                    </span>
                  </div>
                  <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white border border-zinc-100 text-zinc-700 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]">
                    {streamingContent || (
                      <span className="flex gap-1.5 items-center h-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                    {streamingContent && (
                      <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-blink align-text-bottom" />
                    )}
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center text-zinc-500 text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 max-w-md mx-auto">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-[#fafaf9]/90 backdrop-blur-md border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Paste your resume, describe a role, or ask anything..."
              disabled={isStreaming}
              className={cn(
                "w-full px-4 pt-3.5 pb-1 resize-none border-none",
                "bg-transparent text-zinc-900 text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-zinc-300 min-h-[48px]",
                "disabled:opacity-50"
              )}
              style={{ overflow: "hidden" }}
            />

            <div className="flex items-center justify-between px-3 pb-3">
              <button
                type="button"
                disabled={isStreaming}
                className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all duration-200 disabled:opacity-40"
              >
                <Paperclip className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-500 text-xs font-medium hover:border-zinc-400 hover:text-zinc-950 transition-all duration-200 active:scale-[0.98]"
                  >
                    <StopCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendMessage(message)}
                    disabled={!message.trim()}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.97]",
                      message.trim()
                        ? "bg-zinc-950 text-white hover:bg-zinc-700"
                        : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                    )}
                  >
                    <ArrowUpIcon className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
