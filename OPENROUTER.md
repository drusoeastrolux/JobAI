# OpenRouter — Simple Explanation

## What is OpenRouter?

OpenRouter is a middleman service that lets you access many different AI models (like ChatGPT, Claude, Llama, Gemma) using one single API key.

Without OpenRouter, you would need a separate account and API key for each AI company. OpenRouter handles all of that for you. You just talk to OpenRouter, and it talks to whichever AI model you pick.

---

## How Your App Uses It

Your app has two parts: a frontend (what the user sees) and a backend (a server running in the background).

Here is what happens when a user sends a message:

1. The user types a message and hits send.
2. The frontend sends that message to YOUR server.
3. Your server adds the system prompt (the instructions that make the AI act like Ruixen, the career coach).
4. Your server sends everything to OpenRouter.
5. OpenRouter forwards it to the AI model.
6. The AI responds, and OpenRouter sends that response back to your server.
7. Your server streams the response back to the user word by word, which is why it looks like the AI is typing in real time.

---

## Why Not Just Call OpenRouter Directly From the Browser?

Your API key is like a password. If you called OpenRouter directly from the browser, anyone could open the browser's developer tools, find your API key in the network requests, and use it themselves — racking up charges on your account.

By routing through your own server, the API key never leaves your machine. The browser only ever talks to your server at `localhost:3000`.

---

## The Model

The AI model your app uses is set in a file called `.env`:

```
MODEL=openai/gpt-oss-120b:free
```

This tells OpenRouter which AI model to use. The `:free` at the end means it is a free model with no cost but some usage limits.

To switch to a different AI, you just change that one line. Nothing else in the code needs to change.

---

## The System Prompt

Every time a user sends a message, your server secretly adds a set of instructions at the top of the conversation before sending it to the AI. These instructions tell the AI:

- Its name is Ruixen
- It is a career coach
- It should never use markdown symbols or emojis
- It should structure resume reviews in three parts: critique, what to change, and the full rewritten resume
- If a resume or job posting was pasted in, it should use that information

The user never sees these instructions. They just see the AI behaving the way you want it to.

---

## Streaming (The Typing Effect)

When the AI responds, your app does not wait for the full answer before showing it. Instead, the server sends the response one small piece at a time as the AI generates it. The frontend receives those pieces and adds them to the screen one by one.

This is why the response looks like someone typing live. Technically, this is done using a web standard called Server-Sent Events (SSE).

---

## Summary

| Piece | What It Does |
|-------|--------------|
| OpenRouter | Gives access to many AI models with one API key |
| Your Express server | Keeps your API key safe, adds the system prompt, handles streaming |
| The system prompt | Secret instructions that define how the AI behaves |
| `.env` file | Stores your API key and which model to use — never shared publicly |
| Streaming | Sends the AI response word by word so it looks like live typing |
