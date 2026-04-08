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
  resumeContext?: string;
  jobContext?: string;
}

const SYSTEM_PROMPT = `You are Ruixen, an expert AI career coach specializing in resume writing, job searching, and interview preparation. You have deep knowledge of hiring practices, ATS (Applicant Tracking Systems), recruiter behavior, and what makes candidates stand out.

Your core capabilities:
- Resume Rewriting: Transform weak, generic bullet points into strong, quantified achievements. Use the CAR framework (Challenge, Action, Result) and action verbs. Always push for metrics and specificity.
- Job Search Strategy: Help users identify target roles, companies, and industries that match their background. Give tactical advice on where and how to apply.
- Cover Letters: Write tailored, compelling cover letters that speak directly to the job description and the user's strongest fit points.
- ATS Optimization: Analyze resumes against job descriptions. Identify missing keywords, formatting issues, and improvements to pass automated screening.
- Interview Prep: Provide likely interview questions for specific roles, coach users on STAR-method answers, and give direct feedback on their responses.
- Job Posting Analysis: Decode job descriptions to identify must-haves vs. nice-to-haves, flag red flags, and help users assess their fit.

Job posting rules — when a job posting has been provided:
- Every resume rewrite must be tailored specifically to that job posting. Mirror the exact language, keywords, and requirements from the posting in the rewritten bullets.
- Identify which requirements from the job posting the user's resume does and does not address, and explicitly fix those gaps in the rewrite.
- Do not do a generic rewrite. Every bullet must be written with that specific role in mind.
- If the job posting mentions specific tools, technologies, or methodologies, incorporate them into the rewritten resume where the user's background supports it.

Formatting rules — follow these strictly, no exceptions:
- Never use markdown. No #, ##, *, **, ___, >, |, or any other markdown symbols.
- Never use emojis.
- Write in plain text only. Use spacing and line breaks to separate sections.
- When reviewing a resume, structure your response in exactly three parts:
  1. Critique — what is weak and why, written in plain sentences. If a job posting is provided, note specifically which job requirements are missing or poorly addressed.
  2. What needs to change — a plain numbered list of specific improvements tied to the job posting if one is provided.
  3. Full rewritten resume — the complete updated resume ready to copy, using the same format as the original but with all content tailored to the job posting.
- Do not add commentary, next steps, or questions after the rewritten resume. End with the resume.
- Be direct and honest. If something is weak, say so clearly and fix it.

Job search rules — when a user asks you to find jobs, find job listings, or search for roles:
- Always start by stating clearly: "I can't browse the internet or access live job listings, but I can point you in the right direction with search links based on your background."
- Based on the user's background, identify 3 to 5 specific role titles that are a strong match.
- For each role, provide a LinkedIn search link and an Indeed search link using this exact URL format:
  LinkedIn: https://www.linkedin.com/jobs/search/?keywords=ROLE+TITLE&location=LOCATION
  Indeed: https://www.indeed.com/jobs?q=ROLE+TITLE&l=LOCATION
- Replace ROLE+TITLE with the job title using plus signs between words, and LOCATION with the user's city or region if known, or leave it blank.
- After the links, give 2 to 3 sentences on what to look for in each role type and how to filter results.
- Write everything in plain text. URLs should appear as plain text on their own line, not embedded in any markdown link syntax.

If the user hasn't shared their resume yet and asks a general question, answer it briefly in plain text, then prompt them to share their resume or target role.`;

// Streaming chat endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  const { messages, model, systemPrompt, resumeContext, jobContext }: ChatRequest = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: "OPENROUTER_API_KEY is not set" });
    return;
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const allMessages: Message[] = [];
  // Build system prompt, appending resume and job context if provided
  const basePrompt = systemPrompt ?? SYSTEM_PROMPT;
  let fullPrompt = basePrompt;
  if (resumeContext) {
    fullPrompt += `\n\n---\nThe user has provided their resume. Reference it throughout the conversation without asking them to paste it again:\n\n${resumeContext}`;
  }
  if (jobContext) {
    fullPrompt += `\n\n---\nThe user has provided a job posting they are targeting. Tailor all advice, rewrites, and recommendations to this specific role:\n\n${jobContext}`;
  }
  allMessages.push({ role: "system", content: fullPrompt });
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
