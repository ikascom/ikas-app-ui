"use client"

import * as React from "react"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { ClockIcon, MessageCircleIcon, MessageSquareTextIcon, SendIcon, ShoppingBagIcon, SmartphoneIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { EASE_OUT, springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AreaChart } from "@/components/ikas/area-chart"
import { ChartCard } from "@/components/ikas/chart-card"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { NumberStepper } from "@/components/ikas/number-stepper"
import { Page, PageHeader } from "@/components/ikas/page"
import { UnsavedBar } from "@/components/ikas/unsaved-bar"
import { ScriptInstaller, type Storefront } from "@/components/ikas/script-installer"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { Launchpad } from "@/components/ikas/launchpad"
import { ToggleSection } from "@/components/ikas/toggle-section"
import { store, storefronts as storeStorefronts, widgetScriptUrl } from "@/demos/_data"

type Settings = {
  phone: string
  color: string
  side: "left" | "right"
  hoursOn: boolean
  days: string[]
  from: string
  to: string
  greetingOn: boolean
  greeting: string
  productOn: boolean
  productPosition: "below-cart" | "floating"
  delay: number
  hideMobile: boolean
}

const initial: Settings = {
  phone: store.phone,
  color: "#16a34a",
  side: "right",
  hoursOn: true,
  days: ["Pzt", "Sal", "Çar", "Per", "Cum"],
  from: "09:00",
  to: "18:00",
  greetingOn: true,
  greeting: "Merhaba! Siparişinizle ilgili nasıl yardımcı olabiliriz?",
  productOn: false,
  productPosition: "below-cart",
  delay: 5,
  hideMobile: false,
}

const allDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

/** Brand-neutral swatches a store owner can pick for the floating button. */
const swatches = [
  { value: "#16a34a", label: "Yeşil" },
  { value: "#171717", label: "Siyah" },
  { value: "#2563eb", label: "Mavi" },
  { value: "#db2777", label: "Pembe" },
]

const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format
const number = (value: number) => new Intl.NumberFormat("tr-TR").format(value)

/** Deterministic 14-day click series ending today. */
const clicks = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(2026, 9, 6)
  date.setDate(date.getDate() - (13 - i))
  return { date: shortDate(date), clicks: Math.round(120 + i * 9 + Math.sin(i * 0.9) * 28 + (date.getDay() % 6 === 0 ? 40 : 0)) }
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function WidgetAppExample() {
  const reduce = useReducedMotion()
  const [saved, setSaved] = React.useState(initial)
  const [values, setValues] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(saved)
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setValues((v) => ({ ...v, [key]: value }))

  const [done, setDone] = React.useState<Record<string, boolean>>({ phone: true })
  const [guideOpen, setGuideOpen] = React.useState(true)
  const markDone = (id: string) => setDone((d) => ({ ...d, [id]: true }))

  const [storefronts, setStorefronts] = React.useState<Storefront[]>(() => {
    const status: Storefront["status"][] = ["installed", "outdated", "not-installed"]
    return storeStorefronts.map((s, i) => ({ ...s, status: status[i] }))
  })

  const [chatOpen, setChatOpen] = React.useState(false)
  const totalClicks = clicks.reduce((sum, d) => sum + d.clicks, 0)

  async function install(id: string) {
    await wait(1200)
    setStorefronts((list) => list.map((s) => (s.id === id ? { ...s, status: "installed" } : s)))
    markDone("script")
    toast.success(`Script ${storefronts.find((s) => s.id === id)?.name} mağazasına kuruldu`)
  }

  async function remove(id: string) {
    await wait(700)
    setStorefronts((list) => list.map((s) => (s.id === id ? { ...s, status: "not-installed" } : s)))
    toast(`Script ${storefronts.find((s) => s.id === id)?.name} mağazasından kaldırıldı`)
  }

  function toggleDay(day: string) {
    set("days", values.days.includes(day) ? values.days.filter((d) => d !== day) : [...values.days, day])
  }

  return (
    <Page width="wide" className="pb-28">
      <PageHeader
        title="Destek butonu"
        description="Ziyaretçiler tek tıkla destek ekibinize yazsın."
        badges={
          <Badge status="success" dot>
            Etkin
          </Badge>
        }
        actions={
          <Button variant="outline" onClick={() => toast("Mağaza yeni sekmede açılıyor")}>
            Mağazada görüntüle
            <SendIcon data-icon="inline-end" data-anim="lift" />
          </Button>
        }
      />

      {guideOpen && (
        <Launchpad
          title="Yayına alma"
          onDismiss={() => setGuideOpen(false)}
          steps={[
            {
              id: "phone",
              label: "Telefon numarasını girin",
              description: "Mesajların yönlendirileceği destek hattı numarası.",
              status: done.phone ? "done" : undefined,
              eta: "~1 dk",
              actions: <Button size="sm" onClick={() => markDone("phone")}>Numarayı kaydet</Button>,
            },
            {
              id: "look",
              label: "Görünümü seçin",
              description: "Renk ve konum aşağıdaki önizlemede anında görünür.",
              status: done.look ? "done" : undefined,
              eta: "~1 dk",
              actions: <Button size="sm" onClick={() => markDone("look")}>Görünümü onayla</Button>,
            },
            {
              id: "script",
              label: "Script'i mağazaya kurun",
              description: "Buton, storefront'a eklenen küçük bir script ile çalışır. Aşağıdaki listeden kurabilirsiniz.",
              status: done.script ? "done" : undefined,
              eta: "~2 dk",
              actions: (
                <Button size="sm" onClick={() => install("intl")}>
                  Tüm mağazalara kur
                </Button>
              ),
            },
            {
              id: "test",
              label: "Test mesajı gönderin",
              description: "Numaranıza bir test mesajı gönderip bağlantıyı doğrulayın.",
              status: done.test ? "done" : undefined,
              requires: ["phone", "script"],
              actions: (
                <Button
                  size="sm"
                  onClick={() => {
                    markDone("test")
                    toast.success("Test mesajı gönderildi")
                  }}
                >
                  <SendIcon data-icon="inline-start" data-anim="lift" />
                  Test mesajı gönder
                </Button>
              ),
            },
          ]}
        />
      )}

      <Layout columns="main-aside">
        <LayoutColumn className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Bağlantı ve görünüm</CardTitle>
              <CardDescription>Butonun mağazadaki görünümü.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field>
                <FieldLabel htmlFor="phone">Destek numarası</FieldLabel>
                <Input id="phone" inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
                <FieldDescription>Ülke koduyla birlikte yazın.</FieldDescription>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Konum</span>
                  <SegmentedControl
                    mode="radio"
                    aria-label="Konum"
                    value={values.side}
                    onValueChange={(side) => set("side", side)}
                    options={[
                      { value: "left", label: "Sol alt" },
                      { value: "right", label: "Sağ alt" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span id="color-label" className="text-sm font-medium">
                    Renk
                  </span>
                  <div role="radiogroup" aria-labelledby="color-label" className="flex items-center gap-2">
                    {swatches.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={values.color === s.value}
                        aria-label={s.label}
                        onClick={() => set("color", s.value)}
                        className={cn(
                          "size-8 rounded-full shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25)] transition-[box-shadow,scale] duration-150 outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/30",
                          values.color === s.value && "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                        )}
                        style={{ background: s.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold">Modüller</h2>
            <ToggleSection
              icon={<ClockIcon />}
              title="Mesai saatleri"
              description="Mesai dışında buton 'Çevrim dışı' görünür ve mesajlar sıraya alınır."
              checked={values.hoursOn}
              onCheckedChange={(v) => set("hoursOn", v)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Günler">
                  {allDays.map((day) => {
                    const on = values.days.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "h-8 min-w-11 rounded-full px-3 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                          on ? "bg-foreground text-background" : "bg-card text-muted-foreground shadow-raised hover:text-foreground"
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                <div className="grid max-w-sm grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="from">Başlangıç</FieldLabel>
                    <Input id="from" type="time" value={values.from} onChange={(e) => set("from", e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="to">Bitiş</FieldLabel>
                    <Input id="to" type="time" value={values.to} onChange={(e) => set("to", e.target.value)} />
                  </Field>
                </div>
              </div>
            </ToggleSection>

            <ToggleSection
              icon={<MessageSquareTextIcon />}
              title="Karşılama mesajı"
              description="Sohbet penceresi açıldığında ziyaretçiye gösterilir."
              checked={values.greetingOn}
              onCheckedChange={(v) => set("greetingOn", v)}
            >
              <Field>
                <FieldLabel htmlFor="greeting" className="sr-only">
                  Karşılama mesajı
                </FieldLabel>
                <Textarea id="greeting" rows={2} maxLength={160} value={values.greeting} onChange={(e) => set("greeting", e.target.value)} />
                <FieldDescription>{values.greeting.length} / 160 karakter</FieldDescription>
              </Field>
            </ToggleSection>

            <ToggleSection
              icon={<ShoppingBagIcon />}
              title="Ürün sayfasında göster"
              description="Ürün sayfasında 'Bu ürün hakkında sor' butonu çıkar; mesaj ürün linkiyle gelir."
              meta={<Badge size="sm" color="blue">Önerilen</Badge>}
              checked={values.productOn}
              onCheckedChange={(v) => set("productOn", v)}
            >
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Yerleşim</span>
                  <SegmentedControl
                    size="sm"
                    mode="radio"
                    aria-label="Yerleşim"
                    value={values.productPosition}
                    onValueChange={(v) => set("productPosition", v)}
                    options={[
                      { value: "below-cart", label: "Sepet butonunun altında" },
                      { value: "floating", label: "Yüzen buton" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Gecikme (saniye)</span>
                  <NumberStepper label="Gecikme (saniye)" value={values.delay} onValueChange={(v) => set("delay", v)} min={0} max={60} />
                </div>
              </div>
            </ToggleSection>

            <ToggleSection
              icon={<SmartphoneIcon />}
              title="Mobilde gizle"
              description="Küçük ekranlarda buton gösterilmez."
              checked={values.hideMobile}
              onCheckedChange={(v) => set("hideMobile", v)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Storefront script&apos;i</CardTitle>
              <CardDescription>Buton her mağazaya ayrı kurulur. Güncel olmayan kurulumlar eski görünümü gösterir.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScriptInstaller scriptUrl={widgetScriptUrl} storefronts={storefronts} onInstall={install} onRemove={remove} />
            </CardContent>
          </Card>
        </LayoutColumn>

        <LayoutColumn className="flex flex-col gap-5 lg:sticky lg:top-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Önizleme</span>
            <div className="rounded-xl bg-muted p-3 shadow-[inset_0_1px_2px_0_var(--shade-1)]">
              <div className="relative h-[380px] overflow-hidden rounded-lg bg-card shadow-card" aria-label="Mağaza önizlemesi" role="img">
                <div className="flex h-9 items-center gap-3 border-b px-3">
                  <span className="h-2.5 w-12 rounded-full bg-foreground/15" />
                  <span className="ml-auto h-2 w-6 rounded-full bg-foreground/10" />
                  <span className="h-2 w-6 rounded-full bg-foreground/10" />
                </div>
                <div className="flex flex-col gap-3 p-3">
                  <div className="h-28 rounded-md bg-foreground/[0.06]" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 rounded-md bg-foreground/[0.06]" />
                    <div className="h-20 rounded-md bg-foreground/[0.06]" />
                  </div>
                  <span className="h-2 w-2/3 rounded-full bg-foreground/10" />
                </div>

                <motion.div
                  layout
                  transition={springOrInstant(reduce)}
                  className={cn("absolute bottom-4 flex flex-col gap-2", values.side === "right" ? "right-4 items-end" : "left-4 items-start")}
                >
                  <AnimatePresence>
                    {chatOpen && (
                      <motion.div
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.12, ease: EASE_OUT } }}
                        transition={springOrInstant(reduce)}
                        style={{ originX: values.side === "right" ? 1 : 0, originY: 1 }}
                        className="w-52 overflow-hidden rounded-xl bg-card shadow-overlay"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-white" style={{ background: values.color }}>
                          <MessageCircleIcon className="size-3.5" />
                          Destek ekibi
                          <span className="ml-auto text-[11px] font-normal opacity-80">{values.hoursOn ? `${values.from}–${values.to}` : "Çevrim içi"}</span>
                        </div>
                        <p className="m-3 rounded-lg rounded-tl-sm bg-muted px-2.5 py-2 text-[12px]">{values.greetingOn ? values.greeting : "Merhaba! Size nasıl yardımcı olabiliriz?"}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => setChatOpen((v) => !v)}
                    aria-label={chatOpen ? "Sohbeti kapat" : "Sohbeti aç"}
                    className="flex size-11 items-center justify-center rounded-full text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25),0_4px_14px_-4px_var(--c)] transition-[scale] duration-150 outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/30"
                    style={{ background: values.color, ["--c" as string]: values.color }}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={chatOpen ? "x" : "chat"}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.6 }}
                        transition={springOrInstant(reduce)}
                        className="flex"
                      >
                        {chatOpen ? <XIcon className="size-5" /> : <MessageCircleIcon className="size-5" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </motion.div>
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground">Butona tıklayarak sohbet penceresini deneyin.</p>
          </div>

          <ChartCard title="Tıklamalar" description="Son 14 gün" value={totalClicks} valueFormat={number} change={14.6} changeLabel="önceki 14 güne göre">
            <AreaChart data={clicks} index="date" series={[{ key: "clicks", label: "Tıklama" }]} valueFormat={number} height={180} aria-label="Son 14 günde günlük buton tıklaması" />
          </ChartCard>
        </LayoutColumn>
      </Layout>

      <UnsavedBar
        open={dirty}
        saving={saving}
        onDiscard={() => setValues(saved)}
        onSave={() => {
          setSaving(true)
          setTimeout(() => {
            setSaved(values)
            setSaving(false)
            toast.success("Ayarlar kaydedildi")
          }, 900)
        }}
      />
    </Page>
  )
}
