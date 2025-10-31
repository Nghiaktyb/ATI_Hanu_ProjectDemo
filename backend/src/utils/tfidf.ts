export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
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