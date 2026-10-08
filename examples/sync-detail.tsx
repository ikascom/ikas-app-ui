"use client"

import * as React from "react"
import { CopyIcon, MoreHorizontalIcon, RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge, type BadgeStatus } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DescriptionList } from "@/components/ikas/description-list"
import { EmptyState } from "@/components/ikas/empty-state"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { cn } from "@/lib/utils"
import { channels, formatMoney, syncedProduct, type ChannelKey, type ChannelState } from "@/demos/_data"

const channelState: Record<ChannelState, { label: string; status: BadgeStatus }> = {
  live: { label: "Yayında", status: "success" },
  rejected: { label: "Reddedildi", status: "danger" },
  review: { label: "Onay bekliyor", status: "warning" },
}

type ChannelRow = (typeof syncedProduct.channels)[number]
type SyncError = (typeof syncedProduct.errors)[number]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * One product as a marketplace integration sees it: where it is live, what each
 * channel rejected and why, and what the app sent when. The screen store owners
 * open from a sync error notification.
 */
export default function SyncDetailExample() {
  const product = syncedProduct
  const [errors, setErrors] = React.useState<SyncError[]>(product.errors)
  const [retrying, setRetrying] = React.useState<string[]>([])
  const [resolved, setResolved] = React.useState<SyncError[]>([])

  const stateOf = (row: ChannelRow): ChannelState =>
    row.state !== "live" && !errors.some((e) => e.channel === row.key) ? "live" : row.state
  const failingChannels = new Set(errors.map((e) => e.channel)).size

  async function retry(ids: string[]) {
    setRetrying((r) => [...r, ...ids])
    await wait(1100)
    setRetrying((r) => r.filter((id) => !ids.includes(id)))
    setResolved((r) => [...r, ...errors.filter((e) => ids.includes(e.id))])
    setErrors((list) => list.filter((e) => !ids.includes(e.id)))
    toast.success(ids.length === 1 ? `${ids[0]} yeniden gönderildi` : `${ids.length} kayıt yeniden gönderildi`)
  }

  const channelColumns: RecordTableColumn<ChannelRow>[] = [
    { id: "channel", header: "Kanal", cell: (row) => <span className="font-medium text-foreground">{channels[row.key]}</span> },
    {
      id: "state",
      header: "Durum",
      cell: (row) => {
        const state = channelState[stateOf(row)]
        return (
          <Badge status={state.status} dot>
            {state.label}
          </Badge>
        )
      },
    },
    { id: "externalId", header: "Kanal ürün no", hideOnMobile: true, cell: (row) => <span className="font-mono text-[13px]">{row.externalId}</span> },
    { id: "syncedAt", header: "Son gönderim", align: "end", cell: (row) => <span className="font-mono text-[13px]">{row.syncedAt}</span> },
  ]

  return (
    <Page width="wide">
      <PageHeader
        back={{ label: "Eşitleme hataları", onClick: () => toast("Eşitleme hatalarına dönülüyor") }}
        title={product.name}
        badges={
          failingChannels > 0 ? (
            <Badge status="danger" dot>
              {failingChannels} kanalda hata
            </Badge>
          ) : (
            <Badge status="success" dot>
              Tüm kanallar güncel
            </Badge>
          )
        }
        description={
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-mono text-[13px] text-foreground">{product.id}</span>
            <span aria-hidden>·</span>
            {product.variant}
            <span aria-hidden>·</span>
            {formatMoney(product.price)} · {product.stock} adet
          </span>
        }
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Diğer işlemler">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ürünü panelde aç</DropdownMenuItem>
                <DropdownMenuItem>Eşitleme kaydını indir</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Bu ürünü eşitlemeden çıkar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button disabled={errors.length === 0} loading={retrying.length > 0} onClick={() => retry(errors.map((e) => e.id))}>
              <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
              Hepsini yeniden gönder
            </Button>
          </>
        }
      />

      <Layout columns="main-aside">
        <LayoutColumn>
          <RecordTable label="Kanal durumu" columns={channelColumns} rows={product.channels} getRowId={(row) => row.key} />

          <Card>
            <CardHeader>
              <CardTitle>Hata kaydı</CardTitle>
              <CardDescription>Kanalların bu ürün için döndürdüğü hatalar. Düzelttikten sonra yeniden gönderin.</CardDescription>
              {errors.length > 0 && (
                <CardAction>
                  <Badge status="danger">{errors.length} açık</Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <EmptyState size="inline" title="Açık hata yok" description="Ürün tüm kanallarda güncel." />
              ) : (
                <ul className="flex flex-col divide-y">
                  {errors.map((error) => (
                    <li key={error.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                          <span className="font-medium text-foreground">{channels[error.channel as ChannelKey]}</span>
                          <code className="rounded bg-muted px-1 font-mono text-[12px] text-muted-foreground">{error.code}</code>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            {error.id} · {error.at}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{error.message}</p>
                      </div>
                      <Button size="sm" variant="outline" loading={retrying.includes(error.id)} onClick={() => retry([error.id])} className="self-start">
                        Yeniden dene
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {resolved.length > 0 && (
                <p className="mt-3 border-t pt-3 text-[13px] text-muted-foreground">
                  Bu oturumda çözülen: <span className="font-mono text-[12px]">{resolved.map((e) => e.id).join(", ")}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </LayoutColumn>

        <LayoutColumn>
          <Card>
            <CardHeader>
              <CardTitle>Eşitleme akışı</CardTitle>
              <CardDescription>Bugün, en yeni üstte.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col">
                {product.timeline.map((event, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < product.timeline.length - 1 && <span aria-hidden className="absolute top-3 -bottom-0.5 left-[3.5px] w-px bg-border" />}
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rotate-45 rounded-[1px]",
                        event.state === "error" ? "bg-danger" : event.state === "ok" ? "bg-foreground" : "bg-border-strong"
                      )}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="text-sm text-foreground">{event.text}</p>
                      <p className="text-[12px] text-muted-foreground">
                        <span className="font-mono">{event.at}</span>
                        {event.channel && ` · ${channels[event.channel as ChannelKey]}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kimlikler</CardTitle>
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="ikas ürün ID'sini kopyala"
                  onClick={() => toast.success(`${product.id} kopyalandı`)}
                  className="text-icon"
                >
                  <CopyIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DescriptionList
                layout="stacked"
                items={[
                  { label: "ikas ürün ID", value: <span className="font-mono text-[13px]">{product.id}</span> },
                  { label: "Stok kodu (SKU)", value: <span className="font-mono text-[13px]">{product.sku}</span> },
                  { label: "Barkod", value: <span className="font-mono text-[13px]">{product.barcode}</span> },
                ]}
              />
            </CardContent>
          </Card>
        </LayoutColumn>
      </Layout>
    </Page>
  )
}
