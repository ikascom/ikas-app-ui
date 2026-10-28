"use client"

import * as React from "react"
import { BotIcon, CalendarIcon, DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FeatureGate } from "@/components/ikas/feature-gate"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { auditActionBadge, auditLogs, formatDate, type AuditLog } from "@/demos/_data"

type Plan = "free" | "pro"
type Scope = "all" | "products" | "orders" | "settings" | "staff"

const scopeOf: Record<Exclude<Scope, "all">, string[]> = {
  products: ["Ürün", "Stok"],
  orders: ["Sipariş", "Pazaryeri"],
  settings: ["Ödeme ayarları", "Kampanya"],
  staff: ["Personel"],
}

const columns: RecordTableColumn<AuditLog>[] = [
  {
    id: "date",
    header: "Tarih",
    className: "w-36",
    cell: (log) => <span className="text-muted-foreground">{formatDate(log.date)}</span>,
  },
  {
    id: "actor",
    header: "Personel",
    cell: (log) => (
      <span className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-semibold">{log.initials ?? <BotIcon className="size-3.5" />}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{log.actor}</span>
      </span>
    ),
  },
  {
    id: "action",
    header: "İşlem",
    cell: (log) => (
      <Badge status={auditActionBadge[log.action].status} dot>
        {auditActionBadge[log.action].label}
      </Badge>
    ),
  },
  { id: "record", header: "Kayıt" },
  {
    id: "source",
    header: "Kaynak",
    hideOnMobile: true,
    cell: (log) => <span className="text-muted-foreground">{log.source}</span>,
  },
]

export default function AuditLogsExample() {
  // Stands in for the store's real plan so the screen can be flipped both ways.
  const [plan, setPlan] = React.useState<Plan>("free")
  const [scope, setScope] = React.useState<Scope>("all")
  const locked = plan === "free"
  const upgrade = () => {
    setPlan("pro")
    toast.success("Pro plana geçildi")
  }

  const rows = auditLogs.filter((log) => scope === "all" || scopeOf[scope].some((prefix) => log.record.startsWith(prefix)))

  return (
    <Page width="wide">
      <PageHeader
        title="Denetim kayıtları"
        description="Mağazanızdaki değişiklikleri kimin, ne zaman yaptığını görün."
        actions={
          <>
            <SegmentedControl
              mode="radio"
              aria-label="Plan"
              value={plan}
              onValueChange={setPlan}
              options={[
                { value: "free", label: "Ücretsiz" },
                { value: "pro", label: "Pro" },
              ]}
            />
            <FeatureGate
              locked={locked}
              variant="action"
              title="Toplu dışa aktarma"
              description="Kayıtları CSV olarak indirmek Pro planda."
              onUpgrade={upgrade}
            >
              <Button variant="outline" onClick={() => toast.success("Kayıtlar indiriliyor")}>
                <DownloadIcon data-icon="inline-start" data-anim="drop" />
                Dışa aktar
              </Button>
            </FeatureGate>
          </>
        }
      />
      <FeatureGate
        locked={locked}
        title="Denetim kayıtları"
        description="Mağazanızdaki her değişikliği kimin yaptığını görmek için Pro plana geçin."
        onUpgrade={upgrade}
        onCompare={() => toast("Plan karşılaştırması açılıyor")}
      >
        <RecordTable
          label="Denetim kayıtları"
          columns={columns}
          rows={rows}
          getRowId={(log) => log.id}
          toolbar={
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                aria-label="Kayıt türü"
                value={scope}
                onValueChange={setScope}
                options={[
                  { value: "all", label: "Tümü" },
                  { value: "products", label: "Ürünler" },
                  { value: "orders", label: "Siparişler" },
                  { value: "settings", label: "Ayarlar" },
                  { value: "staff", label: "Personel" },
                ]}
              />
              <Button variant="outline" size="sm">
                <CalendarIcon data-icon="inline-start" />
                Son 30 gün
              </Button>
            </div>
          }
          pagination={{
            page: 1,
            pageCount: 3,
            onPageChange: () => {},
            summary: `1–${rows.length} / 2.418`,
          }}
        />
      </FeatureGate>
    </Page>
  )
}
