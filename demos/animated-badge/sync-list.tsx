"use client"

import * as React from "react"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedBadge, type AnimatedBadgeStatus } from "@/components/ikas/animated-badge"

type Row = { id: string; name: string; status: AnimatedBadgeStatus; label: string }

const initial: Row[] = [
  { id: "IK-2041", name: "Pamuklu tişört", status: "neutral", label: "Bekliyor" },
  { id: "IK-2042", name: "Keten gömlek", status: "neutral", label: "Bekliyor" },
  { id: "IK-2043", name: "Deri cüzdan", status: "neutral", label: "Bekliyor" },
  { id: "IK-2044", name: "Yün atkı", status: "neutral", label: "Bekliyor" },
]
const outcomes: Pick<Row, "status" | "label">[] = [
  { status: "success", label: "Eşitlendi" },
  { status: "warning", label: "Eşleşmedi" },
  { status: "success", label: "Eşitlendi" },
  { status: "danger", label: "Reddedildi" },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function AnimatedBadgeSyncList() {
  const [rows, setRows] = React.useState(initial)
  const [running, setRunning] = React.useState(false)
  const patch = (index: number, next: Pick<Row, "status" | "label">) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)))

  async function run() {
    setRunning(true)
    setRows(initial)
    await wait(400)
    for (let i = 0; i < initial.length; i++) {
      patch(i, { status: "loading", label: "Eşitleniyor" })
      await wait(260)
    }
    await wait(500)
    for (let i = 0; i < initial.length; i++) {
      patch(i, outcomes[i])
      await wait(220)
    }
    setRunning(false)
  }

  return (
    <Card className="w-full max-w-md gap-0 py-0">
      <ul className="divide-y text-sm">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-16 font-mono text-xs text-muted-foreground">{row.id}</span>
            <span className="flex-1 truncate">{row.name}</span>
            <AnimatedBadge status={row.status} media={row.status === "loading" ? "icon" : "dot"}>
              {row.label}
            </AnimatedBadge>
          </li>
        ))}
      </ul>
      <div className="border-t p-3">
        <Button size="sm" variant="outline" loading={running} onClick={run}>
          <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
          Eşitlemeyi başlat
        </Button>
      </div>
    </Card>
  )
}
