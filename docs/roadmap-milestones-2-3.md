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
| Library UI          | `/library` keeps `q`, `type`, `tag`, `source`, and `page` in the URL; free-text fields debounce before fetching, while type and pagination update immediately.                                          | A shareable URL needs no client store, and the existing list API remains the only source of library data.                                                                        |
| Library detail UI   | `/library/[id]` reads one dump directly, saves metadata and re-indexed content through their separate mutation contracts, and requires typing `DELETE` before deletion.                                 | The management loop remains explicit, failed mutations retain typed input, and the primary UI never exposes derived chunks or embeddings.                                        |
| RAG evaluation      | Use 12 synthetic-vector chunks and 10 labeled queries (8 positive, 2 no-answer) at K=3; run the same frozen rankings through the pure evaluator and real pgvector integration fixture.                  | Provider-free vectors make local/CI results deterministic and measure retrieval mechanics; they are not a Gemini embedding-quality benchmark.                                    |
| Extensibility       | Add no tag table, repository/service layer, metadata generator, or dependency.                                                                                                                          | The current model and route already own the required responsibilities.                                                                                                           |

## Current retrieval baseline

Issue #13 freezes the vector-only retrieval baseline before milestone 3 changes
the algorithm. The representative corpus covers semantic paraphrases, exact
errors and identifiers, overlapping notes, irrelevant questions, and
type/tag/source-scoped questions. Every positive query labels its relevant chunks
and answer fragments; corpus validation fails when either label or grounded
fragment is absent.

| Metric                   | Baseline |
| ------------------------ | -------: |
| Recall@3                 |  100.00% |
| Mean reciprocal rank     |   68.75% |
| No-answer accuracy       |    0.00% |
| Grounded-answer accuracy |  100.00% |

Recall, reciprocal rank, and grounded-answer accuracy use the 8 positive
queries. No-answer accuracy uses the 2 negative queries. The current vector
search always returns its nearest chunks without a relevance threshold, so
both irrelevant queries fail the no-answer check. Exact-token and
metadata-scoped cases retrieve the labeled chunk at rank 2, which accounts for
the lower reciprocal rank and establishes comparison points for issues #14,
#16, and #17.

## Verification matrix

| Concern                       | Focused evidence                                                                                                                                             | Full baseline command                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Migration safety and defaults | Temporary-schema PostgreSQL test applies the original migration, inserts a legacy row, applies the metadata migration, and checks content/backfill/defaults. | `TEST_DATABASE_URL=... pnpm test:integration` |
| Validation and normalization  | Dump route unit cases cover invalid types/shapes, length/count limits, trimming, canonical tags, and deduplication.                                          | `pnpm test`                                   |
| Persistence and compatibility | Route unit assertions and real PostgreSQL route tests cover supplied metadata and content-only payloads.                                                     | `TEST_DATABASE_URL=... pnpm test:integration` |
| Formatting                    | All changed files pass Oxfmt.                                                                                                                                | `pnpm format:check`                           |
| Lint delta                    | Compare the repository-wide result with the pre-change baseline of 2,874 warnings and 17 errors; no new errors are allowed.                                  | `pnpm lint`                                   |
| Static correctness            | Strict TypeScript compilation.                                                                                                                               | `pnpm typecheck`                              |
| RAG regression                | Deterministic no-provider corpus validates labels, Recall@3, MRR, no-answer behavior, grounded fragments, repeatability, and actionable failures.            | `pnpm test:eval`                              |
| Retrieval baseline            | Real PostgreSQL/pgvector fixture reproduces the frozen 9-query rankings and all four metrics.                                                                | `TEST_DATABASE_URL=... pnpm test:integration` |
| Browser regression            | Full Playwright suite.                                                                                                                                       | `pnpm test:e2e`                               |
| CLI packaging                 | Compile the command-line entry point.                                                                                                                        | `pnpm build:cli`                              |
| Production packaging          | Next.js production compilation.                                                                                                                              | `pnpm build`                                  |

## Verification harness follow-up

Issue [#25](https://github.com/Mohit1310/personal-dump/issues/25) is **in
progress** in [PR #29](https://github.com/Mohit1310/personal-dump/pull/29).
The fresh-cache follow-up reproduced the inherited `pnpm test:integration`
failure at 4 failures out of 25 tests whenever the Knowledge Library file ran
first. Prisma's client proxy reports an own `$transaction` descriptor whose
value is `undefined` even though normal property access returns the callable.
`vi.spyOn` registered that descriptor for file teardown, so Vitest performed a
second restore after the test's `finally` block and replaced the cached
callable with `undefined`.

The deterministic repair avoids registering a spy on the Prisma proxy. The
test installs a one-call failure mock directly, restores the captured callable
in `finally`, and asserts its identity. No production behavior, assertion,
suite ordering, or test selection changed.

Verification on 2026-07-26 regenerated Prisma Client 7.3.0, passed the focused
Library/vector pair in both orders (2 files, 14 tests), passed the full
integration command twice (4 files, 25 tests per run), and passed every
integration file independently (7, 4, 7, and 7 tests). The unit suite passed
14 files and 113 tests with one worker after the host produced unrelated
parallel JSDOM timing failures; evals passed 1 file and 2 tests; Playwright
passed all 8 tests; and typecheck plus the CLI build passed. The production
build still reaches successful compilation and TypeScript checking before the
pre-existing `/library` Suspense prerender failure tracked and fixed separately
by [#26](https://github.com/Mohit1310/personal-dump/issues/26) and
[PR #30](https://github.com/Mohit1310/personal-dump/pull/30).

The repository-wide quality-debt baseline remains separate from #25: Oxfmt
checked 146 files and found issues in 56, while Oxlint reported 3,232 warnings
and 17 errors. Both changed files pass Oxfmt; the changed TypeScript file has
29 existing-style warnings and zero lint errors. Deferred [#5](https://github.com/Mohit1310/personal-dump/issues/5)
remains untouched.

## Progress

| Order | Issue | Milestone | Status      | Delivery                                                     |
| ----: | ----- | --------- | ----------- | ------------------------------------------------------------ |
|     1 | #7    | 2         | In review   | [PR #20](https://github.com/Mohit1310/personal-dump/pull/20) |
|     2 | #8    | 2         | In progress | [PR #21](https://github.com/Mohit1310/personal-dump/pull/21) |
|     3 | #9    | 2         | In progress | [PR #22](https://github.com/Mohit1310/personal-dump/pull/22) |
|     4 | #10   | 2         | In progress | [PR #23](https://github.com/Mohit1310/personal-dump/pull/23) |
|     5 | #11   | 2         | In progress | [PR #24](https://github.com/Mohit1310/personal-dump/pull/24) |
|     6 | #12   | 2         | Todo        | —                                                            |
|     7 | #13   | 3         | In progress | [PR #27](https://github.com/Mohit1310/personal-dump/pull/27) |
|     8 | #14   | 3         | Todo        | —                                                            |
|     9 | #15   | 3         | Todo        | —                                                            |
|    10 | #16   | 3         | Todo        | —                                                            |
|    11 | #17   | 3         | Todo        | —                                                            |
|    12 | #18   | 3         | Todo        | —                                                            |
|    13 | #19   | 3         | Todo        | —                                                            |
