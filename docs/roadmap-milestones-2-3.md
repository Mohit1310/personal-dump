# Milestones 2–3 achievement record

This is the durable engineering record for the Knowledge Library and RAG
retrieval roadmap. The companion [standalone report](reports/milestones-2-3.html)
is an offline, responsive reading version of the same verified record.

## Scope and verified state

Milestone 2 covers issues [#7](https://github.com/Mohit1310/personal-dump/issues/7)
through [#12](https://github.com/Mohit1310/personal-dump/issues/12): metadata
and the Knowledge Library. Milestone 3 covers
[#13](https://github.com/Mohit1310/personal-dump/issues/13) through
[#19](https://github.com/Mohit1310/personal-dump/issues/19): deterministic
evaluation and retrieval quality. Atomic ingestion in
[#4](https://github.com/Mohit1310/personal-dump/issues/4) /
[PR #6](https://github.com/Mohit1310/personal-dump/pull/6) is a prerequisite,
not milestone scope.

At this record's final update, #7–#18 are closed and their delivery PRs are
merged. #19 is open and **In Progress** in the Personal dump project; its report
PR is the only remaining review state. Nothing in this ticket implements
deferred GitHub issues [#2](https://github.com/Mohit1310/personal-dump/issues/2),
[#3](https://github.com/Mohit1310/personal-dump/issues/3), or
[#5](https://github.com/Mohit1310/personal-dump/issues/5), nor roadmap points
4–6.

## Original baseline and delivered capability

The original retrieval benchmark is provider-free: 12 fixed synthetic-vector
chunks and 10 labeled queries (8 positive, 2 no-answer) evaluated at K=3. It
tests semantic paraphrases, exact identifiers and errors, overlapping notes,
metadata scopes, and irrelevant questions. It measures retrieval mechanics,
not Gemini embedding quality.

The original vector-only ranking retrieved every labeled positive chunk in the
top three, but placed the two exact-identifier cases at rank two and returned
nearest chunks for both no-answer queries. The delivered system now provides:

- User-owned title, type, tags, and source metadata; metadata-aware ingestion,
  browsing, filtering, editing, deletion, and explicit content re-indexing.
- A Knowledge Library with deterministic list/detail APIs and `/library` browse,
  search, filters, detail, edit, re-index, and delete flows.
- Scoped chat retrieval using the same type/tag/source contract as the library.
- Hybrid PostgreSQL retrieval: vector cosine candidates plus full-text
  candidates, fused deterministically with reciprocal-rank fusion (RRF).
- A calibrated relevance gate, duplicate/overlap removal, stable evidence
  ordering, and a whole-chunk 12,000-character context budget before answer
  generation or source output.

## Ticket and PR map

| Milestone    | Ticket                                                                          | Verified status   | Delivery                                                                      |
| ------------ | ------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| Prerequisite | [#4](https://github.com/Mohit1310/personal-dump/issues/4) atomic ingestion      | Closed            | [PR #6](https://github.com/Mohit1310/personal-dump/pull/6), merged            |
| 2            | [#7](https://github.com/Mohit1310/personal-dump/issues/7) metadata              | Closed            | [PR #20](https://github.com/Mohit1310/personal-dump/pull/20), merged          |
| 2            | [#8](https://github.com/Mohit1310/personal-dump/issues/8) library read APIs     | Closed            | [PR #21](https://github.com/Mohit1310/personal-dump/pull/21), merged          |
| 2            | [#9](https://github.com/Mohit1310/personal-dump/issues/9) metadata mutations    | Closed            | [PR #22](https://github.com/Mohit1310/personal-dump/pull/22), merged          |
| 2            | [#10](https://github.com/Mohit1310/personal-dump/issues/10) content re-indexing | Closed            | [PR #23](https://github.com/Mohit1310/personal-dump/pull/23), merged          |
| 2            | [#11](https://github.com/Mohit1310/personal-dump/issues/11) library UI          | Closed            | [PR #24](https://github.com/Mohit1310/personal-dump/pull/24), merged          |
| 2            | [#12](https://github.com/Mohit1310/personal-dump/issues/12) library detail      | Closed            | [PR #28](https://github.com/Mohit1310/personal-dump/pull/28), merged          |
| 3            | [#13](https://github.com/Mohit1310/personal-dump/issues/13) deterministic evals | Closed            | [PR #27](https://github.com/Mohit1310/personal-dump/pull/27), merged          |
| 3            | [#14](https://github.com/Mohit1310/personal-dump/issues/14) retrieval filters   | Closed            | [PR #31](https://github.com/Mohit1310/personal-dump/pull/31), merged with #15 |
| 3            | [#15](https://github.com/Mohit1310/personal-dump/issues/15) chat scope          | Closed            | [PR #31](https://github.com/Mohit1310/personal-dump/pull/31), merged with #14 |
| 3            | [#16](https://github.com/Mohit1310/personal-dump/issues/16) hybrid retrieval    | Closed            | [PR #32](https://github.com/Mohit1310/personal-dump/pull/32), merged          |
| 3            | [#17](https://github.com/Mohit1310/personal-dump/issues/17) confidence gate     | Closed            | [PR #33](https://github.com/Mohit1310/personal-dump/pull/33), merged with #18 |
| 3            | [#18](https://github.com/Mohit1310/personal-dump/issues/18) evidence budget     | Closed            | [PR #33](https://github.com/Mohit1310/personal-dump/pull/33), merged with #17 |
| 3            | [#19](https://github.com/Mohit1310/personal-dump/issues/19) achievement report  | Open, In Progress | This report PR: open review                                                   |

## Architecture decisions and migrations

The first migration creates `Dump`, `Chunk`, and `Embedding`, enables pgvector,
and cascades dependent records. The metadata migration adds the PostgreSQL
`DumpType` enum and `title`, `type`, `tags`, `source`, and `updatedAt` to
`Dump`; legacy rows are backfilled with their original `createdAt`. Metadata
lives on `Dump` as an enum and `text[]`, rather than adding tag tables or a
service layer.

Ingestion generates chunks and embeddings before the transaction, then writes
the dump and derived records atomically. Content edits prepare replacements
before writing and replace the content and ordered derived records in one
transaction, so provider failures write nothing and persistence failures roll
back the full replacement. Metadata edits remain distinct from re-indexing.

Retrieval applies at most one optional type, normalized tag, and
case-insensitive source with `AND` before ranking and limiting. Hybrid search
gets bounded vector and PostgreSQL `simple` full-text candidates, then RRF
scores them as `1 / (60 + rank)`. Equal scores break by lexical rank, vector
rank, then chunk id. A measured empty-test-database `EXPLAIN (ANALYZE,
BUFFERS)` completed in 0.10 ms with a sequential scan, so no GIN index or new
migration was added without representative-corpus evidence.

After hybrid retrieval, a result needs at least one shared significant
normalized token with the query (`MIN_RELEVANT_TOKEN_OVERLAP = 1`). This was
calibrated from the frozen corpus: labeled evidence had at least one overlap;
returned irrelevant candidates had zero. The context step then discards exact
duplicates and chunks overlapping 80% or more of the smaller token set, keeps
retrieval order, and emits only whole chunks that fit a deterministic
12,000-character budget. Character budgeting avoids model-specific tokenizers
across Gemini and Groq paths.

## Evaluation progression

All percentages below are exact deterministic evaluation outputs. Recall, MRR,
exact-token recall, semantic recall, and grounding use the 8 positive cases;
no-answer accuracy uses the 2 negative cases.

| Stage                            | Recall@3 |     MRR | Exact-token Recall@1 | Semantic Recall@3 | No-answer accuracy | Grounded-answer accuracy |
| -------------------------------- | -------: | ------: | -------------------: | ----------------: | -----------------: | -----------------------: |
| Vector-only baseline             |  100.00% |  68.75% |                0.00% |           100.00% |              0.00% |                  100.00% |
| Metadata-scoped vector           |  100.00% |  87.50% |                0.00% |           100.00% |              0.00% |                  100.00% |
| Hybrid RRF                       |  100.00% | 100.00% |              100.00% |           100.00% |              0.00% |                  100.00% |
| Hybrid + confidence gate/context |  100.00% | 100.00% |              100.00% |           100.00% |            100.00% |                  100.00% |

Hybrid retrieval moves exact identifiers to rank one without reducing semantic
retrieval. The relevance gate changes the two unsupported no-answer cases from
nearest-neighbor output to no context while retaining every labeled, grounded
positive result. Context deduplication and budgeting preserve those evaluation
outcomes; they are evidence-preparation controls, not an LLM reranker.

## Final verification

The report changes only documentation. The final sequential task run passed:

| Command                         | Exact result                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm test:eval`                | 1 file, 8 tests passed                                                                    |
| `pnpm test`                     | 18 files, 143 tests passed                                                                |
| `pnpm test:integration` (run 1) | 4 files, 43 tests passed against real PostgreSQL/pgvector                                 |
| `pnpm test:integration` (run 2) | 4 files, 43 tests passed against real PostgreSQL/pgvector                                 |
| `pnpm test:e2e`                 | 12 Playwright tests passed                                                                |
| `pnpm typecheck`                | passed                                                                                    |
| `pnpm build:cli`                | passed                                                                                    |
| `pnpm build`                    | passed; all 10 static pages generated                                                     |
| Changed report files            | Oxfmt: 2 files correctly formatted; Oxlint: 0 warnings and 0 errors on 0 applicable files |

The repository-wide quality baseline remains separate and deferred to #5:
`pnpm format:check` found 56 format issues in 157 files, and `pnpm lint` found
3,793 warnings and 18 errors in 144 files. No broad cleanup is folded into
this final roadmap ticket.

## Limitations and deferrals

The evaluation corpus is intentionally small, deterministic, and synthetic;
it does not measure production embedding quality, answer-model quality, or
ranking behavior on a representative personal corpus. The calibrated overlap
threshold is evidence for this corpus, not a universal relevance threshold.
The system still has no keyword-only fallback, reranker, multi-user model,
editing/version history for prior content, web search, CI enforcement, branch
protection, or repository-wide lint/format remediation. Issues #2, #3, and #5
and roadmap points 4–6 remain deferred by design.
