export const MAX_CHUNK_WORDS = 120;
export const CHUNK_OVERLAP = 24;
export const RESULT_LIMIT = 5;

export function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function chunkText(text) {
  const cleaned = normalizeText(text);
  if (!cleaned) return [];
  const words = cleaned.split(' ');
  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(words.length, start + MAX_CHUNK_WORDS);
    const chunk = words.slice(start, end).join(' ');
    if (chunk.length) {
      chunks.push(chunk);
    }
    if (end >= words.length) break;
    start += MAX_CHUNK_WORDS - CHUNK_OVERLAP;
  }

  return chunks;
}

export function createVector(text) {
  const vector = new Array(128).fill(0);
  for (const char of text.toLowerCase()) {
    if (/[a-z0-9]/.test(char)) {
      const index = char.charCodeAt(0) % 128;
      vector[index] += 1;
    }
  }

  const magnitude = Math.hypot(...vector);
  return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
}

export function cosineSimilarity(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function formatScore(score) {
  return `${Math.round(score * 1000) / 1000}`;
}

export function extractSnippet(text, query) {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const terms = normalizedQuery.split(' ').filter(Boolean);
  const lowerText = text.toLowerCase();
  let bestIndex = -1;

  for (const term of terms) {
    const index = lowerText.indexOf(term);
    if (index >= 0 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
    }
  }

  const snippetLength = 180;
  const start = bestIndex >= 0 ? Math.max(0, bestIndex - 40) : 0;
  let snippet = text.slice(start, start + snippetLength).trim();
  if (snippet.length < text.length && !snippet.endsWith('…')) {
    snippet = `${snippet}…`;
  }

  return snippet;
}
