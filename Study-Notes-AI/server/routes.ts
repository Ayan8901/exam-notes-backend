import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import { openai } from "./replit_integrations/image/client";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const NOTE_GENERATION_PROMPT = `You are an exam prep expert. Create ultra-concise, high-yield revision notes.

FORMAT (use ## for sections, - for bullets):

## Definition
- One-line definition only

## Key Points
- 3-5 most important facts
- What examiners ask about

## Formulas
- Key equations (if any)
- Include units

## Must Remember
- Critical facts to memorize
- Common exam traps

STRICT RULES:
- Maximum 8 words per bullet point
- NO explanations or examples
- NO paragraphs - bullets only
- Focus on facts that appear in exams
- Skip sections if not applicable
- Generate a short, clear title (max 5 words)`;

export async function registerRoutes(app: Express): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  app.post(
    "/api/generate-notes",
    upload.array("images", 25),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res.status(400).json({ error: "No images provided" });
        }

        const imageContents = files.map((file) => ({
          type: "image_url" as const,
          image_url: {
            url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          },
        }));

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: NOTE_GENERATION_PROMPT,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract text from these textbook/study material images and convert into exam-focused revision notes:",
                },
                ...imageContents,
              ],
            },
          ],
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content || "";

        const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^##\s+(.+)$/m);
        let title = "Study Notes";
        let noteContent = content;

        if (titleMatch) {
          title = titleMatch[1].trim();
          noteContent = content.replace(titleMatch[0], "").trim();
        } else {
          const firstLine = content.split("\n")[0];
          if (firstLine && !firstLine.startsWith("-") && !firstLine.startsWith("#")) {
            title = firstLine.substring(0, 60);
            noteContent = content.substring(firstLine.length).trim();
          }
        }

        res.json({
          title,
          content: noteContent,
        });
      } catch (error) {
        console.error("Error generating notes from images:", error);
        res.status(500).json({ error: "Failed to generate notes" });
      }
    }
  );

  app.post("/api/generate-notes-from-text", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "No text provided" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: NOTE_GENERATION_PROMPT,
          },
          {
            role: "user",
            content: `Convert the following study material into exam-focused revision notes:\n\n${text}`,
          },
        ],
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || "";

      const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^##\s+(.+)$/m);
      let title = "Study Notes";
      let noteContent = content;

      if (titleMatch) {
        title = titleMatch[1].trim();
        noteContent = content.replace(titleMatch[0], "").trim();
      } else {
        const firstLine = content.split("\n")[0];
        if (firstLine && !firstLine.startsWith("-") && !firstLine.startsWith("#")) {
          title = firstLine.substring(0, 60);
          noteContent = content.substring(firstLine.length).trim();
        }
      }

      res.json({
        title,
        content: noteContent,
      });
    } catch (error) {
      console.error("Error generating notes from text:", error);
      res.status(500).json({ error: "Failed to generate notes" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
