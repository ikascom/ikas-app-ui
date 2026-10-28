"use client"

import * as React from "react"

import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card"
import { FeatureGate } from "@/components/ikas/feature-gate"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { auditActionBadge, auditLogs, formatDate } from "@/demos/_data"

export default function FeatureGateUnlock() {
  const [plan, setPlan] = React.useState<"free" | "pro">("free")

  return (
    <Card className="w-full max-w-xl gap-0 overflow-hidden py-0">
      <CardHeader className="border-b py-3">
        <CardTitle>Denetim kayıtları</CardTitle>
        <CardAction>
          <SegmentedControl
            size="sm"
            mode="radio"
            aria-label="Plan"
            value={plan}
            onValueChange={setPlan}
            options={[
              { value: "free", label: "Ücretsiz" },
              { value: "pro", label: "Pro" },
            ]}
          />
        </CardAction>
      </CardHeader>
      <FeatureGate
        locked={plan === "free"}
        title="Denetim kayıtları"
        description="Mağazanızdaki her değişikliği kimin yaptığını görmek için Pro plana geçin."
        onUpgrade={() => setPlan("pro")}
      >
        <ul className="divide-y text-sm">
          {auditLogs.slice(0, 6).map((log) => (
            <li key={log.id} className="flex items-center gap-4 px-4 py-2.5">
              <span className="w-28 shrink-0 text-muted-foreground tabular-nums">{formatDate(log.date)}</span>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{log.actor}</span> {auditActionBadge[log.action].label.toLocaleLowerCase("tr")} · {log.record}
              </span>
            </li>
          ))}
        </ul>
      </FeatureGate>
    </Card>
  )
}
