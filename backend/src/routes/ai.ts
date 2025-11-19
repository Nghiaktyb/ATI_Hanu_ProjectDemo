import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { tfidfScore } from "../utils/tfidf";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All AI routes require authentication
router.use(authenticate);
const upload = multer({ dest: "uploads/" });
const DOCS_DIR = path.join(process.cwd(), "data", "docs");
const METADATA_FILE = path.join(process.cwd(), "data", "docs_metadata.json");

// Helper functions for metadata management
function loadMetadata(): Record<string, { originalName: string; uploadedAt: string }> {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const content = fs.readFileSync(METADATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('[loadMetadata] Error:', e);
  }
  return {};
}

function saveMetadata(metadata: Record<string, { originalName: string; uploadedAt: string }>) {
  try {
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  } catch (e) {
    console.error('[saveMetadata] Error:', e);
  }
}

// Improved error handling and logging
async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  console.log(`[extractTextFromFile] Processing: ${path.basename(filePath)} (${ext})`);
  
  try {
    // Plain text files
    if (ext === '.txt' || ext === '.md' || ext === '.csv') {
      let text = fs.readFileSync(filePath, 'utf-8');
      
      // Remove BOM (Byte Order Mark) if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
        console.log(`[extractTextFromFile] Removed BOM from ${path.basename(filePath)}`);
      }
      
      console.log(`[extractTextFromFile] Text file parsed: ${text.length} chars`);
      return text;
    }

    // PDF files
    if (ext === '.pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default as any;
        const data = await pdfParse(fs.readFileSync(filePath));
        const text = String(data?.text || '');
        console.log(`[extractTextFromFile] PDF parsed: ${text.length} chars`);
        return text;
      } catch (e) {
        console.error('[extractTextFromFile] PDF parse failed:', e);
        return '';
      }
    }

    // DOCX files
    if (ext === '.docx') {
      try {
        const mammothMod = await import('mammoth');
        const mammoth: any = (mammothMod as any).default || mammothMod;
        const res: any = await mammoth.extractRawText({ path: filePath });
        let text = String(res?.value || '');
        
        // If mammoth returns empty, try XML fallback
        if (text.trim().length === 0) {
          console.log('[extractTextFromFile] Mammoth empty, trying ZIP fallback...');
          try {
            const { default: JSZip } = await import('jszip');
            const buf = fs.readFileSync(filePath);
            const zip = await JSZip.loadAsync(buf);
            const parts = [
              'word/document.xml',
              'word/header1.xml','word/header2.xml','word/header3.xml',
              'word/footer1.xml','word/footer2.xml','word/footer3.xml',
            ];
            let combined = '';
            for (const p of parts) {
              const f = zip.file(p);
              if (!f) continue;
              const xml = await f.async('string');
              // Strip XML tags
              combined += '\n' + xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            text = combined.trim();
          } catch (e2) {
            console.error('[extractTextFromFile] DOCX zip fallback failed:', e2);
          }
        }
        
        console.log(`[extractTextFromFile] DOCX parsed: ${text.length} chars`);
        return text;
      } catch (e) {
        console.error('[extractTextFromFile] DOCX parse failed:', e);
        return '';
      }
    }

    // XLSX files
    if (ext === '.xlsx' || ext === '.xls') {
      try {
        const xlsxMod = await import('xlsx');
        const xlsx: any = (xlsxMod as any).default || xlsxMod;
        const wb = xlsx.read(fs.readFileSync(filePath), { type: 'buffer' });
        let out = '';
        for (const name of wb.SheetNames) {
          const sheet = wb.Sheets[name];
          if (sheet) {
            out += `\n=== Sheet: ${name} ===\n`;
            out += xlsx.utils.sheet_to_csv(sheet) + '\n';
          }
        }
        console.log(`[extractTextFromFile] XLSX parsed: ${out.length} chars`);
        return out;
      } catch (e) {
        console.error('[extractTextFromFile] XLSX parse failed:', e);
        return '';
      }
    }

    // Image files (OCR)
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        try {
          const buf = fs.readFileSync(filePath);
          const { data: { text } }: any = await worker.recognize(buf);
          await worker.terminate();
          console.log(`[extractTextFromFile] Image OCR: ${text.length} chars`);
          return String(text || '');
        } catch (ocrErr) {
          try { await worker.terminate(); } catch {}
          console.error('[extractTextFromFile] Image OCR failed:', ocrErr);
          return '';
        }
      } catch (e) {
        console.error('[extractTextFromFile] Tesseract load failed:', e);
        return '';
      }
    }

    console.warn(`[extractTextFromFile] Unsupported file type: ${ext}`);
    return '';
  } catch (e) {
    console.error(`[extractTextFromFile] Unexpected error for ${filePath}:`, e);
    return '';
  }
}

