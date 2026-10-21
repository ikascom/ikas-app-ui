"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatMoney, orders, orderStatusBadge } from "@/demos/_data"

const recent = orders.slice(0, 4)

/** Skeleton wraps the real content: each placeholder takes its content's size and shape, so nothing moves when the orders arrive. */
export default function SkeletonLoading() {
  const [loading, setLoading] = React.useState(true)

  return (
    <Card className="w-full max-w-md gap-0 pb-0">
      <CardHeader className="pb-3">
        <CardTitle>Son siparişler</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Label htmlFor="skeleton-loading" className="text-[13px] font-normal text-muted-foreground">
            Yükleniyor
          </Label>
          <Switch id="skeleton-loading" checked={loading} onCheckedChange={setLoading} />
        </CardAction>
      </CardHeader>
      <ul className="divide-y border-t" aria-busy={loading}>
        {recent.map((order) => (
          <li key={order.id} className="flex h-14 items-center gap-4 px-5">
            <div className="grid flex-1 justify-items-start gap-0.5">
              <Skeleton loading={loading}>
                <span className="text-[13px] leading-[14px] font-medium">{order.number}</span>
              </Skeleton>
              <Skeleton loading={loading}>
                <span className="text-xs leading-[14px] text-muted-foreground">{order.customer}</span>
              </Skeleton>
            </div>
            <Skeleton loading={loading}>
              <Badge status={orderStatusBadge[order.status].status}>{orderStatusBadge[order.status].label}</Badge>
            </Skeleton>
            <div className="flex w-20 justify-end">
              <Skeleton loading={loading}>
                <span className="text-[13px] tabular-nums">{formatMoney(order.total)}</span>
              </Skeleton>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
