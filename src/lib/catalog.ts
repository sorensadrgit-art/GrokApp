import raw from "@/data/codes.json"

export type TaskId =
  | "image"
  | "design"
  | "explain"
  | "video"
  | "code"
  | "write"
  | "think"

export type CodeEntry = {
  id: string
  code: string
  slug: string
  meaning: string
  task: TaskId
  facet: string
  source: string
  sourceLabel: string
  catalog: string
  n: number | null
  prompt: string
}

export const CODES: CodeEntry[] = raw.codes as CodeEntry[]

export type Facet = { id: string; label: string }

export type TaskMeta = {
  id: TaskId
  label: string
  blurb: string
  facets: Facet[]
}

export const TASKS: TaskMeta[] = [
  {
    id: "image",
    label: "Image",
    blurb: "Upload a picture, then paste one code. Light, position, focus, and style are separate on purpose.",
    facets: [
      { id: "light", label: "Light" },
      { id: "position", label: "Position" },
      { id: "focus", label: "Focus" },
      { id: "style", label: "Style" },
      { id: "materials", label: "Materials" },
      { id: "worlds", label: "Worlds" },
      { id: "setpieces", label: "Set pieces" },
      { id: "motion", label: "Motion" },
    ],
  },
  {
    id: "design",
    label: "Design",
    blurb: "Ads, shelves, packaging, brand marks, and layouts. Paste the code with the product or name you actually have.",
    facets: [
      { id: "ads", label: "Ads" },
      { id: "retail", label: "Retail" },
      { id: "product", label: "Product" },
      { id: "publishing", label: "Publishing" },
      { id: "brand", label: "Brand" },
    ],
  },
  {
    id: "explain",
    label: "Explain",
    blurb: "Cutaways, mechanisms, labels, lessons, and repairs. Ask for labels only where the code calls for them.",
    facets: [
      { id: "reveal", label: "Reveal" },
      { id: "mechanism", label: "Mechanism" },
      { id: "labels", label: "Labels" },
      { id: "teach", label: "Teach" },
      { id: "process", label: "Process" },
      { id: "repair", label: "Repair" },
      { id: "compare", label: "Compare" },
      { id: "anatomy", label: "Anatomy" },
    ],
  },
  {
    id: "video",
    label: "Video",
    blurb: "One code, one motion. These are the video shortcuts from public 2026 lists. A still photo is the usual input.",
    facets: [
      { id: "product", label: "Product" },
      { id: "camera", label: "Camera" },
      { id: "story", label: "Story" },
      { id: "explainer", label: "Explainer" },
    ],
  },
  {
    id: "code",
    label: "Code",
    blurb: "Paste the code under the meaning. DEBUG, EXPLAINCODE, and OPTIMIZE are widely circulated. The rest use the same shorthand pattern.",
    facets: [
      { id: "debug", label: "Debug" },
      { id: "structure", label: "Structure" },
      { id: "review", label: "Review" },
    ],
  },
  {
    id: "write",
    label: "Write",
    blurb: "Tone, length, and format. Paste your text under the code so the model keeps your meaning.",
    facets: [
      { id: "voice", label: "Voice" },
      { id: "shape", label: "Shape" },
      { id: "format", label: "Format" },
    ],
  },
  {
    id: "think",
    label: "Think",
    blurb: "Study, decisions, critique, and idea batches. Add the audience and the decision, or the code stays vague.",
    facets: [
      { id: "study", label: "Study" },
      { id: "decide", label: "Decide" },
      { id: "challenge", label: "Challenge" },
      { id: "ideas", label: "Ideas" },
    ],
  },
]

const facetLabel = new Map<string, string>()
for (const task of TASKS) {
  for (const facet of task.facets) facetLabel.set(`${task.id}:${facet.id}`, facet.label)
}

export function facetName(task: TaskId, facet: string) {
  return facetLabel.get(`${task}:${facet}`) ?? facet
}

export function taskName(task: TaskId) {
  return TASKS.find((item) => item.id === task)?.label ?? task
}

export function stackPrompt(items: CodeEntry[]) {
  const lines = items.map((item, index) => `${index + 1}. ${item.code} — ${item.meaning}`).join("\n")
  return [
    "Apply these codes together. They are community shorthand, not official commands. Follow each meaning.",
    "",
    lines,
    "",
    "Keep the subject recognizable. If a code asks for labels, quotes, prices, or facts, use only what I provide.",
  ].join("\n")
}

export function matchesQuery(entry: CodeEntry, query: string) {
  const q = query.trim().toLowerCase().replace(/^\//, "")
  if (!q) return true
  const hay = [
    entry.code,
    entry.meaning,
    entry.facet,
    entry.task,
    entry.sourceLabel,
    entry.catalog,
    facetName(entry.task, entry.facet),
    taskName(entry.task),
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(q)
}

export function rank(entry: CodeEntry, query: string) {
  const q = query.trim().toLowerCase().replace(/^\//, "")
  if (!q) return entry.code
  const code = entry.code.toLowerCase().replace(/^\//, "")
  if (code === q) return `0${code}`
  if (code.startsWith(q)) return `1${code}`
  if (code.includes(q)) return `2${code}`
  return `3${code}`
}
