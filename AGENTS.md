## Project Overview

This project is a **personal knowledge dump and retrieval system** built using a
**Retrieval-Augmented Generation (RAG)** architecture.

The system allows the user to:

- Dump unstructured knowledge (text, code, errors, solutions)
- Chunk and embed that knowledge
- Store it in PostgreSQL
- Retrieve it later using natural language queries via a chat interface

The system is intentionally designed with **clear responsibility boundaries**
(“agents”) to keep the architecture simple, debuggable, and extensible.

---

## Tech Stack (Locked)

- Frontend: Next.js (App Router), TypeScript
- Backend: Next.js Route Handlers
- Database: PostgreSQL + pgvector
- ORM: Prisma
- Embeddings: Google Gemini Embedding Models
- LLM: Gemini Pro (answer formatting only)
- Validation: Zod
- Pattern: Retrieval-Augmented Generation (RAG)

---

## Agent Responsibilities

### 1. Dump Ingestion Agent

**Purpose**
Accept and normalize raw user input.

**Inputs**

- Free-form text from the Dump UI (`/dump`)
- Text may include:
  - Code
  - Terminal commands
  - Errors
  - Solutions
  - Notes

**Outputs**

- Normalized text ready for chunking

**Rules**

- Do not infer structure
- Do not modify meaning
- Preserve original formatting

---

### 2. Chunking Agent

**Purpose**
Split normalized text into semantically meaningful chunks.

**Inputs**

- Normalized dump text

**Outputs**

- Ordered list of chunks

**Chunking Rules**

- Do not split inside code blocks
- Prefer paragraph-based splits
- Keep error and solution together where possible
- Enforce maximum token/length limits suitable for embeddings

**Non-Goals**

- No summarization
- No rewriting

---

### 3. Embedding Agent

**Purpose**
Generate vector embeddings for chunks and queries.

**Inputs**

- Chunk text (write path)
- Query text (read path)

**Outputs**

- Vector embeddings

**Model**

- Gemini Embedding Model

**Rules**

- One embedding per chunk
- Server-side only
- Deterministic calls

---

### 4. Storage Agent

**Purpose**
Persist all data in PostgreSQL.

**Stored Entities**

- Dump: raw input and metadata
- Chunk: processed text linked to a dump
- Embedding: vector linked to a chunk

**Technology**

- Prisma ORM
- pgvector extension
- Raw SQL used only for vector similarity search

**Rules**

- Append-only storage
- No deletes or overwrites in v1

---

### 5. Retrieval Agent

**Purpose**
Find the most relevant stored knowledge for a user query.

**Inputs**

- Natural language query

**Process**

1. Embed the query
2. Perform vector similarity search using pgvector
3. Retrieve top-K most relevant chunks

**Outputs**

- Ranked list of relevant chunks

**Search Characteristics**

- Semantic similarity (cosine distance)
- No keyword-only search
- No external data sources

---

### 6. Answer Generation Agent (RAG)

**Purpose**
Generate a clean, well-formatted answer using retrieved chunks only.

**Inputs**

- User question
- Retrieved chunks

**Outputs**

- Markdown-formatted answer

**Formatting Rules**

- Code in fenced code blocks
- Errors clearly labeled
- Solutions presented step-by-step
- Group related chunks logically

**Strict Constraint**

- The answer MUST NOT include information not present in the retrieved chunks

---

### 7. UI Interaction Agent

**Purpose**
Handle user interaction and routing.

**Surfaces**

- `/dump`: knowledge ingestion UI
- `/chat`: query and retrieval UI

**Rules**

- Dump UI does not perform retrieval
- Chat UI does not perform storage
- Clear separation of concerns

---

## End-to-End Flows

### Dump Flow

User → Dump UI  
→ Dump Ingestion Agent  
→ Chunking Agent  
→ Embedding Agent  
→ Storage Agent

---

### Query Flow

User → Chat UI  
→ Embedding Agent (query)  
→ Retrieval Agent  
→ Answer Generation Agent  
→ User

---

## Non-Goals (v1)

- No autonomous agents
- No agent feedback loops
- No web search
- No multi-user support
- No editing or deletion of dumps
- No version comparison

---

## Future Extensions

- Versioning Agent
- Tagging / Classification Agent
- File Ingestion Agent
- Hybrid Search (vector + keyword)
- Multi-step reasoning or tool-using agents

---

## Guiding Principle

Keep the system explicit, simple, and debuggable.
This is a personal second brain, not a black box.
