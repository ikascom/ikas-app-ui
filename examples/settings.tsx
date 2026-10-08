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
import { AnnotatedSection } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { SaveBar } from "@/components/ikas/save-bar"
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
    <Page width="narrow" className="pb-28">
      <PageHeader title="Ayarlar" description="Bu mağazanın bağlantı ve eşitleme tercihleri." />
      <Banner tone="success" title="Pazaryerine bağlı" onDismiss={() => {}}>
        Son başarılı eşitleme 2 dakika önce.
      </Banner>

      <AnnotatedSection title="Bağlantı" description="Ürünlerinizin yayınlandığı satıcı hesabı.">
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
      </AnnotatedSection>

      <AnnotatedSection title="Eşitleme" description="Pazaryerine ne gönderilir ve ne sıklıkla.">
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
      </AnnotatedSection>

      <AnnotatedSection title="Tam eşitleme" description="Tüm ürünleri, stokları ve fiyatları baştan gönderir. Genelde gerekmez.">
        <Card>
          <CardContent className="flex items-center gap-5">
            <RadialMeter value={progress ?? 0} size={72} strokeWidth={7} tone={progress === 100 ? "success" : "neutral"} label="Eşitleme ilerlemesi" />
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
      </AnnotatedSection>

      <AnnotatedSection title="Tehlikeli alan" description="Bağlantıyı kaldırır. Ürünler pazaryerinde kalır.">
        <Card>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Bu mağazanın pazaryeri bağlantısını kes.</p>
            <ConfirmButton confirmLabel="Bağlantı kesilsin mi?" onConfirm={() => toast.success("Pazaryeri bağlantısı kesildi")}>
              Bağlantıyı kes
            </ConfirmButton>
          </CardContent>
        </Card>
      </AnnotatedSection>

      <SaveBar
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
