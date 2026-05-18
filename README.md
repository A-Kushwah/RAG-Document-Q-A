# RAG-Document-Q-A

<img width="1125" height="910" alt="image" src="https://github.com/user-attachments/assets/2b492dc6-08e4-4b60-b184-62ad92a5393b" />

A polished React + Vite application for Retrieval-Augmented Generation. Paste a document, index it, and ask precise questions grounded in the text.

## Features

- Document chunking with overlapping windows
- Lightweight hash-based embeddings for local similarity retrieval
- Cosine similarity ranking for relevant chunk selection
- Claude-powered responses using retrieved context
- Clean UI with chat-style results and formatting support

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 to use the app.

## Project scripts

- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint checks
- `npm run lint:fix` — automatically fix lintable issues
- `npm run format` — format the repository with Prettier

## Notes

- The app uses the Anthropic Claude API for answers.
- If you want to use your own API key or proxy, update the request headers in `src/App.jsx`.
