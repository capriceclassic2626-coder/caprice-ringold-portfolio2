import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini
  const genAI = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // API Route: AI Career Insight or Brand Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const response = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: `You are Caprice Ringold's AI Portfolio Assistant. You specialize in Brand Strategy, AI Prompt Engineering, and e-commerce. 
          The user is viewing Caprice's portfolio. 
          Caprice Ringold is an AI professional (Google AI Cert) and brand owner (Classicc Butterfly).
          Provide insights as if you are advising a prospective employer or partner on why Caprice is a top candidate for their specific goal.
          Keep responses concise, professional, and slightly edgy/creative (urban culture feel).`,
        },
        contents: message,
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
