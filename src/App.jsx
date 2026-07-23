import { useMemo, useState } from 'react';
import {
  normalizeText,
  chunkText,
  createVector,
  cosineSimilarity,
  formatScore,
  extractSnippet,
  RESULT_LIMIT,
} from './utils';

function App() {
  const [documents, setDocuments] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [documentText, setDocumentText] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const totalChunks = useMemo(() => chunks.length, [chunks]);

  const addDocument = () => {
    const text = normalizeText(documentText);
    if (!text) return;

    const title = text.split('\n')[0].slice(0, 60) || 'Untitled document';
    const newChunks = chunkText(text).map((chunk) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      text: chunk,
      vector: createVector(chunk),
    }));

    setDocuments((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        text,
        chunkCount: newChunks.length,
      },
    ]);
    setChunks((current) => [...newChunks, ...current]);
    setDocumentText('');
    setAnswer('Nice! The document is indexed. Ask a question to see the most relevant passages.');
  };

  const resetApp = () => {
    setDocuments([]);
    setChunks([]);
    setDocumentText('');
    setQuery('');
    setResults([]);
    setAnswer('');
  };

  const askQuestion = async () => {
    const trimmedQuery = normalizeText(query);
    if (!trimmedQuery || chunks.length === 0) {
      setAnswer('Type a question and add a document first, then I can pull back the best matches.');
      setResults([]);
      return;
    }

    setLoading(true);
    const queryVector = createVector(trimmedQuery);
    const scored = chunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(queryVector, chunk.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, RESULT_LIMIT);

    const filtered = scored.map((item) => ({
      ...item,
      snippet: extractSnippet(item.text, trimmedQuery),
    }));

    setResults(filtered);

    const topText = filtered
      .map((item, index) => `${index + 1}. ${item.snippet}`)
      .join('\n\n');
    const generated =
      filtered.length > 0
        ? `Here are the most relevant passages for “${trimmedQuery}”:\n\n${topText}`
        : 'No matching content found. Try a broader question or add more information.';

    setAnswer(generated);
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <header className="panel header-panel">
        <div>
          <p className="eyebrow">Document Q&A</p>
          <h1>Ask questions about your notes and text instantly.</h1>
          <p className="intro">
            Paste a document, let the app index it, and then ask anything about the content.
            It keeps things simple and works entirely in the browser.
          </p>
        </div>
        <div className="meta-card">
          <p><strong>Documents stored:</strong> {documents.length}</p>
          <p><strong>Text chunks:</strong> {totalChunks}</p>
          <p><strong>Session mode:</strong> Local browser indexing, no server required.</p>
        </div>
      </header>

      <main className="grid-layout">
        <section className="panel card">
          <h2>1. Add a document</h2>
          <p>
            Paste in your text or notes. The app breaks longer documents into smaller pieces so
            it can find the right answer faster.
          </p>
          <textarea
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
            placeholder="Paste your document text here..."
            rows={10}
          />
          <div className="actions-row">
            <button onClick={addDocument} className="primary-button">
              Add document
            </button>
            <button onClick={resetApp} className="secondary-button">
              Clear everything
            </button>
          </div>
        </section>

        <section className="panel card">
          <h2>2. Ask it questions</h2>
          <p>Type a question about the document and get the most relevant snippets back.</p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you want to know?"
          />
          <div className="actions-row">
            <button onClick={askQuestion} className="primary-button" disabled={loading}>
              {loading ? 'Looking...' : 'Find answers'}
            </button>
          </div>

          <div className="result-panel">
            <h3>Answer preview</h3>
            <pre>{answer}</pre>
          </div>
        </section>

        <section className="panel card document-overview">
          <h2>Indexed documents</h2>
          {documents.length === 0 ? (
            <p>No documents indexed yet. Paste text and click “Index document.”</p>
          ) : (
            <div className="document-list">
              {documents.map((doc) => (
                <article key={doc.id} className="document-card">
                  <h3>{doc.title}</h3>
                  <p>{doc.chunkCount} chunks</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel card search-results">
          <h2>Top retrieved chunks</h2>
          {results.length === 0 ? (
            <p>Search results appear here after you ask a question.</p>
          ) : (
            <ol>
              {results.map((item) => (
                <li key={item.id}>
                  <div className="result-score">Score: {formatScore(item.score)}</div>
                  <p>{item.snippet}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
