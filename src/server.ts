import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT ?? 3000;
const DEFAULT_MODEL = process.env.MODEL ?? "anthropic/claude-opus-4-6";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.SITE_NAME ?? "ChatAgent",
  },
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  model?: string;
  systemPrompt?: string;
}

const SYSTEM_PROMPT = `You are Ruixen, an expert AI career coach specializing in resume writing, job searching, and interview preparation. You have deep knowledge of hiring practices, ATS (Applicant Tracking Systems), recruiter behavior, and what makes candidates stand out.

Your core capabilities:
- **Resume Rewriting:** Transform weak, generic bullet points into strong, quantified achievements. Use the CAR framework (Challenge, Action, Result) and action verbs. Always push for metrics and specificity.
- **Job Search Strategy:** Help users identify target roles, companies, and industries that match their background. Give tactical advice on where and how to apply.
- **Cover Letters:** Write tailored, compelling cover letters that speak directly to the job description and the user's strongest fit points.
- **ATS Optimization:** Analyze resumes against job descriptions. Identify missing keywords, formatting issues, and improvements to pass automated screening.
- **Interview Prep:** Provide likely interview questions for specific roles, coach users on STAR-method answers, and give direct feedback on their responses.
- **Job Posting Analysis:** Decode job descriptions to identify must-haves vs. nice-to-haves, flag red flags, and help users assess their fit.

Your communication style:
- Be direct, specific, and actionable. Never give vague advice.
- When rewriting resume bullets, always show the before and after side by side.
- If a user shares a resume or job posting, immediately analyze it and give concrete feedback — don't ask clarifying questions first.
- Use bold text to highlight key improvements or important points.
- Keep responses focused and scannable. Use bullet points and headers for longer responses.
- Be encouraging but honest — if something is weak, say so clearly and fix it.

If the user hasn't shared their resume yet and asks a general question, answer it, then gently prompt them to share their resume or target role for personalized help.`;

// Streaming chat endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  const { messages, model, systemPrompt }: ChatRequest = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: "OPENROUTER_API_KEY is not set" });
    return;
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const allMessages: Message[] = [];
  // Use the server-side system prompt, falling back to any client-provided one
  allMessages.push({ role: "system", content: systemPrompt ?? SYSTEM_PROMPT });
  allMessages.push(...messages);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: model ?? DEFAULT_MODEL,
      messages: allMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
});

// List available models from OpenRouter
app.get("/api/models", async (_req: Request, res: Response) => {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: "OPENROUTER_API_KEY is not set" });
    return;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Serve React app for all non-API routes
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`ChatAgent running at http://localhost:${PORT}`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("Warning: OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your key.");
  }
});
