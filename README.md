# DocQ — Document Q&A

[![Live Demo](https://img.shields.io/badge/demo-live-green?logo=vercel)](https://docq-gamma.vercel.app/)

A simple React + Vite app for asking questions about your own documents. Paste text, index it locally, and get relevant passages back instantly.

Live demo: https://docq-gamma.vercel.app/

## Features

- Paste or type document text and keep it in-browser
- Automatic chunking for better retrieval across long content
- Local similarity matching with cosine score ranking
- Friendly UI designed for notes, articles, meeting summaries, and research

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

- The app performs local document chunking and retrieval with cosine similarity.
- If you want to use your own API key or proxy for an external LLM, update the request headers in `src/App.jsx`.

## Deployment

This project is ready to deploy as a static site to Vercel, Netlify, or GitHub Pages.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Deploy the generated `dist/` folder to your static host.

For Vercel deploys, connect the repo and use the default Vite settings. For Netlify, drop the `dist/` folder or configure `npm run build` with `dist` as the publish directory.
