"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildProofFrame,
  createMemory,
  pruneExpired,
  type MemoryItem,
  type ProofFrame,
} from "../lib/memory";
import {
  clearMemories,
  forgetMemory,
  listMemories,
  saveMemory,
} from "../lib/memory-store";
import { VARIANT } from "../lib/variant";

const DEFAULT_QUESTION = "What must we ship before adding analytics?";

function sampleMemories(now = new Date()): MemoryItem[] {
  return [
    createMemory({
      text: "Ship the local memory demo and forgetting flow before adding analytics.",
      tags: ["launch", "priority", "analytics"],
      importance: 5,
      now,
    }),
    createMemory({
      text: "The Build Week video must stay under three minutes and show Codex with GPT-5.6.",
      tags: ["build-week", "video", "gpt-5.6"],
      importance: 5,
      now: new Date(now.getTime() - 60_000),
    }),
    createMemory({
      text: "Keep the public Qorx Zero edition standalone; exclude private compiler, routing, and benchmark internals.",
      tags: ["security", "clean-room", "public-repo"],
      importance: 5,
      now: new Date(now.getTime() - 120_000),
    }),
  ];
}

function localProofAnswer(proof: ProofFrame): string {
  if (proof.selected.length === 0) {
    return "No local memory supports that answer yet. Add a relevant memory, then ask again.";
  }
  return [
    "The local proof gate selected:",
    ...proof.selected.map(
      (memory) => `• ${memory.text} [${memory.sourceHash}]`,
    ),
  ].join("\n");
}

