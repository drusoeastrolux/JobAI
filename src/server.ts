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
  if (systemPrompt) {
    allMessages.push({ role: "system", content: systemPrompt });
  }
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

app.listen(PORT, () => {
  console.log(`ChatAgent running at http://localhost:${PORT}`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("Warning: OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your key.");
  }
});
