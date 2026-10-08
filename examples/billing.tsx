"use client"

import * as React from "react"
import { CheckIcon, DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { Banner } from "@/components/ikas/banner"
import { ConfirmButton } from "@/components/ikas/confirm-button"
import { DescriptionList } from "@/components/ikas/description-list"
import { Meter } from "@/components/ikas/meter"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"

type Period = "monthly" | "yearly"
type PlanId = "starter" | "growth" | "enterprise"

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)

const plans: { id: PlanId; name: string; description: string; monthly: number | null; features: string[] }[] = [
  {
    id: "starter",
    name: "Başlangıç",
    description: "Tek kanalla satışa başlayan mağazalar için.",
    monthly: 299,
    features: ["Aylık 500 sipariş", "1.000 ürün", "Tek pazaryeri", "E-posta desteği"],
  },
  {
    id: "growth",
    name: "Büyüme",
    description: "Birden çok kanalda büyüyen mağazalar için.",
    monthly: 799,
    features: ["Aylık 2.000 sipariş", "5.000 ürün", "Sınırsız pazaryeri", "Otomasyon kuralları", "Öncelikli destek"],
  },
  {
    id: "enterprise",
    name: "Kurumsal",
    description: "Yüksek hacim ve özel entegrasyon ihtiyacı için.",
    monthly: null,
    features: ["Sınırsız sipariş ve ürün", "Özel API limitleri", "Hesap yöneticisi", "SLA ile destek"],
  },
]

const CURRENT: PlanId = "growth"
const rank: Record<PlanId, number> = { starter: 0, growth: 1, enterprise: 2 }

/** Yearly is billed per month at a 20% discount. */
const priceFor = (monthly: number, period: Period) => (period === "yearly" ? Math.round(monthly * 0.8) : monthly)

type Invoice = { id: string; date: string; period: string; amount: number; status: "paid" | "failed" | "refunded" }

const invoices: Invoice[] = [
  { id: "INV-2026-10", date: "1 Eki 2026", period: "Eki 2026", amount: 799, status: "paid" },
  { id: "INV-2026-09", date: "1 Eyl 2026", period: "Eyl 2026", amount: 799, status: "paid" },
  { id: "INV-2026-08", date: "1 Ağu 2026", period: "Ağu 2026", amount: 799, status: "failed" },
  { id: "INV-2026-07", date: "1 Tem 2026", period: "Tem 2026", amount: 299, status: "refunded" },
  { id: "INV-2026-06", date: "1 Haz 2026", period: "Haz 2026", amount: 299, status: "paid" },
]

const invoiceStatus = {
  paid: { label: "Ödendi", status: "success" },
  failed: { label: "Başarısız", status: "danger" },
  refunded: { label: "İade edildi", status: "neutral" },
} as const

const usage = [
  { label: "Aylık sipariş", value: 1208, max: 2000 },
  { label: "Ürün", value: 4120, max: 5000 },
  { label: "API istekleri", value: 9640, max: 10000 },
]

