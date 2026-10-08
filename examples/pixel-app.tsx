"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon, CookieIcon, CreditCardIcon, EyeIcon, FileTextIcon, PauseIcon, PlayIcon, SendIcon, ServerIcon, ShoppingCartIcon, WalletIcon } from "lucide-react"
import { toast } from "sonner"

import { EASE_OUT } from "@/lib/motion"
import { Badge, type BadgeTone } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CopyIconButton } from "@/components/ikas/animated-check"
import { BarChart } from "@/components/ikas/bar-chart"
import { ChartCard } from "@/components/ikas/chart-card"
import { ConfirmButton } from "@/components/ikas/confirm-button"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Meter } from "@/components/ikas/meter"
import { Page, PageHeader } from "@/components/ikas/page"
import { SettingRow } from "@/components/ikas/setting-row"
import { ToggleSection } from "@/components/ikas/toggle-section"

type EventKey = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase"
type Range = "7" | "14"

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
const number = (value: number) => new Intl.NumberFormat("tr-TR").format(value)
const shortDay = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format

const events: { key: EventKey; title: string; description: string; icon: React.ReactNode; lastSeen: string | null }[] = [
  { key: "PageView", title: "PageView", description: "Her sayfa görüntülemesinde gönderilir.", icon: <FileTextIcon />, lastSeen: "1 dk önce" },
  { key: "ViewContent", title: "ViewContent", description: "Ürün sayfası açıldığında, ürün bilgisiyle.", icon: <EyeIcon />, lastSeen: "3 dk önce" },
  { key: "AddToCart", title: "AddToCart", description: "Ürün sepete eklendiğinde.", icon: <ShoppingCartIcon />, lastSeen: "12 dk önce" },
  { key: "InitiateCheckout", title: "InitiateCheckout", description: "Ödeme adımı başladığında.", icon: <WalletIcon />, lastSeen: null },
  { key: "Purchase", title: "Purchase", description: "Sipariş tamamlandığında, sipariş tutarıyla.", icon: <CreditCardIcon />, lastSeen: "41 dk önce" },
]

/** Deterministic daily counts per event so the server and client render the same chart. */
function eventVolume(days: number) {
  const end = new Date(2026, 9, 6)
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - i))
    const base = 1 + Math.sin(i * 0.8) * 0.18 + i * 0.02
    const today = i === days - 1 ? 0.45 : 1
    return {
      day: shortDay(date),
      viewContent: Math.round(2140 * base * today),
      addToCart: Math.round(620 * base * today),
      purchase: Math.round(118 * base * today),
    }
  })
}

const volume: Record<Range, ReturnType<typeof eventVolume>> = { "7": eventVolume(7), "14": eventVolume(14) }

const feedSamples: { event: EventKey; product: string; value: number | null }[] = [
  { event: "ViewContent", product: "Keten gömlek · Ekru / M", value: 649.9 },
  { event: "AddToCart", product: "Basic oversize tişört · Siyah / L", value: 389 },
  { event: "PageView", product: "Koleksiyon: Yeni sezon", value: null },
  { event: "Purchase", product: "Sipariş #1049 · 3 ürün", value: 1249.9 },
  { event: "InitiateCheckout", product: "Sepet · 2 ürün", value: 1038.9 },
  { event: "ViewContent", product: "Wide leg pantolon · Siyah / 38", value: 450 },
  { event: "AddToCart", product: "Kanvas çanta · Naturel", value: 150 },
]

const eventTone: Record<EventKey, BadgeTone> = {
  PageView: "neutral",
  ViewContent: "neutral",
  AddToCart: "info",
  InitiateCheckout: "warning",
  Purchase: "success",
}

type FeedRow = { id: number; event: EventKey; product: string; value: number | null }

/** Removed rows collapse their height so the list closes the gap instead of jumping. */
const ENTER = { opacity: { duration: 0.15 }, height: { duration: 0.2, ease: EASE_OUT } }
const EXIT = { opacity: { duration: 0.1 }, height: { duration: 0.18, ease: EASE_OUT } }

