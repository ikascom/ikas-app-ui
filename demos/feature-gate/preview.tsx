"use client"

import { EyeIcon, WebhookIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"
import { FeatureGate } from "@/components/ikas/feature-gate"

const sample = [
  {
    url: "https://api.magaza.example/siparis",
    event: "order.created",
    live: true,
  },
  {
    url: "https://erp.magaza.example/stok",
    event: "product.stock.updated",
    live: true,
  },
  {
    url: "https://hooks.magaza.example/iade",
    event: "order.refunded",
    live: false,
  },
  {
    url: "https://crm.magaza.example/musteri",
    event: "customer.created",
    live: true,
  },
]

export default function FeatureGatePreview() {
  return (
    <Card className="w-full max-w-xl gap-0 overflow-hidden py-0">
      <CardHeader className="border-b py-3.5">
        <CardTitle>{"Webhook'lar"}</CardTitle>
        <CardAction>
          <Badge>
            <EyeIcon />
            Örnek önizleme
          </Badge>
        </CardAction>
      </CardHeader>
      <FeatureGate
        locked
        variant="preview"
        title="Webhook'lar Pro planda"
        description="Olayları dış sistemlerinize anlık gönderin."
        onUpgrade={() => toast("Planlar açılıyor")}
        preview={
          <ul className="divide-y">
            {sample.map((hook) => (
              <li key={hook.url} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-7 place-items-center rounded-md bg-muted text-icon">
                  <WebhookIcon className="size-3.5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-mono text-xs">{hook.url}</span>
                  <span className="text-xs text-muted-foreground">{hook.event}</span>
                </span>
                <Badge status={hook.live ? "success" : "warning"} dot>
                  {hook.live ? "Etkin" : "Yeniden deniyor"}
                </Badge>
              </li>
            ))}
          </ul>
        }
      >
        <EmptyState
          media={<WebhookIcon />}
          title="Henüz webhook yok"
          description="İlk webhook'u eklediğinizde olaylar burada listelenir."
          actions={<Button variant="outline">Webhook ekle</Button>}
        />
      </FeatureGate>
    </Card>
  )
}
