import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import {
  normalizeText,
  chunkText,
  createVector,
  cosineSimilarity,
  formatScore,
  extractSnippet,
} from './utils';

describe('Text processing and retrieval utilities', () => {
  describe('normalizeText', () => {
    it('trims whitespace and replaces multiple whitespace characters with single spaces', () => {
      const input = '   Hello \n\t  world!   This is   a test.  ';
      expect(normalizeText(input)).toBe('Hello world! This is a test.');
    });

    it('returns empty string when given empty input or spaces', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText('   \n\t ')).toBe('');
    });
  });

  describe('chunkText', () => {
    it('returns an empty array for empty input', () => {
      expect(chunkText('')).toEqual([]);
    });

    it('returns a single chunk when word count is within MAX_CHUNK_WORDS', () => {
      const text = 'Retrieval Augmented Generation allows LLMs to query external knowledge.';
      const chunks = chunkText(text);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it('splits long text into overlapping chunks', () => {
      const words = Array.from({ length: 200 }, (_, i) => `word${i + 1}`);
      const text = words.join(' ');
      const chunks = chunkText(text);

      expect(chunks.length).toBeGreaterThan(1);
      // First chunk should contain first 120 words
      expect(chunks[0].split(' ')).toHaveLength(120);
      expect(chunks[0]).toContain('word1');
      expect(chunks[0]).toContain('word120');

      // Second chunk should overlap by 24 words (start at word 97)
      expect(chunks[1]).toContain('word97');
    });
  });

  describe('createVector & cosineSimilarity', () => {
    it('generates a 128-element normalized vector for text', () => {
      const vector = createVector('Sample Document');
      expect(vector).toHaveLength(128);

      const magnitude = Math.hypot(...vector);
      expect(magnitude).toBeCloseTo(1, 4);
    });

    it('returns zero vector for non-alphanumeric text', () => {
      const vector = createVector('!!! ??? ---');
      expect(vector).toHaveLength(128);
      expect(vector.every((val) => val === 0)).toBe(true);
    });

    it('calculates perfect similarity (1.0) for identical vectors', () => {
      const vecA = createVector('Document Q&A');
      const vecB = createVector('Document Q&A');
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4);
    });

    it('calculates high similarity for related texts with similar characters', () => {
      const vecA = createVector('React Vite web application');
      const vecB = createVector('React Vite application');
      const sim = cosineSimilarity(vecA, vecB);
      expect(sim).toBeGreaterThan(0.7);
    });
  });

  describe('formatScore', () => {
    it('formats numbers to 3 decimal places string', () => {
      expect(formatScore(0.854932)).toBe('0.855');
      expect(formatScore(1)).toBe('1');
      expect(formatScore(0)).toBe('0');
    });
  });

  describe('extractSnippet', () => {
    it('extracts snippet starting near matching query term', () => {
      const fullText =
        'This is a long introductory passage about document retrieval systems. The quick brown fox jumps over the lazy dog. Vector embeddings are used to calculate cosine similarity between questions and passages.';
      const snippet = extractSnippet(fullText, 'embeddings similarity');
      expect(snippet).toContain('Vector embeddings');
    });

    it('appends ellipsis if snippet is truncated', () => {
      const longText = 'Word '.repeat(100);
      const snippet = extractSnippet(longText, 'word');
      expect(snippet.endsWith('…')).toBe(true);
    });
  });
});

describe('DocQ Component Integration', () => {
  it('renders application header and initial state', () => {
    render(<App />);

    expect(
      screen.getByText('Ask questions about your notes and text instantly.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Documents stored:/i).parentElement).toHaveTextContent('Documents stored: 0');
    expect(screen.getByText(/Text chunks:/i).parentElement).toHaveTextContent('Text chunks: 0');
    expect(
      screen.getByText('No documents indexed yet. Paste text and click “Index document.”')
    ).toBeInTheDocument();
  });

  it('allows indexing a new document and querying it', () => {
    render(<App />);

    const textarea = screen.getByPlaceholderText('Paste your document text here...');
    const addDocButton = screen.getByRole('button', { name: /Add document/i });

    // Step 1: Add a document
    fireEvent.change(textarea, {
      target: {
        value:
          'DocQ is a lightweight React and Vite app designed for local document Q&A and vector retrieval using cosine similarity.',
      },
    });
    fireEvent.click(addDocButton);

    expect(screen.getByText(/Documents stored:/i).parentElement).toHaveTextContent('Documents stored: 1');
    expect(screen.getByText(/Text chunks:/i).parentElement).toHaveTextContent('Text chunks: 1');
    expect(
      screen.getByText('Nice! The document is indexed. Ask a question to see the most relevant passages.')
    ).toBeInTheDocument();

    // Step 2: Query the document
    const queryInput = screen.getByPlaceholderText('What do you want to know?');
    const findAnswersButton = screen.getByRole('button', { name: /Find answers/i });

    fireEvent.change(queryInput, { target: { value: 'vector retrieval' } });
    fireEvent.click(findAnswersButton);

    expect(screen.getByText(/Here are the most relevant passages for “vector retrieval”:/i)).toBeInTheDocument();
    expect(screen.getByText(/Top retrieved chunks/i)).toBeInTheDocument();
  });

  it('handles clearing all state when reset button is clicked', () => {
    render(<App />);

    // Index a doc first
    const textarea = screen.getByPlaceholderText('Paste your document text here...');
    fireEvent.change(textarea, { target: { value: 'Sample note content.' } });
    fireEvent.click(screen.getByRole('button', { name: /Add document/i }));

    expect(screen.getByText(/Documents stored:/i).parentElement).toHaveTextContent('Documents stored: 1');

    // Click clear everything
    fireEvent.click(screen.getByRole('button', { name: /Clear everything/i }));

    expect(screen.getByText(/Documents stored:/i).parentElement).toHaveTextContent('Documents stored: 0');
    expect(screen.getByText(/Text chunks:/i).parentElement).toHaveTextContent('Text chunks: 0');
  });

  it('shows notification when user asks a question without adding a document', () => {
    render(<App />);

    const findAnswersButton = screen.getByRole('button', { name: /Find answers/i });
    fireEvent.click(findAnswersButton);

    expect(
      screen.getByText('Type a question and add a document first, then I can pull back the best matches.')
    ).toBeInTheDocument();
  });
});