function LiveFeed() {
  const reduceMotion = useReducedMotion()
  const [running, setRunning] = React.useState(true)
  const [rows, setRows] = React.useState<FeedRow[]>(() => feedSamples.slice(0, 4).map((s, i) => ({ ...s, id: i })))
  const next = React.useRef(4)

  React.useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      if (document.hidden) return
      const sample = feedSamples[next.current % feedSamples.length]
      const row = { ...sample, id: next.current++ }
      setRows((list) => [row, ...list].slice(0, 6))
    }, 2000)
    return () => clearInterval(timer)
  }, [running])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Canlı olay akışı
          {running && (
            <Badge tone="success" dot size="sm">
              Canlı
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Mağazanızdan gelen son olaylar</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost" onClick={() => setRunning((r) => !r)} aria-pressed={!running}>
            {running ? <PauseIcon data-icon="inline-start" /> : <PlayIcon data-icon="inline-start" />}
            {running ? "Duraklat" : "Devam et"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col" aria-live="polite" aria-label="Son olaylar">
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.li
                key={row.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto", transition: reduceMotion ? { duration: 0.1 } : ENTER }}
                exit={reduceMotion ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, height: 0, transition: EXIT }}
                className="overflow-hidden"
              >
                {/* Padding sits on the inner div so the li can really collapse to 0. */}
                <div className="flex items-center gap-3 border-b py-2.5 text-sm">
                  <Badge tone={eventTone[row.event]} size="sm" className="shrink-0">
                    {row.event}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate">{row.product}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{row.value == null ? "—" : money(row.value)}</span>
                  <span className="w-14 shrink-0 text-right text-[12px] text-muted-foreground">az önce</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  )
}

export default function PixelAppExample() {
  const [pixelId, setPixelId] = React.useState("100000000000001")
  const token = "pk_test_7c41e9d2b8a05f"
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified] = React.useState(true)
  const [testing, setTesting] = React.useState(false)
  const [enabled, setEnabled] = React.useState<Record<EventKey, boolean>>({
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    InitiateCheckout: false,
    Purchase: true,
  })
  const [capi, setCapi] = React.useState(true)
  const [consent, setConsent] = React.useState(true)
  const [range, setRange] = React.useState<Range>("7")
  const rows = volume[range]
  const total = rows.reduce((sum, r) => sum + r.viewContent + r.addToCart + r.purchase, 0)

  function verify() {
    setVerifying(true)
    setVerified(false)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      toast.success("Piksel doğrulandı")
    }, 1200)
  }

  function sendTest() {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      toast.success("Test olayı gönderildi", { description: "Reklam platformunuzun test olayları ekranında görünür." })
    }, 1400)
  }

  return (
    <Page width="wide">
      <PageHeader
        title="Pazarlama pikseli"
        titleMeta={
          <Badge tone="success" dot>
            Bağlı
          </Badge>
        }
        description="Mağaza olaylarını reklam platformunuza gönderir; reklam ölçümü ve hedefleme için."
        actions={
          <>
            <ConfirmButton variant="ghost" confirmLabel="Bağlantı kesilsin mi?" onConfirm={() => toast.success("Piksel bağlantısı kesildi")}>
              Bağlantıyı kes
            </ConfirmButton>
            <Button variant="outline" loading={testing} onClick={sendTest}>
              <SendIcon data-icon="inline-start" data-anim="lift" />
              Test olayı gönder
            </Button>
          </>
        }
      />

      <Layout columns="main-aside">
        <LayoutColumn>
          <Card>
            <CardHeader>
              <CardTitle>Bağlantı</CardTitle>
              <CardDescription>Reklam platformunuzun piksel ayarlarındaki bilgiler.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="pixel-id">Piksel ID</FieldLabel>
                    <Input id="pixel-id" inputMode="numeric" value={pixelId} onChange={(e) => setPixelId(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="pixel-token">Erişim jetonu</FieldLabel>
                    <div className="flex items-center gap-1.5">
                      <Input id="pixel-token" type="password" defaultValue={token} className="flex-1" />
                      <CopyIconButton value={token} label="Erişim jetonunu kopyala" />
                    </div>
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" loading={verifying} onClick={verify}>
                    Doğrula
                  </Button>
                  {verified && (
                    <span className="flex items-center gap-1.5 text-[13px] text-success-subtle-foreground animate-in duration-200 fade-in-0 motion-reduce:animate-none">
                      <CheckIcon className="size-3.5" />
                      Piksel aktif, son olay 1 dk önce
                    </span>
                  )}
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] font-semibold">Olaylar</h2>
            <p className="text-sm text-muted-foreground">Gönderilecek olayları seçin. Kapalı olaylar mağazadan reklam platformuna iletilmez.</p>
          </div>

          {events.map((event) => (
            <ToggleSection
              key={event.key}
              icon={event.icon}
              title={event.title}
              description={event.description}
              meta={
                event.lastSeen ? (
                  <Badge size="sm" variant="surface" tone="success">
                    {event.lastSeen}
                  </Badge>
                ) : (
                  <Badge size="sm">Veri yok</Badge>
                )
              }
              checked={enabled[event.key]}
              onCheckedChange={(checked) => setEnabled((e) => ({ ...e, [event.key]: checked }))}
            >
              {event.key === "Purchase" ? (
                <div className="flex flex-col divide-y">
                  <SettingRow
                    title="Kargo ücretini değere dahil et"
                    description="Kapalıyken olay değeri yalnızca ürün toplamıdır."
                    htmlFor="purchase-shipping"
                    control={<Switch id="purchase-shipping" defaultChecked />}
                  />
                  <SettingRow
                    title="Para birimi"
                    description="Sipariş tutarı bu para biriminde gönderilir."
                    control={
                      <Select defaultValue="TRY">
                        <SelectTrigger size="sm" className="w-28" aria-label="Para birimi">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" align="end">
                          <SelectItem value="TRY">TRY (₺)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  />
                </div>
              ) : event.key === "AddToCart" ? (
                <SettingRow title="Değer gönder" description="Sepete eklenen ürünün fiyatını olay değeri olarak ekler." htmlFor="atc-value" control={<Switch id="atc-value" defaultChecked />} />
              ) : event.key === "ViewContent" ? (
                <SettingRow
                  title="Varyant bilgisi"
                  description="content_ids alanına varyant SKU'su yerine ürün ID'si gönderilir."
                  htmlFor="vc-variant"
                  control={<Switch id="vc-variant" />}
                />
              ) : event.key === "InitiateCheckout" ? (
                <SettingRow title="Sepetteki ürün sayısı" description="num_items alanını doldurur." htmlFor="ic-items" control={<Switch id="ic-items" defaultChecked />} />
              ) : (
                <SettingRow
                  title="Tek sayfalık uygulamalar"
                  description="Tema sayfa yenilemeden geçiş yapıyorsa her rota değişiminde gönderilir."
                  htmlFor="pv-spa"
                  control={<Switch id="pv-spa" defaultChecked />}
                />
              )}
            </ToggleSection>
          ))}

          <ToggleSection
            icon={<ServerIcon />}
            title="Sunucu tarafı gönderim"
            description="Olayları tarayıcının yanında sunucudan da gönderir; reklam engelleyicilerden etkilenmez."
            checked={capi}
            onCheckedChange={setCapi}
          >
            <div className="flex flex-col gap-4">
              <p className="text-[13px] text-muted-foreground">
                Tarayıcı ve sunucudan gelen aynı olay, <code className="font-mono text-[12px] text-foreground">event_id</code> ile eşleştirilip tek
                sayılır. Ek bir ayar gerekmez.
              </p>
              <Meter label="Olay eşleşme kalitesi" value={7.4} max={10} tone="success" valueFormat={(v) => v.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} />
            </div>
          </ToggleSection>

          <ToggleSection
            icon={<CookieIcon />}
            title="KVKK / çerez onayı"
            description="Ziyaretçi pazarlama çerezlerine izin vermeden olay gönderilmez."
            checked={consent}
            onCheckedChange={setConsent}
          >
            <Field>
              <FieldLabel htmlFor="consent-mode">Onay modu</FieldLabel>
              <Select defaultValue="wait">
                <SelectTrigger id="consent-mode" className="w-full sm:w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="wait">Onay gelene kadar bekle</SelectItem>
                  <SelectItem value="limited">Onaysız, sınırlı veriyle gönder</SelectItem>
                  <SelectItem value="theme">Temanın çerez bannerını kullan</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Bekleyen olaylar onay verildiğinde gönderilir.</FieldDescription>
            </Field>
          </ToggleSection>
        </LayoutColumn>

        <LayoutColumn className="lg:sticky lg:top-6">
          <ChartCard
            title="Gönderilen olaylar"
            description="Bugün devam ediyor"
            value={total}
            valueFormat={number}
            change={6.8}
            changeLabel="önceki döneme göre"
            ranges={[
              { value: "7", label: "7G" },
              { value: "14", label: "14G" },
            ]}
            range={range}
            onRangeChange={setRange}
          >
            <BarChart
              data={rows}
              index="day"
              stacked
              incompleteLast
              height={220}
              valueFormat={number}
              series={[
                { key: "viewContent", label: "ViewContent" },
                { key: "addToCart", label: "AddToCart" },
                { key: "purchase", label: "Purchase" },
              ]}
              aria-label="Olay tipine göre günlük gönderilen olaylar"
            />
          </ChartCard>
          <LiveFeed />
        </LayoutColumn>
      </Layout>
    </Page>
  )
}
