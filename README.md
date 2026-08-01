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

- Free-form text and code capture from the browser or CLI
- UTF-8 text-file and standard-input capture through `pdump`
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
1. User enters text in /dump or sends text through the `pdump` CLI
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

GETTING STARTED

Requirements
- Node.js (LTS)
- PostgreSQL with pgvector
- Gemini API key

Environment Variables (.env.local)

DATABASE_URL=postgresql://user:password@localhost:5432/dump_builder
GEMINI_API_KEY=your_api_key_here

---

CAPTURE WITH THE CLI

`pdump add` sends one input source to the same `POST /api/dump` route used by
the browser. Start the Next.js app first, then choose exactly one of `--text`,
`--file`, or `--stdin`:

```powershell
pnpm pdump add --text "Remember this command"
pnpm pdump add --file .\notes\deploy.md
Get-Content -Raw .\notes\deploy.md | pnpm pdump add --stdin
```

On POSIX shells, standard input can be piped in the same way:

```sh
cat ./notes/deploy.md | pnpm pdump add --stdin
```

Optional metadata flags work with every input source:

```powershell
pnpm pdump add --file .\notes\deploy.md --title "Deploy fix" --type solution --tag powershell --tag deployment --source terminal
```

- `--title <text>` sets the display title.
- `--type <note|error|solution>` defaults to `note`.
- `--tag <tag>` is repeatable. The API normalizes and deduplicates tags.
- `--source <label>` records a label, not a filesystem path. Absolute paths are
  rejected.

File capture defaults the title to the filename and the source to `file`;
explicit metadata overrides those defaults. Standard-input capture defaults
the source to `stdin`. The local file path is never sent to the API.

The CLI uses `http://localhost:3000` by default. Set `PERSONAL_DUMP_URL` when
the app is served elsewhere:

```powershell
$env:PERSONAL_DUMP_URL = "http://localhost:4000"
pnpm pdump add --text "Stored through port 4000"
```

```sh
PERSONAL_DUMP_URL=http://localhost:4000 pnpm pdump add --text 'Stored through port 4000'
```

Each input is limited to 1 MiB (1,048,576 bytes) after UTF-8 encoding. Files
and standard input must be non-empty, valid UTF-8 text. The CLI rejects
unreadable or non-regular files, invalid UTF-8, NUL-containing binary data, and
oversized input before making an API request. It preserves accepted text,
including line endings and a UTF-8 BOM. The API applies the same byte limit to
all capture paths, including `--text` and the browser.

Browser file uploads remain deferred. Multi-file or batch capture, directories,
globs, watchers, PDF/DOCX extraction, OCR, URL ingestion, deduplication,
background queues, and version history are also not supported yet.

---

NON-GOALS (v1)

- Authentication or multi-user support
- Browser file uploads and multipart ingestion
- Batch, directory, or watcher-based capture
- PDF, DOCX, OCR, or URL ingestion
- Content deduplication, background queues, or version history
- External web search
- Autonomous agents

---

ROADMAP

v1
- Text dump and retrieval
- Semantic search
- RAG-based answers

---

PHILOSOPHY

Stop re-Googling things you already solved once.