// Load all docs with better filtering
async function loadDocs(): Promise<{ name: string; text: string }[]> {
  if (!fs.existsSync(DOCS_DIR)) {
    console.warn('[loadDocs] Directory does not exist:', DOCS_DIR);
    return [];
  }
  
  const files = fs.readdirSync(DOCS_DIR);
  console.log(`[loadDocs] Found ${files.length} files in ${DOCS_DIR}`);
  
  // Support all file types
  const supported = files.filter((f) => /\.(md|txt|csv|pdf|docx?|xlsx?|png|jpe?g)$/i.test(f));
  console.log(`[loadDocs] Supported files: ${supported.length}`, supported);
  
  const out: { name: string; text: string }[] = [];
  
  for (const name of supported) {
    const fp = path.join(DOCS_DIR, name);
    const text = await extractTextFromFile(fp);
    
    if (text && text.trim().length > 0) {
      out.push({ name, text });
      console.log(`[loadDocs] Added: ${name} (${text.length} chars)`);
    } else {
      console.warn(`[loadDocs] Skipped (empty): ${name}`);
    }
  }
  
  console.log(`[loadDocs] Total indexed: ${out.length} documents`);
  return out;
}

// Main chat route - TF-IDF + Gemini AI
// All authenticated users can use the chat (staff training feature)
router.post("/chat", async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  console.log(`[/ai/chat] Question: "${message}"`);
  
  const docs = await loadDocs();
  
  if (docs.length === 0) {
    console.warn('[/ai/chat] No documents indexed');
    return res.json({ 
      answer: "No documents found. Please upload some documents first (PDF, DOCX, XLSX, TXT, MD, CSV).", 
      citations: [] 
    });
  }

  // TF-IDF: Find top 3 relevant documents
  const corpus = docs.map((d) => d.text);
  const scored = docs
    .map((d) => ({
      name: d.name,
      text: d.text,
      score: tfidfScore(d.text, message, corpus),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log('[/ai/chat] Top 3 docs:', scored.map(s => `${s.name} (${s.score.toFixed(4)})`));
  
  // If top score is too low, return all docs (CSV might need full context)
  const topScore = scored[0]?.score || 0;
  const shouldUseAll = topScore < 0.1 || docs.length === 1;
  
  const docsToUse = shouldUseAll ? docs.map(d => ({ ...d, score: 1 })) : scored;
  
  // For CSV files, use much larger snippets (up to 30KB to fit ~100 rows)
  const isCSV = docsToUse[0]?.name.toLowerCase().endsWith('.csv');
  const snippetSize = isCSV ? 30000 : 3000;
  
  const snippets = docsToUse.map((s) => s.text.slice(0, snippetSize)); // Increased from 1000
  const contextText =
    `Here are relevant documents:\n\n` +
    snippets.map((t, i) => {
      const doc = docsToUse[i];
      const isCSV = doc.name.toLowerCase().endsWith('.csv');
      if (isCSV) {
        return `Document #${i + 1} (CSV data - ${doc.name}):\n${t}\n`;
      }
      return `Document #${i + 1}:\n${t}\n`;
    }).join("\n---\n\n");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[/ai/chat] GEMINI_API_KEY not configured');
    return res.status(500).json({ 
      error: "AI service is not configured. Please set GEMINI_API_KEY environment variable." 
    });
  }

  try {
    const isCSV = docsToUse[0]?.name.toLowerCase().endsWith('.csv');
    
    const systemPrompt = isCSV 
      ? `You are a data analyst assistant. The context below contains CSV data with employee information.

Question: ${message}

CSV Data:
${contextText}

IMPORTANT INSTRUCTIONS:
- This is CSV (comma-separated values) data with headers in the first row
- Each subsequent row represents one employee record
- When asked about "all employees" or "100 employees", analyze ALL rows provided
- For questions about highest/lowest values, compare ALL rows, not just a sample
- For counting questions, count ALL matching rows in the dataset
- Always specify the employee name (FullName column) in your answer
- If calculations are needed, show the specific values you found
- Answer in Vietnamese if the question is in Vietnamese

Example: "Highest salary: Nguyễn Văn A with 50,000,000 VND (NetSalary_VND column)"`
      : `You are a helpful assistant that answers questions based on provided documents.

Question: ${message}

Context from documents:
${contextText}

Instructions:
- Answer the question directly based on the context above
- If the answer is not in the context, say so clearly
- Keep your answer concise and accurate`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
          ],
        }),
      }
    );

    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("[/ai/chat] Gemini returned invalid JSON:", text.substring(0, 500));
      return res.status(500).json({ error: "Invalid response from Gemini API" });
    }
    
    if (!response.ok) {
      console.error("[/ai/chat] Gemini API error:", JSON.stringify(data, null, 2));
      const errorMessage = data?.error?.message || data?.error?.status || "AI request failed";
      console.error(`[/ai/chat] Error details: Status ${response.status}, Message: ${errorMessage}`);
      return res.status(response.status).json({ error: errorMessage });
    }

    console.log("[/ai/chat] Gemini response received");

    const aiAnswer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Sorry, I couldn't generate an answer.";

    res.json({
      answer: aiAnswer,
      citations: docsToUse.map((s) => ({
        doc: s.name,
        score: Number(s.score.toFixed(4)),
      })),
    });
  } catch (err) {
    console.error("[/ai/chat] Gemini API error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// Upload document - Only Admin/Manager can upload documents
router.post("/documents/upload", authorize('admin', 'manager'), upload.single("file"), (req, res) => {
  try {
  if (!req.file) return res.status(400).json({ error: "file required" });
  
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  const ext = path.extname(req.file.originalname).toLowerCase() || ".txt";
    const storedName = req.file.filename + ext;
    const dest = path.join(DOCS_DIR, storedName);
    
    // Use copyFileSync instead of renameSync to handle cross-device issues in Docker
    fs.copyFileSync(req.file.path, dest);
    fs.unlinkSync(req.file.path); // Delete the temporary file
    
    // Save metadata with original filename
    const metadata = loadMetadata();
    metadata[storedName] = {
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString()
    };
    saveMetadata(metadata);
  
    console.log(`[/ai/documents/upload] Uploaded: ${req.file.originalname} → ${storedName}`);
  
  res.status(201).json({ 
      storedAs: storedName,
    originalName: req.file.originalname
  });
  } catch (e: any) {
    console.error('[/ai/documents/upload] Error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// List documents
router.get('/documents', (_req, res) => {
  try {
    if (!fs.existsSync(DOCS_DIR)) return res.json({ files: [] });
    
    const metadata = loadMetadata();
    
    const files = fs.readdirSync(DOCS_DIR)
      .filter(f => /\.(md|txt|csv|pdf|docx?|xlsx?|png|jpe?g)$/i.test(f))
      .map((storedName) => {
        const filePath = path.join(DOCS_DIR, storedName);
        const stats = fs.statSync(filePath);
        const meta = metadata[storedName];
        
        return { 
          storedName, // Keep stored name for deletion
          name: meta?.originalName || storedName, // Display original name
          size: stats.size,
          uploadedAt: meta?.uploadedAt || stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    res.json({ files });
  } catch (e) {
    console.error('[/ai/documents] Error:', e);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Delete document - Only Admin/Manager can delete documents
router.delete('/documents/:name', authorize('admin', 'manager'), (req, res) => {
  try {
    const fileName = req.params.name;
    // Security: prevent path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({ error: 'Invalid file name' });
    }
    
    const filePath = path.join(DOCS_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Remove from metadata
    const metadata = loadMetadata();
    if (metadata[fileName]) {
      delete metadata[fileName];
      saveMetadata(metadata);
    }
    
    fs.unlinkSync(filePath);
    console.log(`[/ai/documents/:name] Deleted: ${fileName}`);
    
    res.status(204).end();
  } catch (e: any) {
    console.error('[/ai/documents/:name] Delete error:', e);
    res.status(500).json({ error: e.message || 'Failed to delete document' });
  }
});

// Debug: show parsed text length for each file
router.get('/documents/parsed', async (_req, res) => {
  try {
    if (!fs.existsSync(DOCS_DIR)) return res.json({ files: [] });
    
    const names = fs.readdirSync(DOCS_DIR)
      .filter((f) => /\.(md|txt|csv|pdf|docx?|xlsx?|png|jpe?g)$/i.test(f));
    
    const items: any[] = [];
    
    for (const name of names) {
      const fp = path.join(DOCS_DIR, name);
      const size = fs.statSync(fp).size;
      const text = await extractTextFromFile(fp);
      items.push({ 
        name, 
        size, 
        parsedChars: (text || '').length,
        hasContent: (text || '').trim().length > 0
      });
    }
    
    res.json({ files: items });
  } catch (e) {
    console.error('[/ai/documents/parsed] Error:', e);
    res.status(500).json({ error: 'Failed to parse documents' });
  }
});

export default router;