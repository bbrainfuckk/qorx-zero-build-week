# OpenAI Build Week submission copy

## Project name

Qorx Zero

## Category

Developer Tools

## One line

Keep project memory on your device and send GPT-5.6 only the proof needed for
the current task.

## What we built

Qorx Zero is a local-first memory layer for AI-assisted development. It
persists project decisions across sessions in IndexedDB, recalls related
records inside a strict context budget, supports automatic and explicit
forgetting, and exposes the exact proof frame used for each answer.

The OpenAI adapter uses the Responses API with GPT-5.6 Terra, low reasoning
effort, low verbosity, and store disabled. The model receives only the current
question and capped proof frame, then cites the visible source hashes or states
which evidence is missing.

## How Codex and GPT-5.6 were used

Codex with GPT-5.6 planned the clean-room boundary, implemented the application,
wrote the tests and independent notebook, reviewed the provider adapter against
official OpenAI documentation, and prepared the public submission package.
Timestamped commits in this repository isolate the Build Week work.

## Built with

Codex, GPT-5.6 Terra, OpenAI Responses API, React, Vinext, IndexedDB, Node.js,
Cloudflare Workers-compatible runtime.

## Evidence to add

- Live demo:
- Public repository:
- Public YouTube demo:
- Codex task/session ID:
- Feedback submitted from /feedback:
- Final qualifying commit:
