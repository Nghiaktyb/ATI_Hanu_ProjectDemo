import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { tfidfScore } from "../utils/tfidf";

const router = Router();
const upload = multer({ dest: "uploads/" });

const DOCS_DIR = path.join(process.cwd(), "data", "docs");

function loadDocs(): { name: string; text: string }[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"));
  return files.map((name) => ({
    name,
    text: fs.readFileSync(path.join(DOCS_DIR, name), "utf-8"),
  }));
}

router.post("/chat", (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });
  const docs = loadDocs();
  if (docs.length === 0)
    return res.json({ answer: "No documents indexed yet.", citations: [] });
  const corpus = docs.map((d) => d.text);
  const scored = docs
    .map((d) => ({
      name: d.name,
      text: d.text,
      score: tfidfScore(d.text, message, corpus),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const snippets = scored.map((s) => s.text.slice(0, 800));
  const answer =
    `Top policies related to your question:\n\n` +
    snippets.map((t, i) => `#${i + 1}: ${t}`).join("\n\n---\n\n");
  res.json({
    answer,
    citations: scored.map((s) => ({
      doc: s.name,
      score: Number(s.score.toFixed(4)),
    })),
  });
});

router.post("/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
  const ext = path.extname(req.file.originalname) || ".txt";
  const dest = path.join(DOCS_DIR, req.file.filename + ext);
  fs.renameSync(req.file.path, dest);
  res.status(201).json({ storedAs: path.basename(dest) });
});

export default router;
