import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpIcon,
  ArrowDownIcon,
  StopCircle,
  FileText,
  Briefcase,
  MessageSquare,
  PenLine,
  Search,
  ClipboardCheck,
  X,
  Check,
  Link,
  SquarePen,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Palette (matches landing page)
   bg:      #F5F2EC  warm cream
   ink:     #1A1714  warm near-black
   sienna:  #BF4E30  terracotta accent
   muted:   #6B6560  warm gray
   subtle:  #9E9892  lighter warm gray
   border:  #E8E4DF  warm rule
───────────────────────────────────────────────────────────────────────────── */

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
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
      if (reset) { textarea.style.height = `${minHeight}px`; return; }
      textarea.style.height = `${minHeight}px`;
      textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Infinity))}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface RuixenMoonChatProps {
  onBack?: () => void;
}

const quickActions = [
  { icon: FileText,      label: "Revise my resume",      prompt: "I'd like help revising my resume. Let me paste it and tell you the role I'm targeting." },
  { icon: Briefcase,     label: "Find matching jobs",     prompt: "Can you help me find job roles that match my background? I'll describe my experience and what I'm looking for." },
  { icon: MessageSquare, label: "Prep for an interview",  prompt: "I have an upcoming interview and want to practice. Can you give me likely questions for my role and give feedback on my answers?" },
  { icon: PenLine,       label: "Write a cover letter",   prompt: "Help me write a cover letter. I'll share the job description and my resume." },
  { icon: Search,        label: "Optimize for ATS",       prompt: "I want to optimize my resume for ATS systems. Can you analyze it and suggest improvements?" },
  { icon: ClipboardCheck,label: "Review a job posting",   prompt: "I found a job posting I'm interested in. Can you help me assess my fit and identify what to emphasize in my application?" },
];

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderMessageContent(content: string) {
  const parts = content.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#BF4E30] underline decoration-[#BF4E30]/30 underline-offset-2 hover:decoration-[#BF4E30] transition-colors duration-150 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

const STORAGE_KEY = "ruixen_chat_history";
const RESUME_KEY  = "ruixen_resume";
const JOB_KEY     = "ruixen_job_posting";

const GREETING: Message = {
  role: "assistant",
  content: "Paste your resume, share a job posting, or tell me what you're working on — I'll help you stand out.",
  timestamp: Date.now(),
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export default function RuixenMoonChat({ onBack }: RuixenMoonChatProps) {
  const [message, setMessage]               = useState("");
  const [history, setHistory]               = useState<Message[]>(() => loadFromStorage<Message[]>(STORAGE_KEY, [GREETING]));
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming]        = useState(false);
  const [error, setError]                   = useState("");
  const [chatKey, setChatKey]               = useState(0);
  const [showScrollBtn, setShowScrollBtn]   = useState(false);

  const [resume, setResumeState]            = useState<string>(() => loadFromStorage<string>(RESUME_KEY, ""));
  const [resumeDraft, setResumeDraft]       = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [jobPosting, setJobPostingState]    = useState<string>(() => loadFromStorage<string>(JOB_KEY, ""));
  const [jobPostingDraft, setJobPostingDraft] = useState("");
  const [showJobModal, setShowJobModal]     = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }, [history]);

  const setResume = (val: string) => { setResumeState(val); localStorage.setItem(RESUME_KEY, JSON.stringify(val)); };
  const setJobPosting = (val: string) => { setJobPostingState(val); localStorage.setItem(JOB_KEY, JSON.stringify(val)); };

  const clearHistory = () => {
    const fresh = { ...GREETING, timestamp: Date.now() };
    setHistory([fresh]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fresh]));
    setChatKey((k) => k + 1);
  };

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const readerRef         = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isNearBottomRef   = useRef(true);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 48, maxHeight: 160 });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = dist < 220;
    setShowScrollBtn(!isNearBottomRef.current);
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingContent]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); setShowScrollBtn(false); };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setError("");
      const userMsg: Message = { role: "user", content: text.trim(), timestamp: Date.now() };
      const updated = [...history, userMsg];
      setHistory(updated);
      setMessage("");
      adjustHeight(true);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated,
            ...(resume     ? { resumeContext: resume }     : {}),
            ...(jobPosting ? { jobContext: jobPosting }    : {}),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? res.statusText);
        }

        const reader  = res.body!.getReader();
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
              if (parsed.content) { accumulated += parsed.content; setStreamingContent(accumulated); }
            } catch (e) { if (e instanceof SyntaxError) continue; throw e; }
          }
        }
        setHistory((prev) => [...prev, { role: "assistant", content: accumulated, timestamp: Date.now() }]);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        readerRef.current = null;
      }
    },
    [history, isStreaming, adjustHeight, resume, jobPosting]
  );

  const handleStop    = () => readerRef.current?.cancel();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(message); }
  };

  const openResumeModal  = () => { setResumeDraft(resume); setShowResumeModal(true); };
  const saveResume       = () => { setResume(resumeDraft.trim()); setShowResumeModal(false); };
  const removeResume     = () => { setResume(""); setResumeDraft(""); setShowResumeModal(false); };

  const openJobModal     = () => { setJobPostingDraft(jobPosting); setShowJobModal(true); };
  const saveJobPosting   = () => { setJobPosting(jobPostingDraft.trim()); setShowJobModal(false); };
  const removeJobPosting = () => { setJobPosting(""); setJobPostingDraft(""); setShowJobModal(false); };

  /* ── Shared modal shell ────────────────────────────────────────────────── */
  const Modal = ({
    title, subtitle, value, onChange, placeholder,
    onClose, onSave, onRemove, hasExisting, disabled,
  }: {
    title: string; subtitle: string; value: string;
    onChange: (v: string) => void; placeholder: string;
    onClose: () => void; onSave: () => void; onRemove: () => void;
    hasExisting: boolean; disabled: boolean;
  }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1714]/15 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8E4DF] shadow-[0_24px_64px_rgba(26,23,20,0.12)] w-full max-w-2xl flex flex-col max-h-[80dvh]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#E8E4DF]">
          <div>
            <h3 className="font-headline italic text-xl text-[#1A1714] tracking-tight">{title}</h3>
            <p className="text-xs text-[#9E9892] mt-0.5 font-sans">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9E9892] hover:text-[#1A1714] hover:bg-[#F5F2EC] transition-all duration-200"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full px-7 py-5 text-sm text-[#1A1714] bg-transparent resize-none focus:outline-none placeholder:text-[#C8C4BF] leading-relaxed min-h-[300px] font-sans"
          autoFocus
        />
        <div className="flex items-center justify-between px-7 py-4 border-t border-[#E8E4DF]">
          {hasExisting ? (
            <button onClick={onRemove} className="text-xs text-[#9E9892] hover:text-[#BF4E30] transition-colors duration-200 font-sans">
              Remove
            </button>
          ) : <span />}
          <button
            onClick={onSave}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 text-xs font-medium transition-all duration-200 active:scale-[0.98] font-sans",
              !disabled
                ? "bg-[#1A1714] text-white hover:bg-[#BF4E30]"
                : "bg-[#E8E4DF] text-[#C8C4BF] cursor-not-allowed"
            )}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EC] font-sans flex flex-col">

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          zIndex: 999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "192px 192px",
        }}
      />

      {/* Resume Modal */}
      {showResumeModal && (
        <Modal
          title="Your Resume"
          subtitle="Avenue will reference this in every response."
          value={resumeDraft}
          onChange={setResumeDraft}
          placeholder="Paste your full resume here..."
          onClose={() => setShowResumeModal(false)}
          onSave={saveResume}
          onRemove={removeResume}
          hasExisting={!!resume}
          disabled={!resumeDraft.trim()}
        />
      )}

      {/* Job Posting Modal */}
      {showJobModal && (
        <Modal
          title="Job Posting"
          subtitle="Avenue will tailor all advice to this role."
          value={jobPostingDraft}
          onChange={setJobPostingDraft}
          placeholder="Paste the full job description here..."
          onClose={() => setShowJobModal(false)}
          onSave={saveJobPosting}
          onRemove={removeJobPosting}
          hasExisting={!!jobPosting}
          disabled={!jobPostingDraft.trim()}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#F5F2EC]/92 backdrop-blur-sm border-b border-[#E8E4DF]">
        <div className="flex items-center gap-5">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-[#9E9892] text-xs hover:text-[#1A1714] transition-colors duration-200 font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <span className="text-[#E8E4DF] select-none">|</span>
            </>
          )}
          <span className="font-headline italic text-xl text-[#1A1714] tracking-tight">Avenue</span>
          <span className="hidden sm:block text-xs text-[#9E9892] font-sans tracking-wide">Career Studio</span>
        </div>

        <button
          onClick={clearHistory}
          disabled={isStreaming}
          className="flex items-center gap-1.5 text-[#9E9892] text-xs hover:text-[#1A1714] transition-colors duration-200 disabled:opacity-40 font-sans"
        >
          <SquarePen className="w-3.5 h-3.5" />
          New chat
        </button>
      </header>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-[1]"
      >
        <div className="max-w-3xl mx-auto px-4 w-full">
          <div key={chatKey} className="flex flex-col gap-6 py-10">

            {history.map((msg, i) => {

              /* Greeting — centered welcome */
              if (i === 0 && msg.role === "assistant") {
                return (
                  <div key={i} className="flex flex-col items-center text-center pt-8 pb-4 px-4 animate-fade-in-up">
                    <div className="w-12 h-12 bg-[#1A1714] flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(26,23,20,0.15)]">
                      <span className="font-headline italic text-base text-white leading-none">A</span>
                    </div>
                    <p className="font-headline italic text-2xl text-[#1A1714] mb-3 tracking-tight">Avenue</p>
                    <p className="text-sm text-[#6B6560] max-w-[40ch] leading-relaxed font-sans">{msg.content}</p>
                  </div>
                );
              }

              /* Regular message bubbles */
              return (
                <div
                  key={i}
                  className={cn("group flex gap-3 w-full animate-fade-in-up", msg.role === "user" ? "justify-end" : "justify-start")}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-[#1A1714] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(26,23,20,0.2)]">
                      <span className="font-headline italic text-[10px] text-white leading-none">A</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[78%]">
                    <div className={cn(
                      "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-[#1A1714] text-[#F5F2EC] rounded-[18px] rounded-br-[4px] shadow-[0_2px_12px_rgba(26,23,20,0.2)]"
                        : "bg-white border border-[#E8E4DF] text-[#6B6560] rounded-[18px] rounded-bl-[4px] shadow-[0_2px_12px_rgba(26,23,20,0.04)]"
                    )}>
                      {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                    </div>
                    <span className={cn(
                      "text-[10px] text-[#C8C4BF] opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-sans",
                      msg.role === "user" ? "text-right" : "text-left pl-1"
                    )}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {msg.role === "user" && <div className="w-7 h-7 flex-shrink-0" />}
                </div>
              );
            })}

            {/* Quick actions */}
            {!isStreaming && (
              <div className="flex flex-wrap gap-2 justify-center pt-2 animate-fade-in-up delay-200">
                {quickActions.map((action, i) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[#6B6560] text-xs font-medium border border-[#E8E4DF] bg-white hover:border-[#BF4E30] hover:text-[#BF4E30] hover:bg-[#F5F2EC] transition-all duration-200 active:scale-[0.98] shadow-[0_1px_3px_rgba(26,23,20,0.04)]"
                    style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                  >
                    <action.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Streaming response */}
            {isStreaming && (
              <div className="flex gap-3 justify-start animate-fade-in-up">
                <div className="w-7 h-7 bg-[#1A1714] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(26,23,20,0.2)]">
                  <span className="font-headline italic text-[10px] text-white leading-none">A</span>
                </div>
                <div className="max-w-[78%] px-4 py-3 rounded-[18px] rounded-bl-[4px] text-sm leading-relaxed bg-white border border-[#E8E4DF] text-[#6B6560] shadow-[0_2px_12px_rgba(26,23,20,0.04)]">
                  {streamingContent || (
                    <span className="flex gap-1.5 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8C4BF] animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8C4BF] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8C4BF] animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                  {streamingContent && (
                    <span className="inline-block w-0.5 h-3.5 bg-[#9E9892] ml-0.5 animate-blink align-text-bottom" />
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center text-[#6B6560] text-sm bg-white border border-[#E8E4DF] px-5 py-3 max-w-md mx-auto shadow-[0_2px_8px_rgba(26,23,20,0.04)] font-sans">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 z-20 w-9 h-9 flex items-center justify-center bg-white border border-[#E8E4DF] shadow-[0_4px_16px_rgba(26,23,20,0.08)] text-[#9E9892] hover:text-[#1A1714] hover:border-[#C8C4BF] transition-all duration-200 animate-fade-in-up"
        >
          <ArrowDownIcon className="w-4 h-4" strokeWidth={1.5} />
        </button>
      )}

      {/* ── Input area ───────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-[#F5F2EC]/92 backdrop-blur-sm border-t border-[#E8E4DF] relative z-[1]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="bg-white border border-[#E8E4DF] shadow-[0_4px_24px_rgba(26,23,20,0.07)]">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder="Paste your resume, describe a role, or ask anything..."
              disabled={isStreaming}
              className={cn(
                "w-full px-5 pt-4 pb-1 resize-none border-none rounded-none",
                "bg-transparent text-[#1A1714] text-sm font-sans",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-[#C8C4BF] min-h-[48px]",
                "disabled:opacity-50"
              )}
              style={{ overflow: "hidden" }}
            />

            <div className="flex items-center justify-between px-4 pb-3">
              {/* Context buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={openResumeModal}
                  disabled={isStreaming}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 font-sans",
                    resume
                      ? "bg-[#F0E8E3] text-[#BF4E30] border border-[#E0C8BE] hover:bg-[#EAE0DC]"
                      : "text-[#9E9892] hover:text-[#6B6560] hover:bg-[#F5F2EC] border border-transparent hover:border-[#E8E4DF]"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {resume ? "Resume added" : "Add resume"}
                </button>

                <button
                  type="button"
                  onClick={openJobModal}
                  disabled={isStreaming}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 font-sans",
                    jobPosting
                      ? "bg-[#F7F2E8] text-[#8B6914] border border-[#DDD0A8] hover:bg-[#F0EAD8]"
                      : "text-[#9E9892] hover:text-[#6B6560] hover:bg-[#F5F2EC] border border-transparent hover:border-[#E8E4DF]"
                  )}
                >
                  <Link className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {jobPosting ? "Job added" : "Add job posting"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {message.length > 0 && !isStreaming && (
                  <span className="text-[10px] text-[#C8C4BF] font-sans animate-fade-in-up select-none">
                    Shift + Enter for new line
                  </span>
                )}

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E4DF] text-[#9E9892] text-xs font-medium hover:border-[#1A1714] hover:text-[#1A1714] transition-all duration-200 active:scale-[0.98] font-sans"
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
                      "w-8 h-8 flex items-center justify-center transition-all duration-200 active:scale-[0.97]",
                      message.trim()
                        ? "bg-[#1A1714] text-white hover:bg-[#BF4E30] shadow-[0_2px_8px_rgba(26,23,20,0.2)]"
                        : "bg-[#E8E4DF] text-[#C8C4BF] cursor-not-allowed"
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
