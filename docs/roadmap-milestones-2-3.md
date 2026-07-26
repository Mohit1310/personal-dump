# Roadmap context: milestones 2 and 3

## Boundary

This roadmap is limited to GitHub issues
[#7](https://github.com/Mohit1310/personal-dump/issues/7) through
[#19](https://github.com/Mohit1310/personal-dump/issues/19), implemented in
strict numerical order. Milestone 2 covers the Knowledge Library and
user-controlled metadata (#7–#12). Milestone 3 covers deterministic RAG
evaluation and retrieval improvements (#13–#19).

Roadmap points 4–6 are explicitly deferred. GitHub issues
[#2](https://github.com/Mohit1310/personal-dump/issues/2),
[#3](https://github.com/Mohit1310/personal-dump/issues/3), and
[#5](https://github.com/Mohit1310/personal-dump/issues/5) are explicitly
excluded. The completed atomic-ingestion work in issue #4/PR #6 is a
prerequisite, not part of the milestone 2–3 scope.

## Exact milestone scope

### Milestone 2: Knowledge Library and metadata

1. **#7 — Add user-controlled metadata to dumps.** Add title,
   note/error/solution type, normalized tags, source, and updated timestamp to
   `Dump`; safely backfill existing rows; persist validated metadata during
   ingestion; retain content-only compatibility; and establish this context
   document.
2. **#8 — Add Knowledge Library list and detail APIs.** Add deterministic
   pagination, text search, type/tag/source filters, dump detail lookup,
   minimal response shapes that exclude vectors, and explicit 400/404
   contracts.
3. **#9 — Add dump metadata update and delete APIs.** Add partial
   metadata-only updates and cascade-backed deletion with consistent tag
   normalization, validation, not-found behavior, and no content editing.
4. **#10 — Support atomic dump content edits and re-indexing.** Prepare all
   replacement chunks and embeddings before writes, then replace content and
   derived records transactionally while preserving the prior version on any
   failure.
5. **#11 — Build Knowledge Library browse, search, and filter UI.** Add
   `/library`, navigation, paginated summaries, URL-backed debounced
   search/filters, detail navigation, and accessible loading, empty, error, and
   retry states without collections or new UI dependencies.
6. **#12 — Build dump detail, edit, and delete experience.** Add
   `/library/[id]` with metadata/content display, metadata edits, explicit
   re-indexing, confirmed deletion, unsaved-change handling, and complete
   create/browse/edit/delete coverage while keeping chunks and embeddings out
   of the primary UI.

### Milestone 3: RAG evaluation and retrieval

1. **#13 — Expand deterministic RAG evaluation corpus and retrieval metrics.**
   Cover paraphrases, exact identifiers, errors, overlapping notes, irrelevant
   queries, and metadata scopes; label relevant chunks; report Recall@K, mean
   reciprocal rank, no-answer accuracy, and grounded-answer checks; and record
   the pre-change baseline without paid calls.
2. **#14 — Add metadata filters to vector retrieval.** Define a typed filter
   contract, filter by type/tag/source in PostgreSQL before ranking, extend
   search/chat validation, preserve unfiltered behavior, and verify combined
   filtering and ranking against pgvector.
3. **#15 — Add knowledge-scope controls to chat.** Add compact,
   keyboard-accessible type/tag/source controls using existing data contracts;
   send one scope per submission; show active scope; support clear-all; and
   avoid a global state layer.
4. **#16 — Add hybrid full-text and vector retrieval.** Add PostgreSQL
   full-text ranking and deterministic rank fusion, retain vector-only
   comparison, add only measured indexes, and improve exact-token cases without
   an external search or reranking service.
5. **#17 — Add retrieval confidence gating for no-answer responses.** Derive
   an explicit threshold from evaluation evidence, remove weak results before
   prompting, align search/chat no-context behavior, and retain required
   retrieval and grounded-answer performance.
6. **#18 — Deduplicate and budget RAG context assembly.** Deterministically
   remove identical/overlapping evidence, enforce an explicit context budget,
   preserve citation identity and stable ordering, and avoid an LLM reranker.
7. **#19 — Publish milestones 2 and 3 achievement report.** Finalize this
   document with verified links, decisions, migrations, results, and
   limitations; add a standalone responsive HTML report with baseline/final
   capabilities and metrics; and report only merged or pushed facts.

## Sequential workflow

1. Keep exactly one roadmap ticket active, starting with #7 and proceeding
   through #19 without skipping ahead.
2. Start each ticket from its completed predecessor (or an explicit stacked
   prerequisite when the predecessor is awaiting merge).
3. Implement only the active issue and its stated tests/documentation.
4. Run focused tests while developing, then the complete verification baseline.
5. Commit and push the complete ticket, open its PR, and move the project item
   to review.
6. Merge only after review. Mark the issue complete through the PR and update
   the progress table with factual links/results before activating the next
   ticket.

## Decisions

| Area                | Decision                                                                                                                                                                                                | Reason                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metadata ownership  | Metadata is supplied and editable by the user.                                                                                                                                                          | AI-generated metadata is outside the roadmap and would make ingestion less explicit.                                                                                             |
| Schema              | Keep metadata as fields on `Dump`; use a PostgreSQL enum for the three types and `text[]` for tags.                                                                                                     | This supports future filters without tag tables, repositories, or another taxonomy concept.                                                                                      |
| Defaults/backfill   | Existing and content-only dumps receive empty title/source, `note`, no tags, and an `updatedAt` initially equal to `createdAt`.                                                                         | Required fields remain queryable without losing content or inventing metadata.                                                                                                   |
| API limits          | Title: 200 characters; source: 500; tags: at most 20, each at most 50.                                                                                                                                  | Bounded metadata prevents abusive payloads while remaining ample for a personal knowledge base.                                                                                  |
| Tag normalization   | Trim, lowercase, replace whitespace runs with `-`, preserve first-seen order, and remove duplicates.                                                                                                    | One deterministic representation supports later equality/containment filters.                                                                                                    |
| Content handling    | Preserve content exactly; normalize only metadata.                                                                                                                                                      | Ingestion must not alter code, errors, commands, or formatting.                                                                                                                  |
| Write behavior      | Generate chunks/embeddings before the existing transaction and persist metadata with the dump inside it.                                                                                                | Keeps PR #6 atomicity while adding no new layer.                                                                                                                                 |
| Library read API    | `GET /api/dumps` accepts bounded `page`/`pageSize` plus combinable `q`, `type`, `tag`, and `source` filters; it sorts by `createdAt DESC, id DESC`. `GET /api/dumps/[id]` returns metadata and content. | A compact, deterministic contract supports the library UI while list responses and both endpoints exclude chunks and embeddings.                                                 |
| Metadata mutations  | `PATCH /api/dumps/[id]` accepts one or more metadata fields only; `DELETE /api/dumps/[id]` deletes the root dump and relies on database cascades.                                                       | Content changes stay exclusively in #10 while the existing schema keeps dependent chunks and embeddings consistent.                                                              |
| Content re-indexing | `PUT /api/dumps/[id]` accepts content only, prepares all replacement chunks and embeddings before writes, then updates content and replaces the ordered derived records in one transaction.             | The explicit operation stays separate from metadata edits; provider failures perform no writes, while pgvector or other persistence failures roll back the complete replacement. |
| Extensibility       | Add no tag table, repository/service layer, metadata generator, or dependency.                                                                                                                          | The current model and route already own the required responsibilities.                                                                                                           |

## Verification matrix

| Concern                       | Focused evidence                                                                                                                                             | Full baseline command                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Migration safety and defaults | Temporary-schema PostgreSQL test applies the original migration, inserts a legacy row, applies the metadata migration, and checks content/backfill/defaults. | `TEST_DATABASE_URL=... pnpm test:integration` |
| Validation and normalization  | Dump route unit cases cover invalid types/shapes, length/count limits, trimming, canonical tags, and deduplication.                                          | `pnpm test`                                   |
| Persistence and compatibility | Route unit assertions and real PostgreSQL route tests cover supplied metadata and content-only payloads.                                                     | `TEST_DATABASE_URL=... pnpm test:integration` |
| Formatting                    | All changed files pass Oxfmt.                                                                                                                                | `pnpm format:check`                           |
| Lint delta                    | Compare the repository-wide result with the pre-change baseline of 2,874 warnings and 17 errors; no new errors are allowed.                                  | `pnpm lint`                                   |
| Static correctness            | Strict TypeScript compilation.                                                                                                                               | `pnpm typecheck`                              |
| RAG regression                | Deterministic no-provider evaluation suite.                                                                                                                  | `pnpm test:eval`                              |
| Browser regression            | Full Playwright suite.                                                                                                                                       | `pnpm test:e2e`                               |
| CLI packaging                 | Compile the command-line entry point.                                                                                                                        | `pnpm build:cli`                              |
| Production packaging          | Next.js production compilation.                                                                                                                              | `pnpm build`                                  |

## Progress

| Order | Issue | Milestone | Status      | Delivery                                                     |
| ----: | ----- | --------- | ----------- | ------------------------------------------------------------ |
|     1 | #7    | 2         | In review   | [PR #20](https://github.com/Mohit1310/personal-dump/pull/20) |
|     2 | #8    | 2         | In progress | [PR #21](https://github.com/Mohit1310/personal-dump/pull/21) |
|     3 | #9    | 2         | In progress | [PR #22](https://github.com/Mohit1310/personal-dump/pull/22) |
|     4 | #10   | 2         | In progress | —                                                            |
|     5 | #11   | 2         | Todo        | —                                                            |
|     6 | #12   | 2         | Todo        | —                                                            |
|     7 | #13   | 3         | Todo        | —                                                            |
|     8 | #14   | 3         | Todo        | —                                                            |
|     9 | #15   | 3         | Todo        | —                                                            |
|    10 | #16   | 3         | Todo        | —                                                            |
|    11 | #17   | 3         | Todo        | —                                                            |
|    12 | #18   | 3         | Todo        | —                                                            |
|    13 | #19   | 3         | Todo        | —                                                            |
