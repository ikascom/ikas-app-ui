"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { BellIcon, CopyIcon, FlaskConicalIcon, HistoryIcon, PencilIcon, PlusIcon, RocketIcon, Trash2Icon, XIcon, ZapIcon } from "lucide-react"
import { toast } from "sonner"

import { EASE_OUT, springOrInstant } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ActionBar } from "@/components/ikas/action-bar"
import { Collapse } from "@/components/ikas/collapse"
import { ConfirmButton } from "@/components/ikas/confirm-button"
import { NumberStepper } from "@/components/ikas/number-stepper"
import { Page, PageHeader } from "@/components/ikas/page"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { SettingRow } from "@/components/ikas/setting-row"
import { store } from "@/demos/_data"

type Condition = { id: number; field: string; operator: string; value: string }

const fields = [
  { value: "category", label: "Kategori" },
  { value: "brand", label: "Marka" },
  { value: "price", label: "Satış fiyatı" },
  { value: "tag", label: "Etiket" },
]

const operators = [
  { value: "is", label: "eşittir" },
  { value: "is-not", label: "eşit değildir" },
  { value: "contains", label: "içerir" },
]

const runs = [
  { id: "r1", time: "Bugün 14:05", product: "Basic oversize tişört · Siyah / M", stock: 3, result: "sent" as const },
  { id: "r2", time: "Bugün 09:41", product: "Keten gömlek · Ekru / L", stock: 4, result: "sent" as const },
  { id: "r3", time: "Dün 22:17", product: "Kanvas çanta · Naturel", stock: 0, result: "failed" as const },
]

/** Removed rows collapse their own height so the list closes the gap instead of jumping. */
const COLLAPSE = { opacity: { duration: 0.12 }, height: { duration: 0.2, ease: EASE_OUT, delay: 0.04 } }
const ENTER = { opacity: { duration: 0.15 }, height: { duration: 0 } }

