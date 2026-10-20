import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Aperture,
  Check,
  Clapperboard,
  Code2,
  Compass,
  Copy,
  Layers,
  PenLine,
  PenTool,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react"
import {
  CODES,
  TASKS,
  facetName,
  matchesQuery,
  rank,
  stackPrompt,
  taskName,
  type CodeEntry,
  type TaskId,
} from "@/lib/catalog"

const STAR_KEY = "cuebook-stars"
const STACK_KEY = "cuebook-stack"

const TASK_ICON = {
  image: Aperture,
  design: PenTool,
  explain: Layers,
  video: Clapperboard,
  code: Code2,
  write: PenLine,
  think: Compass,
} as const

function loadList(key: string) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []
  } catch {
    return []
  }
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function Cuebook({ onAgent }: { onAgent?: () => void }) {
  const [task, setTask] = useState<TaskId>("image")
  const [facet, setFacet] = useState("all")
  const [query, setQuery] = useState("")
  const [savedOnly, setSavedOnly] = useState(false)
  const [stars, setStars] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStars(loadList(STAR_KEY))
    setStack(loadList(STACK_KEY).slice(0, 4))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STAR_KEY, JSON.stringify(stars))
  }, [stars, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STACK_KEY, JSON.stringify(stack))
  }, [stack, ready])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      if (event.key === "/" && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === "Escape") {
        setActiveId(null)
        setSourcesOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const starSet = useMemo(() => new Set(stars), [stars])
  const byId = useMemo(() => new Map(CODES.map((entry) => [entry.id, entry])), [])
  const active = activeId ? byId.get(activeId) ?? null : null
  const stacked = stack.map((id) => byId.get(id)).filter((entry): entry is CodeEntry => Boolean(entry))
  const current = TASKS.find((item) => item.id === task) ?? TASKS[0]
  const searching = query.trim().length > 0

  const counts = useMemo(() => {
    const tasks = new Map<TaskId, number>()
    const facets = new Map<string, number>()
    for (const entry of CODES) {
      tasks.set(entry.task, (tasks.get(entry.task) ?? 0) + 1)
      facets.set(`${entry.task}:${entry.facet}`, (facets.get(`${entry.task}:${entry.facet}`) ?? 0) + 1)
    }
    return { tasks, facets }
  }, [])

  const visible = useMemo(() => {
    return CODES.filter((entry) => {
      if (savedOnly && !starSet.has(entry.id)) return false
      if (!searching && !savedOnly && entry.task !== task) return false
      if (!searching && !savedOnly && facet !== "all" && entry.facet !== facet) return false
      return matchesQuery(entry, query)
    }).sort((a, b) => rank(a, query).localeCompare(rank(b, query)))
  }, [facet, query, savedOnly, searching, starSet, task])

  function flash(key: string) {
    setCopied(key)
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1400)
  }

  async function copyText(text: string, key: string) {
    const ok = await writeClipboard(text)
    if (ok) flash(key)
  }

  function toggleStar(id: string) {
    setStars((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function toggleStack(id: string) {
    setStack((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 4) return current
      return [...current, id]
    })
  }

  function chooseTask(next: TaskId) {
    setTask(next)
    setFacet("all")
    setSavedOnly(false)
    setQuery("")
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl md:gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-0 flex h-dvh flex-col px-4 py-6">
            <Brand onSources={() => setSourcesOpen(true)} onAgent={onAgent} />
            <nav className="mt-8 flex flex-col gap-1" aria-label="Tasks">
              {TASKS.map((item) => {
                const Icon = TASK_ICON[item.id]
                const on = !savedOnly && task === item.id && !searching
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseTask(item.id)}
                    className={`flex h-11 items-center justify-between rounded-lg px-3 text-left ${on ? "bg-accent text-ink" : "text-fg hover:bg-raised"}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={16} aria-hidden />
                      {item.label}
                    </span>
                    <span className={on ? "text-ink" : "text-muted"}>{counts.tasks.get(item.id) ?? 0}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  setSavedOnly(true)
                  setQuery("")
                }}
                className={`mt-3 flex h-11 items-center justify-between rounded-lg px-3 text-left ${savedOnly ? "bg-accent text-ink" : "text-fg hover:bg-raised"}`}
              >
                <span className="flex items-center gap-2">
                  <Star size={16} aria-hidden />
                  Saved
                </span>
                <span className={savedOnly ? "text-ink" : "text-muted"}>{stars.length}</span>
              </button>
            </nav>
            <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">
              Not official commands. Copy the code with its meaning.
            </p>
          </div>
        </aside>

        <main className={`min-w-0 flex-1 px-4 py-5 md:px-0 md:py-6 md:pr-6 ${stacked.length ? "pb-40" : "pb-10"}`}>
          <div className="md:hidden">
            <Brand onSources={() => setSourcesOpen(true)} onAgent={onAgent} />
          </div>

          <label className="mt-5 flex h-12 items-center gap-3 rounded-lg border border-line bg-surface px-3 md:mt-0">
            <Search size={18} className="shrink-0 text-muted" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search codes, light, cutaway, debug"
              className="w-full bg-transparent font-mono text-base text-fg outline-none placeholder:text-muted"
              aria-label="Search codes"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="text-muted" aria-label="Clear search">
                <X size={18} />
              </button>
            ) : null}
          </label>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Tasks">
            {TASKS.map((item) => {
              const on = !savedOnly && task === item.id && !searching
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseTask(item.id)}
                  className={`h-11 shrink-0 rounded-full px-4 ${on ? "bg-accent text-ink" : "border border-line bg-surface text-fg"}`}
                >
                  {item.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => {
                setSavedOnly((value) => !value)
                setQuery("")
              }}
              className={`h-11 shrink-0 rounded-full px-4 ${savedOnly ? "bg-accent text-ink" : "border border-line bg-surface text-fg"}`}
            >
              Saved {stars.length}
            </button>
          </div>

          {!searching && !savedOnly ? (
            <>
              <p className="mt-4 max-w-2xl text-muted">{current.blurb}</p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Facets">
                <FacetChip on={facet === "all"} onClick={() => setFacet("all")} label="All" count={counts.tasks.get(task) ?? 0} />
                {current.facets.map((item) => (
                  <FacetChip
                    key={item.id}
                    on={facet === item.id}
                    onClick={() => setFacet(item.id)}
                    label={item.label}
                    count={counts.facets.get(`${task}:${item.id}`) ?? 0}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-muted">
              {searching
                ? `Searching the whole book for “${query.trim()}”.`
                : "Codes you starred on this device."}
            </p>
          )}

          <p className="mt-4 font-mono text-sm text-muted">
            {visible.length} {visible.length === 1 ? "code" : "codes"}
            {!searching && !savedOnly && facet !== "all" ? ` · ${facetName(task, facet)}` : ""}
          </p>

          {visible.length === 0 ? (
            <div className="mt-6 rounded-lg border border-line bg-surface p-6">
              <p className="text-lg">Nothing in this drawer.</p>
              <p className="mt-2 text-muted">Try another facet, or search a word like window, cutaway, or refactor.</p>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {visible.map((entry) => (
                <li key={entry.id}>
                  <article className="flex h-full flex-col rounded-lg border border-line bg-surface p-4">
                    <button type="button" onClick={() => setActiveId(entry.id)} className="text-left">
                      <p className="font-mono text-lg text-accent">{entry.code}</p>
                      <p className="mt-2 line-clamp-3 text-fg">{entry.meaning}</p>
                    </button>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-sm text-muted">
                        {taskName(entry.task)} · {facetName(entry.task, entry.facet)}
                      </p>
                      <div className="flex shrink-0 gap-1">
                        <IconButton
                          label={starSet.has(entry.id) ? "Remove from saved" : "Save code"}
                          onClick={() => toggleStar(entry.id)}
                        >
                          <Star size={16} fill={starSet.has(entry.id) ? "currentColor" : "none"} />
                        </IconButton>
                        <IconButton
                          label={copied === entry.id ? "Prompt copied" : "Copy prompt"}
                          onClick={() => copyText(entry.prompt, entry.id)}
                        >
                          {copied === entry.id ? <Check size={16} /> : <Copy size={16} />}
                        </IconButton>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {stacked.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-sm text-muted">Stack · {stacked.length} of 4</p>
              <p className="truncate font-mono text-fg">{stacked.map((item) => item.code).join("  ")}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStack([])}
                className="h-11 rounded-lg border border-line px-4 text-fg"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => copyText(stackPrompt(stacked), "stack")}
                className="h-11 rounded-lg bg-accent px-4 font-medium text-ink"
              >
                {copied === "stack" ? "Copied" : "Copy stack"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {active ? (
        <Sheet title={active.code} onClose={() => setActiveId(null)}>
          <p className="font-mono text-sm text-muted">
            {taskName(active.task)} · {facetName(active.task, active.facet)}
            {active.n ? ` · #${String(active.n).padStart(3, "0")}` : ""}
          </p>
          <p className="mt-4 text-xl leading-snug">{active.meaning}</p>
          <p className="mt-4 text-sm text-muted">{active.sourceLabel}</p>
          {active.catalog ? <p className="mt-1 text-sm text-muted">Original folder: {titleCase(active.catalog)}</p> : null}
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => copyText(active.prompt, "prompt")}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent font-medium text-ink"
            >
              {copied === "prompt" ? <Check size={16} /> : <Copy size={16} />}
              {copied === "prompt" ? "Prompt copied" : "Copy prompt"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copyText(active.code, "token")}
                className="h-12 rounded-lg border border-line"
              >
                {copied === "token" ? "Code copied" : "Copy code"}
              </button>
              <button
                type="button"
                onClick={() => toggleStack(active.id)}
                disabled={!stack.includes(active.id) && stack.length >= 4}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line disabled:opacity-40"
              >
                <Plus size={16} />
                {stack.includes(active.id) ? "In stack" : "Add to stack"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleStar(active.id)}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line"
            >
              <Star size={16} fill={starSet.has(active.id) ? "currentColor" : "none"} />
              {starSet.has(active.id) ? "Saved" : "Save"}
            </button>
          </div>
          <pre className="mt-6 whitespace-pre-wrap rounded-lg bg-raised p-4 font-mono text-sm leading-relaxed text-fg">
            {active.prompt}
          </pre>
        </Sheet>
      ) : null}

      {sourcesOpen ? (
        <Sheet title="Where these came from" onClose={() => setSourcesOpen(false)}>
          <div className="space-y-4 text-fg">
            <p>
              None of these are secret switches built into ChatGPT or any other model. They are shorthand.
              The model follows them when you also paste the meaning.
            </p>
            <SourceBlock
              title="Savage codebook"
              body="642 visual codewords from the uploaded field manual. Each one was written as a one-line direction for an uploaded photo: ads, cutaways, light, materials, repairs, and the rest. The book itself says they are custom labels, not official commands."
            />
            <SourceBlock
              title="Maverick AI"
              body="Public 2026 lists of writing, study, decision, and critique codes, plus a separate image-and-video set. The video codes in that list are described as working more reliably when a video tool such as Higgsfield is connected. Duplicates of the Savage book were left out."
            />
            <SourceBlock
              title="Community camera list"
              body="Angles, lenses, and focus tokens that circulate next to those visual codebooks, such as worm’s-eye, rule of thirds, and bokeh. Only ones that were not already in the Savage book were added."
            />
            <SourceBlock
              title="Code"
              body="Public roundups publish only a few coding tokens: DEBUG, EXPLAINCODE, and OPTIMIZE. The other code tokens here use that same pattern and are marked Community shorthand."
            />
          </div>
        </Sheet>
      ) : null}
    </div>
  )
}

function Brand({ onSources, onAgent }: { onSources: () => void; onAgent?: () => void }) {
  return (
    <div>
      <p className="font-mono text-sm text-accent">/codes</p>
      <h1 className="mt-1 text-4xl leading-none tracking-tight">Cuebook</h1>
      <button type="button" onClick={onSources} className="mt-3 text-left text-sm text-muted underline-offset-4 hover:underline">
        {CODES.length} community codes · sources
      </button>
      {onAgent ? (
        <button type="button" onClick={onAgent} className="mt-2 block text-left text-sm text-accent">
          Agent commands
        </button>
      ) : null}
    </div>
  )
}

function FacetChip({
  on,
  onClick,
  label,
  count,
}: {
  on: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-4 ${on ? "bg-paper text-ink" : "border border-line bg-surface text-fg"}`}
      aria-pressed={on}
      data-facet={label}
    >
      {label}
      <span className={`ml-2 font-mono text-sm ${on ? "text-ink" : "text-muted"}`}>{count}</span>
    </button>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg"
    >
      {children}
    </button>
  )
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-bg/80" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-xl border border-line bg-surface p-5 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[32rem] md:rounded-none md:border-y-0 md:border-r-0">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-mono text-2xl text-accent">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close panel" className="flex h-11 w-11 items-center justify-center rounded-lg border border-line">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function SourceBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg bg-raised p-4">
      <h3 className="text-lg">{title}</h3>
      <p className="mt-2 text-muted">{body}</p>
    </section>
  )
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
}