export default function BillingExample() {
  const [period, setPeriod] = React.useState<Period>("monthly")
  const [selected, setSelected] = React.useState<PlanId | null>(null)
  const [confirming, setConfirming] = React.useState(false)
  const nearLimit = usage.filter((u) => u.value / u.max >= 0.9)
  const target = plans.find((p) => p.id === selected)
  const current = plans.find((p) => p.id === CURRENT)!

  const columns: RecordTableColumn<Invoice>[] = [
    { id: "date", header: "Tarih", cell: (i) => <span className="font-medium">{i.date}</span> },
    { id: "period", header: "Dönem", hideOnMobile: true },
    { id: "amount", header: "Tutar", align: "end", cell: (i) => <span className="tabular-nums">{money(i.amount)}</span> },
    {
      id: "status",
      header: "Durum",
      cell: (i) => (
        <Badge status={invoiceStatus[i.status].status} dot={i.status === "paid"}>
          {invoiceStatus[i.status].label}
        </Badge>
      ),
    },
    {
      id: "download",
      header: <span className="sr-only">İndir</span>,
      align: "end",
      cell: (i) => (
        <Button variant="ghost" size="icon-sm" aria-label={`${i.id} faturasını indir`} onClick={() => toast(`${i.id} indiriliyor`)}>
          <DownloadIcon data-anim="drop" />
        </Button>
      ),
    },
  ]

  // Days left in the current monthly cycle, used for the proration summary.
  const daysLeft = 8
  const proration = target?.monthly != null ? Math.round(((priceFor(target.monthly, period) - priceFor(current.monthly!, period)) * daysLeft) / 30) : 0

  function confirmChange() {
    setConfirming(true)
    setTimeout(() => {
      setConfirming(false)
      setSelected(null)
      toast.success(`Planınız ${target?.name} olarak güncellendi`)
    }, 1100)
  }

  return (
    <Page>
      <PageHeader title="Plan ve faturalandırma" description="Aboneliğiniz, kullanım limitleriniz ve faturalarınız." />

      {nearLimit.length > 0 && (
        <Banner status="warning" title="API istek limitinize yaklaştınız" actions={<Button size="sm" variant="outline" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>Planları karşılaştır</Button>}>
          Bu ay {usage[2].max.toLocaleString("tr-TR")} isteğin %{Math.round((usage[2].value / usage[2].max) * 100)}&apos;i kullanıldı. Limit dolarsa eşitleme bir sonraki döneme kadar durur.
        </Banner>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Büyüme
            <Badge status="success" dot>
              Aktif
            </Badge>
          </CardTitle>
          <CardDescription>{money(799)} / ay · bir sonraki yenileme 1 Kasım 2026</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => toast("Ödeme yöntemi düzenleniyor")}>
              Ödeme yöntemini değiştir
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          {usage.map((u) => (
            <Meter key={u.label} label={u.label} value={u.value} max={u.max} />
          ))}
        </CardContent>
      </Card>

      <section id="plans" className="flex scroll-mt-6 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold">Planlar</h2>
            <p className="text-sm text-muted-foreground">Plan değişikliği hemen geçerli olur, fark bu dönem için oranlanır.</p>
          </div>
          <SegmentedControl
            mode="radio"
            aria-label="Faturalama dönemi"
            value={period}
            onValueChange={setPeriod}
            options={[
              { value: "monthly", label: "Aylık" },
              { value: "yearly", label: "Yıllık", badge: "%20 indirim" },
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === CURRENT
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col gap-5 rounded-xl bg-card p-5",
                  isCurrent ? "shadow-[0_0_0_2px_var(--foreground),0_4px_14px_-4px_var(--shade-2)]" : "shadow-card"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold">{plan.name}</h3>
                    {isCurrent && <Badge size="sm">Mevcut</Badge>}
                  </div>
                  <p className="text-[13px] text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  {plan.monthly == null ? (
                    <span className="text-2xl font-semibold tracking-[-0.02em]">Özel fiyat</span>
                  ) : (
                    <>
                      <AnimatedNumber value={priceFor(plan.monthly, period)} format={money} className="text-2xl font-semibold tracking-[-0.02em]" />
                      <span className="text-[13px] text-muted-foreground">/ ay{period === "yearly" ? ", yıllık ödenir" : ""}</span>
                    </>
                  )}
                </div>
                <ul className="flex flex-1 flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" disabled>
                    Mevcut plan
                  </Button>
                ) : plan.monthly == null ? (
                  <Button variant="outline" onClick={() => toast("Satış ekibi sizinle iletişime geçecek")}>
                    Satışla görüşün
                  </Button>
                ) : (
                  <Button variant={rank[plan.id] > rank[CURRENT] ? "solid" : "outline"} onClick={() => setSelected(plan.id)}>
                    {rank[plan.id] > rank[CURRENT] ? `${plan.name} planına geç` : `${plan.name} planına düş`}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold">Faturalar</h2>
        <RecordTable label="Faturalar" columns={columns} rows={invoices} getRowId={(i) => i.id} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-danger-border px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Aboneliği iptal et</span>
          <span className="text-[13px] text-muted-foreground">Dönem sonuna (1 Kasım) kadar kullanmaya devam edersiniz. Verileriniz 30 gün saklanır.</span>
        </div>
        <ConfirmButton size="sm" confirmLabel="Abonelik iptal edilsin mi?" onConfirm={() => toast.success("Aboneliğiniz dönem sonunda iptal edilecek")}>
          Aboneliği iptal et
        </ConfirmButton>
      </div>

      <Dialog open={target != null && target.monthly != null} onOpenChange={(open) => !open && !confirming && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.name} planına geçilsin mi?</DialogTitle>
            <DialogDescription>Değişiklik hemen geçerli olur. Bu dönemin kalan {daysLeft} günü için fark oranlanır.</DialogDescription>
          </DialogHeader>
          {target?.monthly != null && (
            <DescriptionList
              items={[
                { label: "Mevcut plan", value: `${current.name} · ${money(priceFor(current.monthly!, period))} / ay` },
                { label: "Yeni plan", value: `${target.name} · ${money(priceFor(target.monthly, period))} / ay` },
                { label: proration >= 0 ? "Bugün ödenecek" : "Hesabınıza eklenecek", value: <span className="font-medium tabular-nums">{money(Math.abs(proration))}</span> },
                { label: "Sonraki fatura", value: `1 Kasım 2026 · ${money(priceFor(target.monthly, period))}` },
              ]}
            />
          )}
          <DialogFooter>
            <Button variant="outline" disabled={confirming} onClick={() => setSelected(null)}>
              Vazgeç
            </Button>
            <Button loading={confirming} onClick={confirmChange}>
              Planı değiştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
