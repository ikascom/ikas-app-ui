"use client"

import * as React from "react"

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Page, PageHeader } from "@/components/ikas/page"
import { PageNav } from "@/components/ikas/page-nav"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const data = {
  "7": { value: "₺48.210", label: "son 7 gün" },
  "30": { value: "₺184.320", label: "son 30 gün" },
  "90": { value: "₺512.940", label: "son 90 gün" },
} as const

/** Level 1 is the underlined PageNav, level 2 the pill inside the card. Never two pills. */
export default function PageNavNested() {
  const [section, setSection] = React.useState("overview")
  const [range, setRange] = React.useState<keyof typeof data>("30")

  return (
    <Page width="full" className="py-0">
      <PageNav
        value={section}
        onValueChange={setSection}
        items={[
          { value: "overview", label: "Genel bakış" },
          { value: "orders", label: "Siparişler" },
          { value: "settings", label: "Ayarlar" },
        ]}
      />
      <PageHeader title="Genel bakış" />
      <Card>
        <CardHeader>
          <CardTitle>Ciro</CardTitle>
          <CardAction>
            <SegmentedControl
              size="sm"
              mode="radio"
              aria-label="Zaman aralığı"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "7", label: "7G" },
                { value: "30", label: "30G" },
                { value: "90", label: "90G" },
              ]}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-0.5">
          <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">{data[range].value}</span>
          <span className="text-[13px] text-muted-foreground">{data[range].label}</span>
        </CardContent>
      </Card>
    </Page>
  )
}
