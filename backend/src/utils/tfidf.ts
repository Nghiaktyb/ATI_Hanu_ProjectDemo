export function tokenize(text: string): string[] {
  // Keep all unicode letters/numbers so Vietnamese and other languages work
  const normalized = (text || '')
    .normalize('NFKC')
    .toLowerCase();
  // Make accent-insensitive for better matching when users omit diacritics
  const noAccents = normalized
    .normalize('NFD')
    .replace(/\p{M}+/gu, '');
  // Replace punctuation with spaces, keep letters/numbers/whitespace (unicode-aware)
  const cleaned = noAccents.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  return cleaned.split(/\s+/).filter(Boolean);
}

export function tfidfScore(doc: string, query: string, corpus: string[]): number {
  const qTokens = tokenize(query);
  const dTokens = tokenize(doc);
  const dFreq: Record<string, number> = {};
  for (const t of dTokens) dFreq[t] = (dFreq[t] || 0) + 1;
  const N = corpus.length;
  let score = 0;
  for (const qt of qTokens) {
    const tf = (dFreq[qt] || 0) / Math.max(1, dTokens.length);
    let df = 0;
    for (const c of corpus) if (tokenize(c).includes(qt)) df++;
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    score += tf * idf;
  }
  return score;
}