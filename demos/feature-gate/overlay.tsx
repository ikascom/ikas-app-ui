"use client"

import { toast } from "sonner"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { FeatureGate } from "@/components/ikas/feature-gate"
import { auditActionBadge, auditLogs, formatDate } from "@/demos/_data"

export default function FeatureGateOverlay() {
  return (
    <Card className="w-full max-w-xl gap-0 overflow-hidden py-0">
      <CardHeader className="border-b py-3.5">
        <CardTitle>Denetim kayıtları</CardTitle>
      </CardHeader>
      <FeatureGate
        locked
        title="Denetim kayıtları"
        description="Mağazandaki her değişikliği kimin yaptığını görmek için Pro plana geç."
        onUpgrade={() => toast("Planlar açılıyor")}
        onCompare={() => toast("Plan karşılaştırması açılıyor")}
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
