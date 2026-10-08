"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { PrinterIcon, TruckIcon } from "lucide-react"
import { toast } from "sonner"

import { springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCheckIcon, CopyIconButton } from "@/components/ikas/animated-check"
import { DescriptionList } from "@/components/ikas/description-list"
import { NumberStepper } from "@/components/ikas/number-stepper"
import { ToggleSection } from "@/components/ikas/toggle-section"
import { carriers, customer, orders, type CarrierId } from "@/demos/_data"

const order = orders[0]

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)

/**
 * App Action page, opened in an iframe from the ikas order detail
 * ("Kargo etiketi oluştur"). In a real app `AppBridgeHelper.closeLoader()`
 * runs once on mount and the order id comes from the action's JWT.
 */
export default function OrderActionExample() {
  const reduce = useReducedMotion()
  const [carrier, setCarrier] = React.useState<CarrierId>("express")
  const [packages, setPackages] = React.useState(1)
  const [cod, setCod] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [tracking, setTracking] = React.useState<string | null>(null)
  const selected = carriers.find((c) => c.id === carrier)!

  function create() {
    setCreating(true)
    setTimeout(() => {
      setCreating(false)
      setTracking("KRG 4821 9930 1175")
    }, 1200)
  }

  function onCarrierKeyDown(event: React.KeyboardEvent) {
    const i = carriers.findIndex((c) => c.id === carrier)
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = carriers[(i + delta + carriers.length) % carriers.length]
    setCarrier(next.id)
    document.getElementById(`carrier-${next.id}`)?.focus()
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-icon">
          <TruckIcon className="size-4" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-[15px] font-semibold">Kargo etiketi oluştur</h1>
          <p className="text-[13px] text-muted-foreground">Sipariş {order.number}</p>
        </div>
      </header>

      <AnimatePresence mode="popLayout" initial={false}>
        {tracking ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={springOrInstant(reduce)}
            className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-12 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success shadow-[inset_0_0_0_1px_var(--success-border)]">
              <AnimatedCheckIcon className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Etiket oluşturuldu</h2>
              <p className="text-sm text-muted-foreground">
                {selected.name} · {packages} koli{cod ? " · kapıda ödeme" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted py-1.5 pr-1.5 pl-3 shadow-inset">
              <span className="text-[12px] text-muted-foreground">Takip no</span>
              <code className="font-mono text-sm font-medium">{tracking}</code>
              <CopyIconButton value={tracking.replace(/\s/g, "")} size="icon-xs" label="Takip numarasını kopyala" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTracking(null)}>
                Yeni etiket
              </Button>
              <Button onClick={() => toast("Etiket yazıcıya gönderildi")}>
                <PrinterIcon data-icon="inline-start" data-anim="bounce" />
                Etiketi yazdır
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={springOrInstant(reduce)}
            className="flex flex-1 flex-col"
          >
            <div className="flex flex-1 flex-col gap-6 px-5 py-5">
              <DescriptionList
                className="rounded-xl bg-card px-4 py-3 shadow-card"
                items={[
                  { label: "Sipariş", value: `${order.number} · ${order.items} ürün` },
                  { label: "Müşteri", value: customer.name },
                  { label: "Adres", value: customer.address },
                  { label: "Desi", value: "3,5" },
                ]}
              />

              <div className="flex flex-col gap-2">
                <span id="carrier-label" className="text-sm font-medium">
                  Kargo seçeneği
                </span>
                <div role="radiogroup" aria-labelledby="carrier-label" className="flex flex-col gap-2" onKeyDown={onCarrierKeyDown}>
                  {carriers.map((c) => {
                    const active = c.id === carrier
                    return (
                      <button
                        key={c.id}
                        id={`carrier-${c.id}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setCarrier(c.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-[box-shadow,background-color] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                          active ? "bg-card shadow-[0_0_0_1.5px_var(--foreground),0_2px_6px_-2px_var(--shade-2)]" : "bg-card shadow-raised hover:shadow-raised-hover"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                            active ? "border-foreground bg-foreground" : "border-border-strong"
                          )}
                        >
                          {active && <span className="size-1.5 rounded-full bg-background" />}
                        </span>
                        <span className="flex flex-1 flex-col">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-[13px] text-muted-foreground">{c.eta}</span>
                        </span>
                        <span className="text-sm font-medium tabular-nums">{money(c.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Koli sayısı</span>
                  <span className="text-[13px] text-muted-foreground">Her koli için ayrı etiket basılır.</span>
                </div>
                <NumberStepper label="Koli sayısı" value={packages} onValueChange={setPackages} min={1} max={10} />
              </div>

              <ToggleSection title="Kapıda ödeme" description="Tutar alıcıdan teslimatta tahsil edilir." checked={cod} onCheckedChange={setCod}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="cod-amount">Tahsil edilecek tutar</FieldLabel>
                    <Input id="cod-amount" inputMode="decimal" defaultValue="1.249,90" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cod-type">Tahsilat türü</FieldLabel>
                    <Select defaultValue="cash">
                      <SelectTrigger id="cod-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="cash">Nakit</SelectItem>
                        <SelectItem value="card">Kredi kartı</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </ToggleSection>
            </div>

            <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background px-5 py-3">
              <span className="text-[13px] text-muted-foreground">
                Tahmini ücret <strong className="font-medium text-foreground tabular-nums">{money(selected.price * packages)}</strong>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={creating} onClick={() => toast("Aksiyon kapatıldı")}>
                  Vazgeç
                </Button>
                <Button loading={creating} onClick={create}>
                  Etiket oluştur
                </Button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