export function QorxZeroApp() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [ready, setReady] = useState(false);
  const [memoryText, setMemoryText] = useState("");
  const [tags, setTags] = useState("");
  const [importance, setImportance] = useState(3);
  const [ttlDays, setTtlDays] = useState("30");
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [proof, setProof] = useState<ProofFrame>({
    frame: "",
    selected: [],
    fullChars: 0,
    frameChars: 0,
  });
  const [answer, setAnswer] = useState(
    "Ask a question to see exactly which local memories become proof.",
  );
  const [answerMode, setAnswerMode] = useState("Ready");
  const [asking, setAsking] = useState(false);
  const [providerCalls, setProviderCalls] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      let stored = await listMemories();
      if (stored.length === 0) {
        stored = sampleMemories();
        await Promise.all(stored.map((memory) => saveMemory(memory)));
      }
      const live = pruneExpired(stored);
      const liveIds = new Set(live.map((memory) => memory.id));
      await Promise.all(
        stored
          .filter((memory) => !liveIds.has(memory.id))
          .map((memory) => forgetMemory(memory.id)),
      );
      if (active) {
        setMemories(live);
        setReady(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const totalChars = useMemo(
    () => memories.reduce((total, memory) => total + memory.text.length, 0),
    [memories],
  );
  const contextSent = totalChars
    ? `${Math.min(100, (proof.frameChars / totalChars) * 100).toFixed(1)}%`
    : "0%";

  async function addMemory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memoryText.trim()) return;
    const memory = createMemory({
      text: memoryText,
      tags: tags.split(","),
      importance,
      ttlDays: ttlDays === "never" ? null : Number(ttlDays),
    });
    await saveMemory(memory);
    setMemories((current) => [memory, ...current]);
    setMemoryText("");
    setTags("");
    setAnswerMode("Saved locally");
  }

  async function forget(id: string) {
    await forgetMemory(id);
    const next = memories.filter((memory) => memory.id !== id);
    setMemories(next);
    const nextProof = buildProofFrame(question, next);
    setProof(nextProof);
    setAnswer(localProofAnswer(nextProof));
    setAnswerMode("Forgotten immediately");
  }

  async function resetDemo() {
    await clearMemories();
    const seeded = sampleMemories();
    await Promise.all(seeded.map((memory) => saveMemory(memory)));
    setMemories(seeded);
    setProof({ frame: "", selected: [], fullChars: 0, frameChars: 0 });
    setAnswer("Demo reset. Ask the sample question to build a new proof frame.");
    setAnswerMode("Reset");
  }

  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || asking) return;
    const nextProof = buildProofFrame(question, memories);
    setProof(nextProof);
    setAsking(true);
    setAnswerMode("Building proof");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          proofFrame: nextProof.frame,
        }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        provider?: string;
        model?: string;
        error?: string;
      };
      if (!response.ok || !payload.answer) {
        setAnswer(localProofAnswer(nextProof));
        setAnswerMode(
          payload.error === "provider_not_configured"
            ? "Local proof preview"
            : "Provider unavailable · local proof preview",
        );
        return;
      }
      setAnswer(payload.answer);
      setAnswerMode(`${payload.provider} · ${payload.model}`);
      setProviderCalls((count) => count + 1);

      const used = new Set(nextProof.selected.map((memory) => memory.id));
      const touched = memories.map((memory) =>
        used.has(memory.id)
          ? { ...memory, lastUsedAt: new Date().toISOString() }
          : memory,
      );
      setMemories(touched);
      await Promise.all(touched.filter((memory) => used.has(memory.id)).map(saveMemory));
    } catch {
      setAnswer(localProofAnswer(nextProof));
      setAnswerMode("Local proof preview");
    } finally {
      setAsking(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Qorx Zero home">
          <span className="brand-mark" aria-hidden="true">Q0</span>
          <span>Qorx Zero</span>
        </a>
        <div className="edition">{VARIANT.edition}</div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Qorx Zero · local memory for Codex</p>
        <h1>Keep the context. Send the proof.</h1>
        <p className="hero-copy">
          Qorx Zero remembers the decisions your project already made, keeps
          them on your device, and gives GPT-5.6 only the evidence needed now.
        </p>
        <a className="primary-link" href="#workspace">Watch Qorx work</a>
        <div className="hero-proof" aria-label="Product guarantees">
          <span>IndexedDB memory</span>
          <span>≤5-record proof</span>
          <span>One-tap forgetting</span>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Live product</p>
            <h2>The proof desk</h2>
          </div>
          <div className="provider-pill">
            <span className="status-dot" aria-hidden="true" />
            {VARIANT.providerLabel}
          </div>
        </div>

        <div className="metrics" aria-label="Qorx Zero metrics">
          <div>
            <strong>{ready ? memories.length : "—"}</strong>
            <span>local memories</span>
          </div>
          <div>
            <strong>{proof.selected.length}</strong>
            <span>proof records</span>
          </div>
          <div>
            <strong>{contextSent}</strong>
            <span>local context sent</span>
          </div>
          <div>
            <strong>{providerCalls}</strong>
            <span>provider calls</span>
          </div>
        </div>

        <div className="desk-grid">
          <section className="panel memory-panel" aria-labelledby="memory-title">
            <div className="panel-title">
              <div>
                <p className="step-label">01 · Remember</p>
                <h3 id="memory-title">Local memory</h3>
              </div>
              <button className="text-button" type="button" onClick={resetDemo}>
                Reset demo
              </button>
            </div>

            <form className="memory-form" onSubmit={addMemory}>
              <label htmlFor="memory">What should Qorx Zero remember?</label>
              <textarea
                id="memory"
                value={memoryText}
                onChange={(event) => setMemoryText(event.target.value)}
                placeholder="Example: Ship the forgetting flow before analytics."
                maxLength={600}
              />
              <div className="form-row">
                <div>
                  <label htmlFor="tags">Tags</label>
                  <input
                    id="tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="launch, priority"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label htmlFor="importance">Importance</label>
                  <select
                    id="importance"
                    value={importance}
                    onChange={(event) => setImportance(Number(event.target.value))}
                  >
                    <option value={1}>1 · low</option>
                    <option value={2}>2</option>
                    <option value={3}>3 · normal</option>
                    <option value={4}>4</option>
                    <option value={5}>5 · critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ttl">Forget after</label>
                  <select
                    id="ttl"
                    value={ttlDays}
                    onChange={(event) => setTtlDays(event.target.value)}
                  >
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
              <button className="primary-button" type="submit">
                Save on this device
              </button>
            </form>

            <div className="memory-list" aria-live="polite">
              {memories.map((memory) => (
                <article className="memory-card" key={memory.id}>
                  <div>
                    <p>{memory.text}</p>
                    <div className="memory-meta">
                      <span>importance {memory.importance}</span>
                      <span>{memory.sourceHash}</span>
                      {memory.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="forget-button"
                    type="button"
                    onClick={() => forget(memory.id)}
                    aria-label={`Forget memory: ${memory.text}`}
                  >
                    Forget
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel ask-panel" aria-labelledby="ask-title">
            <div className="panel-title">
              <div>
                <p className="step-label">02 · Recall</p>
                <h3 id="ask-title">Ask with proof</h3>
              </div>
              <span className="track-label">{VARIANT.track}</span>
            </div>

            <form className="ask-form" onSubmit={askQuestion}>
              <label htmlFor="question">Question</label>
              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={2000}
              />
              <button className="primary-button inverse" type="submit" disabled={asking}>
                {asking ? "Building proof…" : "Ask Qorx Zero"}
              </button>
            </form>

            <div className="answer-block" aria-live="polite">
              <div className="answer-heading">
                <span>Answer</span>
                <span>{answerMode}</span>
              </div>
              <p>{answer}</p>
            </div>

            <div className="proof-block">
              <div className="proof-heading">
                <div>
                  <span>Proof frame</span>
                  <strong>{proof.selected.length} selected</strong>
                </div>
                <span>{proof.frameChars} / {totalChars} local chars</span>
              </div>
              <pre>{proof.frame || "No proof has left the device."}</pre>
              {proof.selected.length > 0 && (
                <div className="recall-trace" aria-label="Transparent recall trace">
                  {proof.selected.map((memory) => (
                    <div key={memory.id}>
                      <strong>{memory.score.toFixed(3)}</strong>
                      <span>{memory.sourceHash}</span>
                      <span>{memory.matchedTerms.join(" · ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="story">
        <p className="eyebrow">The Qorx technology</p>
        <h2>Every memory decision stays visible.</h2>
        <div className="story-grid">
          <div>
            <span>01 · Remember</span>
            <h3>Keep it local</h3>
            <p>IndexedDB preserves project decisions across browser sessions.</p>
          </div>
          <div>
            <span>02 · Rank</span>
            <h3>Show the score</h3>
            <p>Relevance, importance, recency, and matched terms stay inspectable.</p>
          </div>
          <div>
            <span>03 · Bound</span>
            <h3>Send less</h3>
            <p>At most five records and 1,600 characters enter the proof frame.</p>
          </div>
          <div>
            <span>04 · Forget</span>
            <h3>Delete cleanly</h3>
            <p>One tap or an expired TTL removes a record before the next recall.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">Q0</span><span>Qorx Zero</span></div>
        <p>Built with Codex + GPT-5.6 · AGPL-3.0</p>
      </footer>
    </main>
  );
}
