# Personal Dump Builder

Personal Dump Builder is a private knowledge dump and retrieval system.
It acts as a second brain for forgotten commands, code snippets, error fixes,
and personal notes.

The system allows you to dump unstructured knowledge and later retrieve it
using natural language through a chat interface.

---

WHAT THIS IS

- A personal, local-first knowledge base
- Designed for text, code, errors, and solutions
- Semantic search (not keyword-based)
- Answers generated only from your stored data

---

CORE FEATURES

- Free-form text and code dumping
- Intelligent chunking
- Vector embeddings using Gemini
- PostgreSQL storage with pgvector
- Chat-based semantic search
- Clean, formatted answers

---

TECH STACK

Frontend
- Next.js (App Router)
- TypeScript

Backend
- Next.js Route Handlers
- TypeScript
- Zod for validation

Database
- PostgreSQL
- pgvector extension
- Prisma ORM
- Raw SQL for vector similarity search

AI
- Gemini Embedding Models
- Gemini Pro (answer formatting only)

---

PROJECT STRUCTURE

app/
  dump/
    page.tsx
  chat/
    page.tsx
  api/
    dump/
      route.ts
    search/
      route.ts

lib/
  db/
    client.ts
    schema.prisma
  chunking/
    chunkText.ts
  embeddings/
    gemini.ts
  retrieval/
    search.ts
  rag/
    answer.ts

---

HOW IT WORKS

Dump Flow
1. User enters text in /dump
2. Text is chunked
3. Chunks are embedded
4. Data is stored in PostgreSQL

Query Flow
1. User asks a question in /chat
2. Query is embedded
3. Vector similarity search runs
4. Relevant chunks are retrieved
5. Answer is generated using retrieved chunks only

---

DESIGN PRINCIPLES

- Append-only storage
- No hallucinations
- Clear separation of concerns
- Minimal abstractions
- Easy to debug

---

NON-GOALS (v1)

- Authentication or multi-user support
- File uploads
- Tagging or folders
- Editing or deleting dumps
- External web search
- Autonomous agents

---

GETTING STARTED

Requirements
- Node.js (LTS)
- PostgreSQL with pgvector
- Gemini API key

Environment Variables (.env.local)

DATABASE_URL=postgresql://user:password@localhost:5432/dump_builder
GEMINI_API_KEY=your_api_key_here

---

ROADMAP

v1
- Text dump and retrieval
- Semantic search
- RAG-based answers

---

PHILOSOPHY

Stop re-Googling things you already solved once.