export default function AutomationRuleExample() {
  const reduceMotion = useReducedMotion()
  const [editingTrigger, setEditingTrigger] = React.useState(false)
  const [threshold, setThreshold] = React.useState(5)
  const [match, setMatch] = React.useState<"all" | "any">("all")
  const [conditions, setConditions] = React.useState<Condition[]>([
    { id: 1, field: "category", operator: "is", value: "Tişört" },
    { id: 2, field: "brand", operator: "is-not", value: "Outlet" },
  ])
  const nextId = React.useRef(3)
  const [emailOn, setEmailOn] = React.useState(true)

  function addCondition() {
    setConditions((list) => [...list, { id: nextId.current++, field: "tag", operator: "contains", value: "" }])
  }

  function updateCondition(id: number, patch: Partial<Condition>) {
    setConditions((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  return (
    <Page>
      <PageHeader
        back={{ label: "Kurallar", onClick: () => toast("Kurallara dönülüyor") }}
        title="Düşük stok uyarısı"
        badges={
          <Badge status="success" dot>
            Etkin
          </Badge>
        }
        description="Son çalışma bugün 14:05 · 24 kez tetiklendi"
        actions={
          <ActionBar
            label="Kural aksiyonları"
            items={[
              { id: "test", label: "Test et", icon: <FlaskConicalIcon />, onClick: () => toast("Test çalıştırıldı, 2 ürün eşleşti") },
              { id: "history", label: "Geçmiş", icon: <HistoryIcon />, badge: 3 },
              { id: "duplicate", label: "Çoğalt", icon: <CopyIcon />, onClick: () => toast.success("Kural çoğaltıldı") },
              { id: "publish", label: "Yayınla", icon: <RocketIcon />, variant: "solid", onClick: () => toast.success("Kural yayınlandı") },
            ]}
          />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="size-4 text-icon" />
            Tetikleyici
          </CardTitle>
          <CardDescription>
            Bir varyantın stoğu <strong className="font-medium text-foreground">{threshold} adedin</strong> altına düştüğünde.
          </CardDescription>
          <CardAction>
            <Button size="sm" variant="outline" aria-expanded={editingTrigger} aria-controls="trigger-editor" onClick={() => setEditingTrigger((v) => !v)}>
              {editingTrigger ? <XIcon data-icon="inline-start" /> : <PencilIcon data-icon="inline-start" data-anim="wiggle" />}
              {editingTrigger ? "Kapat" : "Değiştir"}
            </Button>
          </CardAction>
        </CardHeader>
        <Collapse open={editingTrigger} id="trigger-editor">
          <CardContent>
            <div className="flex flex-wrap items-end gap-4 border-t pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Olay</span>
                <Select defaultValue="stock-below">
                  <SelectTrigger className="w-56" aria-label="Olay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="stock-below">Stok eşiğin altına düştü</SelectItem>
                    <SelectItem value="out-of-stock">Stok tükendi</SelectItem>
                    <SelectItem value="restock">Stok yenilendi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Eşik (adet)</span>
                <NumberStepper label="Eşik (adet)" value={threshold} onValueChange={setThreshold} min={1} max={500} />
              </div>
            </div>
          </CardContent>
        </Collapse>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Koşullar</CardTitle>
          <CardDescription>Kural yalnızca bu koşulları sağlayan ürünlerde çalışır.</CardDescription>
          <CardAction>
            <SegmentedControl
              size="sm"
              mode="radio"
              aria-label="Eşleşme"
              value={match}
              onValueChange={setMatch}
              options={[
                { value: "all", label: "Tümü (VE)" },
                { value: "any", label: "Herhangi biri (VEYA)" },
              ]}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col">
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {conditions.map((condition, index) => (
                <motion.li
                  key={condition.id}
                  initial={{ opacity: 0, height: "auto" }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, transition: COLLAPSE }}
                  transition={ENTER}
                  className="overflow-hidden"
                >
                  {/* Padding sits on the inner div so the li can really collapse to 0. */}
                  <div className="flex flex-col gap-2 pb-3">
                    {index > 0 && (
                      <motion.span layout="position" transition={springOrInstant(reduceMotion)} className="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {match === "all" ? "VE" : "VEYA"}
                      </motion.span>
                    )}
                    <div className="group/row flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2 has-[[data-remove]:hover]:bg-danger-subtle">
                      <Select value={condition.field} onValueChange={(field) => updateCondition(condition.id, { field })}>
                        <SelectTrigger size="sm" className="w-36" aria-label="Alan">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {fields.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={condition.operator} onValueChange={(operator) => updateCondition(condition.id, { operator })}>
                        <SelectTrigger size="sm" className="w-36" aria-label="Operatör">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {operators.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        aria-label="Değer"
                        placeholder="Değer"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        className="h-8 min-w-32 flex-1"
                      />
                      <Button
                        data-remove
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Koşulu kaldır"
                        className="text-icon hover:bg-transparent hover:text-danger"
                        onClick={() => setConditions((list) => list.filter((c) => c.id !== condition.id))}
                      >
                        <Trash2Icon data-anim="wiggle" />
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <button
            type="button"
            onClick={addCondition}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-150 outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <PlusIcon className="size-4" data-anim="bounce" />
            Koşul ekle
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aksiyonlar</CardTitle>
          <CardDescription>Tetiklendiğinde sırayla çalışır.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            title="Ekibe e-posta gönder"
            description={`${store.stockEmail} adresine ürün ve kalan adet bilgisiyle.`}
            htmlFor="action-email"
            control={<Switch id="action-email" checked={emailOn} onCheckedChange={setEmailOn} />}
          />
          <SettingRow
            title="Panel bildirimi"
            description="ikas panelinde bildirim olarak görünür."
            htmlFor="action-notify"
            control={<Switch id="action-notify" defaultChecked />}
          />
          <SettingRow title="Stok sıfırlanınca ürünü pasife al" description="Satışa kapalı ürünler mağazada görünmez." htmlFor="action-deactivate" control={<Switch id="action-deactivate" />} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="size-4 text-icon" />
            Son çalışmalar
          </CardTitle>
          <CardAction>
            <Button size="sm" variant="ghost">
              Tümünü gör
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {runs.map((run) => (
            <div key={run.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <span className="w-24 shrink-0 text-[13px] text-muted-foreground tabular-nums">{run.time}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{run.product}</span>
              <span className="text-[13px] text-muted-foreground tabular-nums">{run.stock} adet</span>
              {run.result === "sent" ? <Badge status="success">Gönderildi</Badge> : <Badge status="danger">Başarısız</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-danger-border px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Kuralı sil</span>
          <span className="text-[13px] text-muted-foreground">Geçmiş kayıtları da silinir. Bu işlem geri alınamaz.</span>
        </div>
        <ConfirmButton size="sm" confirmLabel="Kalıcı olarak silinsin mi?" onConfirm={() => toast.success("Kural silindi")}>
          Kuralı sil
        </ConfirmButton>
      </div>
    </Page>
  )
}
