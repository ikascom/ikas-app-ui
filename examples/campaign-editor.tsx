"use client"

import * as React from "react"
import { ClockIcon, GiftIcon, MonitorIcon, PauseIcon, RocketIcon, SmartphoneIcon, Trash2Icon, XIcon, ZapIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { toast } from "sonner"

import { springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, type ButtonVariant } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { Banner } from "@/components/ikas/banner"
import { Collapse } from "@/components/ikas/collapse"
import { ConfirmButton } from "@/components/ikas/confirm-button"
import { NumberStepper } from "@/components/ikas/number-stepper"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { Page, PageHeader } from "@/components/ikas/page"
import { SettingRow } from "@/components/ikas/setting-row"

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })

const variants = [
  { id: "v1", label: "Siyah / S", price: 1299, inStock: true },
  { id: "v2", label: "Siyah / M", price: 1299, inStock: true },
  { id: "v3", label: "Siyah / L", price: 1299, inStock: false },
  { id: "v4", label: "Ekru / M", price: 1299, inStock: true },
]

const ctaStyles: { value: ButtonVariant; label: string }[] = [
  { value: "solid", label: "Dolu" },
  { value: "soft", label: "Yumuşak" },
  { value: "outline", label: "Çerçeveli" },
]

const icons = [
  { value: "clock", label: "Saat", Icon: ClockIcon },
  { value: "gift", label: "Hediye", Icon: GiftIcon },
  { value: "bolt", label: "Şimşek", Icon: ZapIcon },
] as const

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function CampaignEditorExample() {
  const [headline, setHeadline] = React.useState("Fırsat ürün")
  const [subtitle, setSubtitle] = React.useState("Sınırlı süre için özel fiyat.")
  const [cta, setCta] = React.useState("Sepete ekle")
  const [offerPrice, setOfferPrice] = React.useState("1039")
  const [selected, setSelected] = React.useState<string[]>(["v1", "v2"])
  const [countdown, setCountdown] = React.useState("perSession")
  const [side, setSide] = React.useState<"left" | "right">("right")
  const [quantity, setQuantity] = React.useState(1)
  const [autoOpen, setAutoOpen] = React.useState(false)
  const [delay, setDelay] = React.useState(3)
  const [ctaStyle, setCtaStyle] = React.useState<ButtonVariant>("solid")
  const [icon, setIcon] = React.useState<(typeof icons)[number]["value"]>("gift")
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop")
  const [showErrors, setShowErrors] = React.useState(false)
  const reduceMotion = useReducedMotion()

  const price = Number(offerPrice) || 0
  const discount = Math.round((1 - price / 1299) * 100)
  const priceInvalid = price >= 1299
  const PreviewIcon = icons.find((i) => i.value === icon)?.Icon ?? GiftIcon

  function publish() {
    if (priceInvalid || selected.length === 0 || !headline.trim()) {
      setShowErrors(true)
      toast.error("Formda eksik alanlar var")
      return
    }
    setShowErrors(false)
    toast.success("Değişiklikler yayınlandı")
  }

  return (
    <Page width="wide">
      <PageHeader
        backAction={{ label: "Kampanyalara dön", onClick: () => toast("Kampanyalara dönülüyor") }}
        title="Hafta sonu fırsatı"
        titleMeta={
          <>
            <Badge tone="success" dot>
              Yayında
            </Badge>
            <Badge variant="surface" tone="warning">
              Yayınlanmamış değişiklikler var
            </Badge>
          </>
        }
        description="Kaydedildi 14:32"
        actions={
          <>
            <ConfirmButton variant="ghost" color="red" confirmLabel="Silinsin mi?" onConfirm={() => toast.success("Kampanya silindi")}>
              <Trash2Icon data-icon="inline-start" data-anim="wiggle" />
              Sil
            </ConfirmButton>
            <Button variant="outline" onClick={() => toast("Kampanya duraklatıldı")}>
              <PauseIcon data-icon="inline-start" />
              Duraklat
            </Button>
            <Button color="lime" onClick={publish}>
              <RocketIcon data-icon="inline-start" />
              Değişiklikleri yayınla
            </Button>
          </>
        }
      />

      {showErrors && (
        <Banner tone="critical" title="Yayınlamadan önce şu alanları düzeltin" onDismiss={() => setShowErrors(false)}>
          <ul className="mt-1 list-disc pl-4">
            {selected.length === 0 && (
              <li>
                <strong>Varyantlar</strong> — En az bir varyant seçin
              </li>
            )}
            {priceInvalid && (
              <li>
                <strong>Fırsat fiyatı</strong> — Fırsat fiyatı satış fiyatından düşük olmalı
              </li>
            )}
            {!headline.trim() && (
              <li>
                <strong>Başlık</strong> — Başlık zorunlu
              </li>
            )}
          </ul>
        </Banner>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Section title="Ürün" description="Fırsat fiyatı uygulanacak ürün ve varyantları.">
            <FieldGroup>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Basic oversize tişört</span>
                  <span className="text-[13px] text-muted-foreground">{variants.length} varyant</span>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Ürünü çıkar">
                  <XIcon />
                </Button>
              </div>
              {/* Not a Field: its disabled out-of-stock row would dim every checkbox in the group. */}
              <div role="group" aria-labelledby="variants-label" className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span id="variants-label" className="text-sm font-medium">
                    Varyantlar
                  </span>
                  <span className="text-[13px] text-muted-foreground">{selected.length} seçili</span>
                </div>
                <div className="divide-y rounded-lg border">
                  {variants.map((v) => (
                    <label
                      key={v.id}
                      className={cn("flex items-center gap-3 px-3 py-2.5 text-sm", v.inStock ? "cursor-pointer" : "text-muted-foreground")}
                    >
                      <Checkbox
                        disabled={!v.inStock}
                        checked={selected.includes(v.id)}
                        onCheckedChange={(checked) => setSelected((ids) => (checked ? [...ids, v.id] : ids.filter((id) => id !== v.id)))}
                      />
                      <span className={cn("flex-1", !v.inStock && "line-through")}>{v.label}</span>
                      {v.inStock ? <span className="tabular-nums">{money.format(v.price)}</span> : <Badge size="sm">Stok yok</Badge>}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={priceInvalid || undefined}>
                  <FieldLabel htmlFor="offer-price">Fırsat fiyatı</FieldLabel>
                  <Input id="offer-price" inputMode="decimal" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} aria-invalid={priceInvalid || undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="discount">İndirim oranı</FieldLabel>
                  <Input id="discount" value={priceInvalid ? "—" : `%${discount}`} readOnly className="text-muted-foreground" />
                </Field>
                <Field>
                  <FieldLabel>Adet</FieldLabel>
                  <NumberStepper label="Adet" value={quantity} onValueChange={setQuantity} min={1} max={50} />
                </Field>
              </div>
              <FieldDescription className={cn(priceInvalid && "text-destructive")}>
                {priceInvalid ? "Fırsat fiyatı satış fiyatından düşük olmalı." : `Satış fiyatı ${money.format(1299)} · ${money.format(1299 - price)} indirim`}
              </FieldDescription>
            </FieldGroup>
          </Section>

          <Section title="Geri sayım">
            <RadioGroup value={countdown} onValueChange={setCountdown} className="gap-3">
              <label className="flex items-center gap-2.5 text-sm">
                <RadioGroupItem value="fixed" /> Sabit bitiş tarihi
              </label>
              <label className="flex items-center gap-2.5 text-sm">
                <RadioGroupItem value="perSession" /> Her ziyaretçi için oturum başına süre
              </label>
            </RadioGroup>
            <Field className="mt-4 max-w-48">
              <FieldLabel htmlFor="duration">{countdown === "fixed" ? "Bitiş" : "Süre (dakika)"}</FieldLabel>
              <Input id="duration" type={countdown === "fixed" ? "datetime-local" : "number"} defaultValue={countdown === "fixed" ? undefined : 60} />
            </Field>
          </Section>

          <Section title="İçerik" description="Widget'ta görünen metinler.">
            <FieldGroup>
              <Field data-invalid={showErrors && !headline.trim() ? true : undefined}>
                <FieldLabel htmlFor="headline">Başlık</FieldLabel>
                <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={80} />
              </Field>
              <Field>
                <FieldLabel htmlFor="subtitle">Alt metin</FieldLabel>
                <Textarea id="subtitle" rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="cta">Buton metni</FieldLabel>
                <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} maxLength={30} />
              </Field>
            </FieldGroup>
          </Section>

          <Section title="Görünüm" description="Widget'ın mağazadaki konumu ve stili.">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Konum</FieldLabel>
                  <SegmentedControl
                    mode="radio"
                    aria-label="Konum"
                    value={side}
                    onValueChange={setSide}
                    options={[
                      { value: "left", label: "Sol" },
                      { value: "right", label: "Sağ" },
                    ]}
                  />
                </Field>
                <Field>
                  <FieldLabel>İkon</FieldLabel>
                  <div className="flex gap-1.5">
                    {icons.map(({ value, label, Icon }) => (
                      <Button
                        key={value}
                        size="icon-sm"
                        variant={icon === value ? "solid" : "outline"}
                        aria-label={label}
                        aria-pressed={icon === value}
                        onClick={() => setIcon(value)}
                      >
                        <Icon />
                      </Button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field>
                <FieldLabel>Buton stili</FieldLabel>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Buton stili">
                  {ctaStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      role="radio"
                      aria-checked={ctaStyle === style.value}
                      onClick={() => setCtaStyle(style.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg p-3 text-[12px] font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                        ctaStyle === style.value ? "bg-card shadow-[0_0_0_2px_var(--foreground)]" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className={cn("pointer-events-none")} aria-hidden>
                        <Button asChild variant={style.value} color="lime" size="xs" tabIndex={-1}>
                          <span>Sepete ekle</span>
                        </Button>
                      </span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="divide-y rounded-lg border px-4 py-3.5">
                <SettingRow title="Mağaza fontunu kullan" description="Kapalıyken widget kendi fontuyla görünür." htmlFor="theme-font" control={<Switch id="theme-font" defaultChecked />} />
                <div>
                  <SettingRow
                    title="Otomatik açıl"
                    description="Sayfa açıldıktan bir süre sonra panel kendiliğinden açılır."
                    htmlFor="auto-open"
                    control={<Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} aria-controls="auto-open-delay" />}
                  />
                  <Collapse open={autoOpen} id="auto-open-delay">
                    <div className="flex items-center justify-between gap-4 pt-1 pb-0.5">
                      <span className="text-[13px] text-muted-foreground">Gecikme (saniye)</span>
                      <NumberStepper size="sm" label="Gecikme (saniye)" value={delay} onValueChange={setDelay} min={0} max={60} />
                    </div>
                  </Collapse>
                </div>
              </div>
            </FieldGroup>
          </Section>

          <Section title="Sepet ve ikas kampanyası">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="after-add">Sepete eklendikten sonra</FieldLabel>
                <Select defaultValue="drawer">
                  <SelectTrigger id="after-add" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="drawer">Sepet çekmecesini aç</SelectItem>
                    <SelectItem value="cart">Sepet sayfasına git</SelectItem>
                    <SelectItem value="stay">Sayfada kal</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>Tema uyumluluğu için sırayla denenir.</FieldDescription>
              </Field>
              <div className="divide-y rounded-lg border px-4 py-3.5">
                <SettingRow title="Diğer kampanyalarla birleşebilsin" description="Kapalıyken ikas bu indirimi diğer kampanyalarla aynı anda uygulamaz." htmlFor="combine" control={<Switch id="combine" />} />
                <SettingRow title="İndirimli ürünlere de uygulansın" description="Zaten indirimli olan varyantlar kampanyaya dahil edilir." htmlFor="discounted" control={<Switch id="discounted" defaultChecked />} />
                <SettingRow title="Ücretsiz kargo" description="Kampanya uygulandığında kargo ücretsiz olur." htmlFor="free-shipping" control={<Switch id="free-shipping" />} />
              </div>
            </FieldGroup>
          </Section>
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Önizleme</span>
            <SegmentedControl
              size="sm"
              mode="radio"
              aria-label="Önizleme cihazı"
              value={device}
              onValueChange={setDevice}
              options={[
                { value: "desktop", icon: <MonitorIcon />, "aria-label": "Masaüstü" },
                { value: "mobile", icon: <SmartphoneIcon />, "aria-label": "Mobil" },
              ]}
            />
          </div>

          <div className="flex justify-center rounded-xl bg-muted p-3 shadow-[inset_0_1px_2px_0_var(--shade-1)]">
            <div
              className={cn("relative h-[520px] overflow-hidden rounded-lg bg-card shadow-card transition-[width] duration-200", device === "mobile" ? "w-[300px]" : "w-full")}
              aria-label="Kampanya önizlemesi"
              role="img"
            >
              {/* Fake storefront */}
              <div className="flex h-10 items-center gap-3 border-b px-4">
                <span className="h-2.5 w-14 rounded-full bg-foreground/15" />
                <span className="ml-auto h-2 w-8 rounded-full bg-foreground/10" />
                <span className="h-2 w-8 rounded-full bg-foreground/10" />
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="h-36 rounded-md bg-foreground/[0.06]" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-md bg-foreground/[0.06]" />
                  <div className="h-20 rounded-md bg-foreground/[0.06]" />
                  <div className="h-20 rounded-md bg-foreground/[0.06]" />
                </div>
                <span className="h-2 w-2/3 rounded-full bg-foreground/10" />
                <span className="h-2 w-1/2 rounded-full bg-foreground/10" />
              </div>

              {/* Widget panel */}
              <motion.div
                layout
                transition={springOrInstant(reduceMotion)}
                className={cn(
                  "absolute bottom-4 flex w-[248px] flex-col gap-3 rounded-xl bg-card p-4 shadow-overlay",
                  side === "right" ? "right-4" : "left-4"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lime-subtle text-lime-subtle-foreground">
                    <PreviewIcon key={icon} className="size-4 animate-in duration-300 ease-(--ease-spring) zoom-in-50 fade-in-0 motion-reduce:animate-none" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">{headline || "Başlık"}</span>
                    <span className="line-clamp-2 text-[12px] text-muted-foreground">{subtitle}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Fırsatın bitmesine</span>
                  <div className="flex gap-1.5 font-mono text-[13px] font-medium tabular-nums">
                    {[
                      ["00", "sa"],
                      ["59", "dk"],
                      ["42", "sn"],
                    ].map(([value, unit]) => (
                      <span key={unit} className="flex items-baseline gap-0.5 rounded-md bg-muted px-1.5 py-1">
                        {value}
                        <span className="text-[10px] text-muted-foreground">{unit}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <AnimatedNumber className="text-base font-semibold" value={price} format={(n) => money.format(n)} />
                  <span className="text-[12px] text-muted-foreground tabular-nums line-through">{money.format(1299)}</span>
                </div>
                <Button variant={ctaStyle} color="lime" size="sm" className="w-full" tabIndex={-1}>
                  {cta || "Sepete ekle"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
