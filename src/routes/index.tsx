import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AgentBook } from "@/components/agent-book"
import { Cuebook } from "@/components/cuebook"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  const [book, setBook] = useState<"agent" | "codes">("agent")
  if (book === "codes") return <Cuebook onAgent={() => setBook("agent")} />
  return <AgentBook onCodes={() => setBook("codes")} />
}
