import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Aperture,
  BookOpen,
  Check,
  Compass,
  Copy,
  Globe,
  Hammer,
  PenLine,
  PenTool,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Wrench,
  X,
} from "lucide-react"
import {
  BRIEF_LIMIT,
  COMMANDS,
  GROUPS,
  PRESETS,
  bookMarkdown,
  briefPrompt,
  groupName,
  matchesCommand,
  rankCommand,
  singlePrompt,
  type AgentCommand,
  type GroupId,
} from "@/lib/agent-catalog"

const STAR_KEY = "agent-stars"
const BRIEF_KEY = "agent-brief"
const TASK_KEY = "agent-task"

const GROUP_ICON = {
  control: SlidersHorizontal,
  read: BookOpen,
  build: Hammer,
  repair: Wrench,
  ship: ShieldCheck,
  research: Search,
  write: PenLine,
  design: PenTool,
  picture: Aperture,
  browser: Globe,
  study: Compass,
  decide: Scale,
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

export function AgentBook({ onCodes }: { onCodes: () => void }) {
  const [group, setGroup] = useState<GroupId | "all">("all")
  const [query, setQuery] = useState("")
  const [savedOnly, setSavedOnly] = useState(false)
  const [stars, setStars] = useState<string[]>([])
  const [brief, setBrief] = useState<string[]>([])
  const [task, setTask] = useState("")
  const [ready, setReady] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const known = new Set(COMMANDS.map((command) => command.id))
    setStars(loadList(STAR_KEY).filter((id) => known.has(id)))
    setBrief(loadList(BRIEF_KEY).filter((id) => known.has(id)).slice(0, BRIEF_LIMIT))
    setTask(localStorage.getItem(TASK_KEY) ?? "")
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STAR_KEY, JSON.stringify(stars))
  }, [stars, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(BRIEF_KEY, JSON.stringify(brief))
  }, [brief, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(TASK_KEY, task)
  }, [task, ready])

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
        setAboutOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const starSet = useMemo(() => new Set(stars), [stars])
  const briefSet = useMemo(() => new Set(brief), [brief])
  const byId = useMemo(() => new Map(COMMANDS.map((command) => [command.id, command])), [])
  const active = activeId ? byId.get(activeId) ?? null : null
  const stacked = brief.map((id) => byId.get(id)).filter((command): command is AgentCommand => Boolean(command))
  const searching = query.trim().length > 0
  const current = GROUPS.find((item) => item.id === group)

  const counts = useMemo(() => {
    const groups = new Map<GroupId, number>()
    for (const command of COMMANDS) groups.set(command.group, (groups.get(command.group) ?? 0) + 1)
    return groups
  }, [])

  const visible = useMemo(() => {
    return COMMANDS.filter((command) => {
      if (savedOnly && !starSet.has(command.id)) return false
      if (!searching && !savedOnly && group !== "all" && command.group !== group) return false
      return matchesCommand(command, query)
    }).sort((a, b) => rankCommand(a, query).localeCompare(rankCommand(b, query)))
  }, [group, query, savedOnly, searching, starSet])

  const sections = useMemo(() => {
    if (searching || savedOnly) return [{ id: "flat" as const, label: "", blurb: "", items: visible }]
    const source = group === "all" ? GROUPS : GROUPS.filter((item) => item.id === group)
    return source
      .map((item) => ({
        id: item.id,
        label: item.label,
        blurb: group === "all" ? "" : item.blurb,
        items: visible.filter((command) => command.group === item.id),
      }))
      .filter((item) => item.items.length > 0)
  }, [group, savedOnly, searching, visible])

  function flash(key: string) {
    setCopied(key)
    window.setTimeout(() => setCopied((currentKey) => (currentKey === key ? null : currentKey)), 1400)
  }

  async function copyText(text: string, key: string) {
    const ok = await writeClipboard(text)
    flash(ok ? key : `fail:${key}`)
  }

  function toggleStar(id: string) {
    setStars((currentStars) =>
      currentStars.includes(id) ? currentStars.filter((item) => item !== id) : [...currentStars, id],
    )
  }

  function toggleBrief(id: string) {
    setBrief((currentBrief) => {
      if (currentBrief.includes(id)) return currentBrief.filter((item) => item !== id)
      if (currentBrief.length >= BRIEF_LIMIT) return currentBrief
      return [...currentBrief, id]
    })
  }

  function applyPreset(ids: string[]) {
    setBrief(ids.slice(0, BRIEF_LIMIT))
  }

  function chooseGroup(next: GroupId | "all") {
    setGroup(next)
    setSavedOnly(false)
    setQuery("")
  }

  const briefOpen = stacked.length > 0 || task.trim().length > 0

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl md:gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-0 flex h-dvh flex-col px-4 py-6">
            <Brand onAbout={() => setAboutOpen(true)} onCodes={onCodes} />
            <nav className="mt-8 flex min-h-0 flex-1 flex-col" aria-label="Groups">
              <RailButton on={!savedOnly && group === "all" && !searching} onClick={() => chooseGroup("all")} label="All" count={COMMANDS.length} />
              <button
                type="button"
                onClick={() => {
                  setSavedOnly(true)
                  setQuery("")
                }}
                className={`mt-1 flex h-11 items-center justify-between rounded-lg px-3 text-left ${savedOnly ? "bg-accent text-ink" : "text-fg hover:bg-raised"}`}
              >
                <span className="flex items-center gap-2">
                  <Star size={16} aria-hidden />
                  Saved
                </span>
                <span className={savedOnly ? "text-ink" : "text-muted"}>{stars.length}</span>
              </button>
              <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                {GROUPS.map((item) => {
                  const Icon = GROUP_ICON[item.id]
                  const on = !savedOnly && group === item.id && !searching
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseGroup(item.id)}
                      className={`flex h-11 shrink-0 items-center justify-between rounded-lg px-3 text-left ${on ? "bg-accent text-ink" : "text-fg hover:bg-raised"}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} aria-hidden />
                        {item.label}
                      </span>
                      <span className={on ? "text-ink" : "text-muted"}>{counts.get(item.id) ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
            <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">
              Paste the command with its meaning. Earlier commands win.
            </p>
          </div>
        </aside>

        <main className={`min-w-0 flex-1 px-4 py-5 md:px-0 md:py-6 md:pr-6 ${briefOpen ? "pb-80" : "pb-10"}`}>
          <div className="md:hidden">
            <Brand onAbout={() => setAboutOpen(true)} onCodes={onCodes} />
          </div>

          <div className="sticky top-0 z-20 -mx-4 bg-bg px-4 pt-4 md:mx-0 md:px-0 md:pt-0">
            <label className="flex h-12 items-center gap-3 rounded-lg border border-line bg-surface px-3">
              <Search size={18} className="shrink-0 text-muted" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plan, debug, quiz, browser"
                className="w-full bg-transparent font-mono text-base text-fg outline-none placeholder:text-muted"
                aria-label="Search commands"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="text-muted" aria-label="Clear search">
                  <X size={18} />
                </button>
              ) : null}
            </label>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-3 md:hidden" aria-label="Groups">
              <Chip on={!savedOnly && group === "all" && !searching} onClick={() => chooseGroup("all")} label="All" count={COMMANDS.length} />
              {GROUPS.map((item) => (
                <Chip
                  key={item.id}
                  on={!savedOnly && group === item.id && !searching}
                  onClick={() => chooseGroup(item.id)}
                  label={item.label}
                  count={counts.get(item.id) ?? 0}
                />
              ))}
              <Chip
                on={savedOnly}
                onClick={() => {
                  setSavedOnly(true)
                  setQuery("")
                }}
                label="Saved"
                count={stars.length}
              />
            </div>
          </div>

          {!searching && !savedOnly ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Presets">
              {PRESETS.map((preset) => {
                const on = preset.ids.length === brief.length && preset.ids.every((id, index) => brief[index] === id)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.ids)}
                    className={`h-11 shrink-0 rounded-full px-4 ${on ? "bg-paper text-ink" : "border border-line bg-surface text-fg"}`}
                    aria-pressed={on}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-mono text-sm text-muted">
              {visible.length} {visible.length === 1 ? "command" : "commands"}
              {searching ? ` · “${query.trim()}”` : ""}
              {!searching && !savedOnly && current ? ` · ${current.label}` : ""}
              {savedOnly ? " · saved" : ""}
            </p>
            <button
              type="button"
              onClick={() => copyText(bookMarkdown(visible.length === COMMANDS.length ? COMMANDS : visible), "book")}
              className="h-11 shrink-0 rounded-lg border border-line px-3 text-sm"
            >
              {copied === "book" ? "Copied" : copied === "fail:book" ? "Couldn't copy" : "Copy list"}
            </button>
          </div>

          {!searching && !savedOnly && current ? <p className="mt-3 max-w-2xl text-muted">{current.blurb}</p> : null}
          {searching ? <p className="mt-3 text-muted">Searching all {COMMANDS.length} commands.</p> : null}
          {savedOnly ? <p className="mt-3 text-muted">Commands you starred on this device.</p> : null}

          {visible.length === 0 ? (
            <div className="mt-6 rounded-lg border border-line bg-surface p-6">
              <p className="text-lg">Nothing in this list.</p>
              <p className="mt-2 text-muted">Try plan, knee, clipboard, or browser.</p>
            </div>
          ) : (
            <div className="mt-2">
              {sections.map((section) => (
                <section key={section.id} className="mt-4">
                  {section.label && group === "all" && !searching && !savedOnly ? (
                    <h2 className="font-mono text-sm text-muted">{section.label}</h2>
                  ) : null}
                  <ul className="mt-1">
                    {section.items.map((command) => {
                      const inBrief = briefSet.has(command.id)
                      const full = brief.length >= BRIEF_LIMIT && !inBrief
                      return (
                        <li key={command.id} className="border-b border-line">
                          <div className="flex items-stretch gap-1">
                            <button type="button" onClick={() => setActiveId(command.id)} className="min-w-0 flex-1 py-3 text-left">
                              <p className="font-mono text-lg text-accent">{command.code}</p>
                              <p className="mt-1 line-clamp-2 text-fg">{command.meaning}</p>
                              {searching || savedOnly ? (
                                <p className="mt-1 text-sm text-muted">{groupName(command.group)}</p>
                              ) : null}
                            </button>
                            <div className="flex shrink-0 items-center">
                              <IconButton
                                label={starSet.has(command.id) ? "Remove from saved" : "Save command"}
                                onClick={() => toggleStar(command.id)}
                              >
                                <Star size={16} fill={starSet.has(command.id) ? "currentColor" : "none"} />
                              </IconButton>
                              <IconButton
                                label={inBrief ? "Remove from brief" : full ? "Brief is full" : "Add to brief"}
                                onClick={() => toggleBrief(command.id)}
                                disabled={full}
                              >
                                {inBrief ? <Check size={16} /> : <Plus size={16} />}
                              </IconButton>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {briefOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-muted">
                Brief · {stacked.length} of {BRIEF_LIMIT}
              </p>
              <button
                type="button"
                onClick={() => {
                  setBrief([])
                  setTask("")
                }}
                className="h-11 rounded-lg border border-line px-4"
              >
                Clear
              </button>
            </div>
            <p className="truncate font-mono text-fg">{stacked.map((command) => command.code).join("  ") || "Add a command"}</p>
            <label className="block">
              <span className="sr-only">Task for the brief</span>
              <textarea
                value={task}
                onChange={(event) => setTask(event.target.value)}
                rows={2}
                placeholder="Write the task the agent should do"
                className="w-full resize-none rounded-lg border border-line bg-surface p-3 text-fg outline-none placeholder:text-muted"
              />
            </label>
            <button
              type="button"
              onClick={() => copyText(briefPrompt(stacked, task), "brief")}
              disabled={stacked.length === 0}
              className="h-12 rounded-lg bg-accent font-medium text-ink disabled:opacity-40"
            >
              {copied === "brief" ? "Brief copied" : copied === "fail:brief" ? "Couldn't copy" : "Copy brief"}
            </button>
          </div>
        </div>
      ) : null}

      {active ? (
        <Sheet title={active.code} onClose={() => setActiveId(null)}>
          <p className="font-mono text-sm text-muted">{groupName(active.group)}</p>
          <p className="mt-4 text-xl leading-snug">{active.meaning}</p>
          <p className="mt-4 text-muted">When: {active.when}</p>
          <p className="mt-2 text-muted">Do not: {active.avoid}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            {active.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-4 rounded-lg bg-raised p-4">
            <p className="font-mono text-sm text-muted">Example task</p>
            <p className="mt-2 whitespace-pre-wrap">{active.example}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => copyText(singlePrompt(active), "prompt")}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent font-medium text-ink"
            >
              {copied === "prompt" ? <Check size={16} /> : <Copy size={16} />}
              {copied === "prompt" ? "Command copied" : copied === "fail:prompt" ? "Couldn't copy" : "Copy command"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copyText(`${singlePrompt(active)}\n\nExample task:\n${active.example}`, "example")}
                className="h-12 rounded-lg border border-line"
              >
                {copied === "example" ? "Copied" : "With example"}
              </button>
              <button
                type="button"
                onClick={() => toggleBrief(active.id)}
                disabled={!briefSet.has(active.id) && brief.length >= BRIEF_LIMIT}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line disabled:opacity-40"
              >
                {briefSet.has(active.id) ? <Check size={16} /> : <Plus size={16} />}
                {briefSet.has(active.id) ? "In brief" : "Add to brief"}
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
        </Sheet>
      ) : null}

      {aboutOpen ? (
        <Sheet title="How to use this" onClose={() => setAboutOpen(false)}>
          <div className="space-y-4 text-fg">
            <p>These are instructions you paste to your agent. They are not hidden switches. A command works because the meaning goes with the token.</p>
            <p>Add a few commands, write the task, and copy the brief. If two commands conflict, the earlier one wins. Six is the cap so the paste stays usable.</p>
            <p>Picture codes — light, cutaways, ads, the rest of the visual shorthand — are in the other book. /codes tells the agent to follow those meanings too.</p>
            <button type="button" onClick={onCodes} className="h-12 w-full rounded-lg bg-accent font-medium text-ink">
              Open picture codes
            </button>
          </div>
        </Sheet>
      ) : null}
    </div>
  )
}

function Brand({ onAbout, onCodes }: { onAbout: () => void; onCodes: () => void }) {
  return (
    <div>
      <p className="font-mono text-sm text-accent">/agent</p>
      <h1 className="mt-1 text-4xl leading-none tracking-tight">Cuebook</h1>
      <button type="button" onClick={onAbout} className="mt-3 text-left text-sm text-muted underline-offset-4 hover:underline">
        {COMMANDS.length} commands · how to use
      </button>
      <button type="button" onClick={onCodes} className="mt-2 block text-left text-sm text-accent">
        Picture codes
      </button>
    </div>
  )
}

function RailButton({
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
      className={`flex h-11 items-center justify-between rounded-lg px-3 text-left ${on ? "bg-accent text-ink" : "text-fg hover:bg-raised"}`}
    >
      <span>{label}</span>
      <span className={on ? "text-ink" : "text-muted"}>{count}</span>
    </button>
  )
}

function Chip({
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
      className={`h-11 shrink-0 rounded-full px-4 ${on ? "bg-accent text-ink" : "border border-line bg-surface text-fg"}`}
      aria-pressed={on}
    >
      {label}
      <span className={`ml-2 font-mono text-sm ${on ? "text-ink" : "text-muted"}`}>{count}</span>
    </button>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-fg disabled:opacity-40"
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
