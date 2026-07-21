# OpenAI Build Week submission copy

## Project name

Qorx Zero

## Category

Developer Tools

## One line

Keep project memory on your device and send GPT-5.6 only the proof needed for
the current task.

## What we built

Qorx Zero is local project memory for Codex. It
persists project decisions across sessions in IndexedDB, recalls related
records inside a strict context budget, supports automatic and explicit
forgetting, and exposes the exact score, matched terms, source hashes, and proof
frame used for each answer.

The OpenAI adapter uses the Responses API with GPT-5.6 Terra, low reasoning
effort, low verbosity, and store disabled. The model receives only the current
question and capped proof frame, then cites the visible source hashes or states
which evidence is missing.

## How Codex and GPT-5.6 were used

Codex with GPT-5.6 planned the clean-room boundary, implemented the application,
wrote the tests and independent notebook, reviewed the provider adapter against
official OpenAI documentation, and prepared the public submission package.
Timestamped commits in this repository isolate the Build Week work.

## The Qorx technology

Complete records never leave IndexedDB. A deterministic ranker combines 65%
keyword relevance, 20% importance, and 15% recency. Expired records are removed
before recall. Only matching records can enter a proof frame capped at five
items and 1,600 characters. GPT-5.6 receives that visible frame—not the whole
store—and must cite its source hashes or identify the missing evidence.

## Built with

Codex, GPT-5.6 Terra, OpenAI Responses API, React, Vinext, IndexedDB, Node.js,
Cloudflare Workers-compatible runtime.

## Evidence to add

- Live demo: https://qorx-zero-build-week-2026.sour-lacing-2mpwerd8.chatgpt.site
- Public repository: https://github.com/bbrainfuckk/qorx-zero-build-week
- Public YouTube demo: https://youtu.be/GBPWgpuye-Q
- Codex task/session ID: `019f76db-d149-7301-9131-47f898bb2d1c`
- Feedback submitted from /feedback:
- Final qualifying implementation commit: `10432271105783d03b0230f30b7b86864daec600`
