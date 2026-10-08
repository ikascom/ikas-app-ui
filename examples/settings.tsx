"use client"

import * as React from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Banner } from "@/components/ikas/banner"
import { ConfirmButton } from "@/components/ikas/confirm-button"
import { RadialMeter } from "@/components/ikas/meter"
import { SettingsGroup } from "@/components/ikas/layout"
import { cn } from "@/lib/utils"
import { Page, PageHeader } from "@/components/ikas/page"
import { UnsavedBar } from "@/components/ikas/unsaved-bar"
import { SettingRow } from "@/components/ikas/setting-row"
import { marketplace } from "@/demos/_data"

type Settings = {
  sellerId: string
  apiKey: string
  interval: string
  autoPublish: boolean
  syncStock: boolean
  syncPrice: boolean
}

const sections = [
  { id: "connection", label: "Bağlantı" },
  { id: "sync", label: "Eşitleme" },
  { id: "full-sync", label: "Tam eşitleme" },
  { id: "disconnect", label: "Bağlantıyı kes" },
] as const

type SectionId = (typeof sections)[number]["id"]
const indexOf = (id: SectionId) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, "0")

/** In-page nav: a sticky column on wide screens, a scrollable row on small ones. Tracks the section in view. */
function SectionNav() {
  const [current, setCurrent] = React.useState<SectionId>(sections[0].id)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id as SectionId)
      },
      { rootMargin: "0px 0px -60% 0px" }
    )
    for (const { id } of sections) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="Ayar bölümleri" className="sticky top-0 z-10 -mx-4 bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:top-6 lg:mx-0 lg:self-start lg:p-0">
      <ol className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
        {sections.map(({ id, label }) => {
          const active = current === id
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                onClick={() => setCurrent(id)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30",
                  "lg:before:absolute lg:before:inset-y-1.5 lg:before:left-0 lg:before:w-0.5 lg:before:rounded-full lg:before:transition-colors lg:before:duration-150",
                  active ? "font-medium text-foreground lg:before:bg-foreground max-lg:bg-muted" : "text-muted-foreground lg:before:bg-transparent"
                )}
              >
                <span className="font-mono text-[11px] tabular-nums">{indexOf(id)}</span>
                {label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const initial: Settings = {
  sellerId: marketplace.sellerId,
  apiKey: marketplace.apiKey,
  interval: "15",
  autoPublish: false,
  syncStock: true,
  syncPrice: true,
}

export default function SettingsExample() {
  const [saved, setSaved] = React.useState(initial)
  const [values, setValues] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(saved)
  const [progress, setProgress] = React.useState<number | null>(null)
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setValues((v) => ({ ...v, [key]: value }))

  // Fake full sync so the radial meter has something to show.
  React.useEffect(() => {
    if (progress === null || progress >= 100) return
    const timer = setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 7 + Math.round(Math.random() * 9))), 280)
    return () => clearTimeout(timer)
  }, [progress])

  React.useEffect(() => {
    if (progress === 100) toast.success("1.284 ürün eşitlendi")
  }, [progress])

  return (
    <Page className="pb-28">
      <PageHeader title="Ayarlar" description="Bu mağazanın bağlantı ve eşitleme tercihleri." />
      <Banner status="success" title="Pazaryerine bağlı" onDismiss={() => {}}>
        Son başarılı eşitleme 2 dakika önce.
      </Banner>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-10">
        <SectionNav />
        <div className="flex min-w-0 flex-col gap-10 [&>section]:scroll-mt-16 lg:[&>section]:scroll-mt-6">
          <SettingsGroup id="connection" index={indexOf("connection")} label="Bağlantı" hint="Ürünlerinizin yayınlandığı satıcı hesabı.">
            <Card>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="seller-id">Satıcı ID</FieldLabel>
                    <Input id="seller-id" value={values.sellerId} onChange={(e) => set("sellerId", e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="api-key">API anahtarı</FieldLabel>
                    <Input id="api-key" type="password" value={values.apiKey} onChange={(e) => set("apiKey", e.target.value)} />
                    <FieldDescription>Satıcı panelinde Hesap → Entegrasyonlar altında bulabilirsiniz.</FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </SettingsGroup>

          <SettingsGroup id="sync" index={indexOf("sync")} label="Eşitleme" hint="Pazaryerine ne gönderilir ve ne sıklıkla.">
            <Card>
              <CardContent className="divide-y">
                <SettingRow
                  htmlFor="interval"
                  title="Eşitleme sıklığı"
                  control={
                    <Select value={values.interval} onValueChange={(v) => set("interval", v)}>
                      <SelectTrigger id="interval" size="sm" className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="end">
                        <SelectItem value="5">5 dakikada bir</SelectItem>
                        <SelectItem value="15">15 dakikada bir</SelectItem>
                        <SelectItem value="60">Saatte bir</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <SettingRow
                  htmlFor="sync-stock"
                  title="Stok"
                  description="Stok değişikliklerini anında gönder."
                  control={<Switch id="sync-stock" checked={values.syncStock} onCheckedChange={(v) => set("syncStock", v)} />}
                />
                <SettingRow
                  htmlFor="sync-price"
                  title="Fiyatlar"
                  description="Kampanyalar dahil ikas satış fiyatını kullan."
                  control={<Switch id="sync-price" checked={values.syncPrice} onCheckedChange={(v) => set("syncPrice", v)} />}
                />
                <SettingRow
                  htmlFor="auto-publish"
                  title="Yeni ürünleri otomatik yayınla"
                  description="Kapalıysa yeni ürünler uygulamada onay bekler."
                  control={<Switch id="auto-publish" checked={values.autoPublish} onCheckedChange={(v) => set("autoPublish", v)} />}
                />
              </CardContent>
            </Card>
          </SettingsGroup>

          <SettingsGroup id="full-sync" index={indexOf("full-sync")} label="Tam eşitleme" hint="Tüm ürünleri, stokları ve fiyatları baştan gönderir. Genelde gerekmez.">
            <Card>
              <CardContent className="flex items-center gap-5">
                <RadialMeter value={progress ?? 0} size={72} strokeWidth={7} status={progress === 100 ? "success" : "neutral"} label="Eşitleme ilerlemesi" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium">{progress === null ? "Son tam eşitleme 3 gün önce" : progress < 100 ? "Ürünler gönderiliyor…" : "Tamamlandı"}</p>
                  <p className="text-[13px] text-muted-foreground">{progress === null ? "1.284 ürün · yaklaşık 2 dakika sürer" : `${Math.round((1284 * (progress ?? 0)) / 100).toLocaleString("tr-TR")} / 1.284 ürün`}</p>
                </div>
                <Button variant="outline" disabled={progress !== null && progress < 100} onClick={() => setProgress(0)}>
                  <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
                  Eşitle
                </Button>
              </CardContent>
            </Card>
          </SettingsGroup>

          <SettingsGroup id="disconnect" index={indexOf("disconnect")} label="Bağlantıyı kes" hint="Eşitleme durur. Ürünler pazaryerinde kalır.">
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Bu mağazanın pazaryeri bağlantısını kes.</p>
                <ConfirmButton confirmLabel="Bağlantı kesilsin mi?" onConfirm={() => toast.success("Pazaryeri bağlantısı kesildi")}>
                  Bağlantıyı kes
                </ConfirmButton>
              </CardContent>
            </Card>
          </SettingsGroup>
        </div>
      </div>

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
