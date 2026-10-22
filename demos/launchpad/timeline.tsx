"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Launchpad, type LaunchpadStep } from "@/components/ikas/launchpad"

const base: (Omit<LaunchpadStep, "status" | "actions"> & { action: string })[] = [
  { id: "connect", label: "Pazaryeri hesabını bağla", description: "API anahtarını gir; bağlantı test edilir.", eta: "~1 dk", action: "Bağla" },
  { id: "products", label: "Ürünleri seç", description: "Gönderilecek kategorileri işaretle.", eta: "~3 dk", action: "Ürünleri seç" },
  { id: "price", label: "Fiyat kuralı ekle", description: "Komisyonu fiyata yansıt.", eta: "~2 dk", action: "Kural ekle" },
  { id: "preview", label: "Önizle", description: "İlk 10 ürünü pazaryeri görünümünde kontrol et.", eta: "~2 dk", action: "Önizle", requires: ["products"] },
  { id: "publish", label: "Yayınla", description: "Ürünleri pazaryerine gönder.", eta: "~5 dk", action: "Yayınla", requires: ["price"] },
]

/**
 * The checklist with diamond markers and the header ring: tick a step (or finish it from its action) and
 * its title is struck through; a beat later the row folds into "Tamamlananlar" and the next step opens.
 */
export default function LaunchpadTimeline() {
  const [done, setDone] = React.useState<string[]>([])
  const [running, setRunning] = React.useState<string | null>(null)
  const toggle = (id: string, on: boolean) => setDone((d) => (on ? [...d, id] : d.filter((x) => x !== id)))
  const run = (id: string) => {
    setRunning(id)
    setTimeout(() => (setRunning(null), toggle(id, true)), 900)
  }

  const steps: LaunchpadStep[] = base.map(({ action, ...step }) => ({
    ...step,
    status: done.includes(step.id) ? "done" : undefined,
    actions: (
      <Button size="sm" loading={running === step.id} onClick={() => run(step.id)}>
        {action}
      </Button>
    ),
  }))

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Launchpad
        layout="checklist"
        marker="diamond"
        progressType="ring"
        title="Pazaryerine bağlan"
        steps={steps}
        onStepToggle={toggle}
        onDismiss={() => setDone([])}
      />
    </div>
  )
}
