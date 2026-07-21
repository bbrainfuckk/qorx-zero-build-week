# Qorx Zero

**Keep the context. Send the proof.**

Qorx Zero is a standalone, device-local memory layer for AI work. It keeps
project decisions in the browser, retrieves only the relevant records, builds
an inspectable proof frame, and sends that bounded frame—not the full memory
store—to the configured model.

This repository is the clean-room **OpenAI Build Week Edition**. It is a
complete application and does not contain or depend on private Qorx source,
compiler code, binaries, or datasets.

## What the demo proves

- Persistent cross-session memory in IndexedDB
- Transparent relevance + recency + importance ranking
- Visible recall scores, matched terms, and source hashes
- User-controlled TTL and immediate forgetting
- A hard cap on proof-frame records and characters
- Evidence-gated answers with source hashes
- OpenAI Responses API adapter for gpt-5.6-terra
- A usable local proof preview when no server key is configured

## Run it

Requirements: Node.js 22.13 or newer.

    npm ci
    npm test
    npm run dev

Open the local URL printed by Vinext.

To enable the live provider response, copy .env.example to .env.local and set a
new server-side key:

    OPENAI_API_KEY=replace_me
    OPENAI_MODEL=gpt-5.6-terra

Keys are read only by /api/ask. Never put a provider key in browser code or
commit it to Git.

## Architecture

    User decision → IndexedDB on device
    Current question + local records → transparent ranker
    Ranker → TTL and explicit forgetting → capped proof frame
    Proof frame → server provider adapter → verified answer

The ranker uses standard, inspectable signals:

    score = 0.65 × keyword overlap + 0.20 × importance + 0.15 × recency

Only records sharing a non-stop-word term with the current question are
eligible. The default proof frame is limited to five records and 1,600
characters.

## Validation

    npm run check

The companion notebook at notebooks/qorx_zero_memory_validation.ipynb
independently validates ranking, expiry, forgetting, and proof caps with
synthetic data.

## Judge test flow

1. Open the live demo and ask the seeded question.
2. Compare the local character count with the percentage sent.
3. Inspect the recall score, matched terms, source hash, and proof frame.
4. Add a memory, reload, and confirm it survives the session.
5. Press **Forget**, ask again, and confirm the record is gone.

No account or proprietary Qorx component is required.

## Built with Codex and GPT-5.6

This repository was created during OpenAI Build Week, beginning July 19, 2026.
Codex with GPT-5.6 helped define the clean-room boundary, implement IndexedDB
persistence and bounded recall, write the automated tests and validation
notebook, review the Responses API adapter, and prepare the public demo.

The human product decisions were equally explicit: full records must remain on
the device; recall must be inspectable; unsupported answers must be refused;
forgetting must be immediate; and private Qorx compiler, routing, benchmark,
and dataset internals must stay outside this repository. The dated commit
history and [Codex evidence](docs/CODEX_EVIDENCE.md) isolate this Build Week work.

## Submission material

- [1:56 demo video](docs/Qorx_Zero_Build_Week_Demo.mp4)
- [English demo captions](docs/Qorx_Zero_Build_Week_Demo.srt)
- [Final video narration](docs/VIDEO_NARRATION.txt)
- [Architecture](docs/ARCHITECTURE.md)
- [Demo run of show](docs/DEMO_SCRIPT.md)
- [Pitch deck](docs/Qorx-Zero-Pitch-Deck.pptx)
- [OpenAI Build Week submission copy](docs/SUBMISSION_BUILD_WEEK.md)
- [Codex and GPT-5.6 evidence](docs/CODEX_EVIDENCE.md)
- [Public/private IP boundary](docs/IP_BOUNDARY.md)
- [Build log](docs/BUILD_LOG.md)

## License

GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
