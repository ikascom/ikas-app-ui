"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Launchpad, type LaunchpadStep } from "@/components/ikas/launchpad"

const base: LaunchpadStep[] = [
  { id: "permissions", label: "İzinleri onayla", eta: "~1 dk" },
  { id: "settings", label: "Temel ayarları yap", eta: "~3 dk" },
  { id: "first", label: "İlk kaydı oluştur", requires: ["permissions"] },
]

export default function LaunchpadStates() {
  // Controlled: the page decides which step is open and whether the card is collapsed.
  const [collapsed, setCollapsed] = React.useState(true)
  const [activeId, setActiveId] = React.useState<string | null>("settings")
  const [dismissed, setDismissed] = React.useState(false)

  const inProgress = base.map((step) => ({
    ...step,
    status: step.id === "permissions" ? ("done" as const) : undefined,
    description: "Adım açıklaması burada görünür.",
    actions: <Button size="sm">Devam et</Button>,
  }))
  const finished = base.map((step) => ({ ...step, status: "done" as const }))

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Launchpad
        title="Küçültülmüş"
        steps={inProgress}
        activeId={activeId}
        onActiveChange={setActiveId}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      {dismissed ? (
        <Button variant="outline" className="self-start" onClick={() => setDismissed(false)}>
          Tamamlanan kartı geri getir
        </Button>
      ) : (
        <Launchpad
          title="Hepsi tamam"
          steps={finished}
          onDismiss={() => (setDismissed(true), toast("Kart kaldırıldı"))}
        />
      )}
    </div>
  )
}
