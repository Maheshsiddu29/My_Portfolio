import React, { useEffect, useMemo, useRef, useState } from 'react'
import { runCommand, OutputChunk } from '@/lib/commands'

type Printed = {
  id: string
  prompt?: string
  input?: string
  chunks?: OutputChunk[]
}

const PROMPT_USER = 'mahesh'
const PROMPT_HOST = 'zk-city'

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function cls(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function Terminal() {
  const [printed, setPrinted] = useState<Printed[]>(() => [
    {
      id: uid(),
      chunks: [
        { kind: 'text', lines: [
          '┌──────────────────────────────────────────────────────────────┐',
          '│  Welcome to my Portfolio                     │',
          '│  Type: help  (try: sudo about)                                │',
          '└──────────────────────────────────────────────────────────────┘'
        ]}
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const prompt = useMemo(() => `${PROMPT_USER}@${PROMPT_HOST}:~$`, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // auto scroll to bottom
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight })
  }, [printed.length])

  function hardClear() {
    setPrinted([])
  }

  function run(raw: string) {
    const res = runCommand(raw)

    // Handle clear sentinel
    if (res.chunks.some((c) => c.kind === 'text' && c.lines.includes('__CLEAR__'))) {
      setPrinted((p) => [...p, { id: uid(), prompt, input: raw }])
      hardClear()
      return
    }

    setPrinted((p) => [...p, { id: uid(), prompt, input: raw, chunks: res.chunks }])

    if (res.openUrl) {
      // open in a new tab; basePath already handled by next.config assetPrefix
      window.open(res.openUrl, '_blank', 'noopener,noreferrer')
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const raw = input
      setInput('')
      if (raw.trim()) {
        setHistory((h) => [...h, raw])
        setHistIdx(-1)
      }
      run(raw)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = history
      if (!h.length) return
      const next = histIdx === -1 ? h.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(next)
      setInput(h[next] ?? '')
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history
      if (!h.length) return
      if (histIdx === -1) return
      const next = histIdx + 1
      if (next >= h.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(next)
        setInput(h[next] ?? '')
      }
      return
    }

    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault()
      hardClear()
      return
    }

    // Optional: basic tab completion
    if (e.key === 'Tab') {
      e.preventDefault()
      const options = ['help', 'clear', 'whoami', 'sudo about', 'about', 'skills', 'experience', 'education', 'projects', 'contact', 'resume', 'open github', 'open linkedin', 'cat projects/medi-vault', 'cat projects/healthcare-zkp']
      const cur = input.trim()
      if (!cur) return
      const match = options.find((o) => o.startsWith(cur))
      if (match) setInput(match)
      return
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,.04),0_30px_90px_rgba(0,0,0,.55)] backdrop-blur">
      {/* Terminal chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-xs text-white/55">terminal</div>
        <button
          onClick={() => hardClear()}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
          aria-label="Clear terminal"
        >
          Clear
        </button>
      </div>

      {/* Output */}
      <div
        ref={scrollerRef}
        className="max-h-[70vh] overflow-auto px-4 py-4 font-mono text-sm leading-6"
        onMouseDown={() => inputRef.current?.focus()}
      >
        {printed.map((p) => (
          <div key={p.id} className="mb-4">
            {p.input !== undefined && (
              <div className="text-white/85">
                <span className="text-emerald-400">{p.prompt}</span> <span className="text-white/90">{p.input}</span>
              </div>
            )}

            {p.chunks?.map((c, idx) => (
              <ChunkView key={idx} chunk={c} />
            ))}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">{prompt}</span>
          <div className="flex min-w-0 flex-1 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full min-w-0 bg-transparent text-white/95 outline-none"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              aria-label="Terminal command input"
            />
            <span className={cls('cursor ml-1 text-emerald-300')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChunkView({ chunk }: { chunk: OutputChunk }) {
  if (chunk.kind === 'text') {
    return (
      <div className="mt-2 text-white/80">
        {chunk.lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">{l}</div>
        ))}
      </div>
    )
  }

  if (chunk.kind === 'section') {
    return (
      <div className="mt-3">
        <div className="text-xs uppercase tracking-widest text-cyan-300/80">{chunk.title}</div>
        <div className="mt-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/85">
          {chunk.lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">{l}</div>
          ))}
        </div>
      </div>
    )
  }

  // links
  return (
    <div className="mt-3">
      <div className="text-xs uppercase tracking-widest text-cyan-300/80">{chunk.title}</div>
      <div className="mt-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        {chunk.links.map((lnk) => (
          <div key={lnk.href} className="text-white/85">
            <a
              href={lnk.href}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-300 hover:underline"
            >
              {lnk.label}
            </a>
            <span className="text-white/35"> — {lnk.href}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
