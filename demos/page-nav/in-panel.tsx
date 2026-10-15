"use client"

import * as React from "react"
import { ArrowLeftIcon, BoxIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Page, PageHeader } from "@/components/ikas/page"
import { PageNav } from "@/components/ikas/page-nav"

// The ikas panel's own top bar, drawn here only for context. An app never
// renders this: the panel already shows back, logo, app name and the plan button.
function PanelBar() {
  return (
    <div aria-hidden className="flex h-18 items-center gap-4 border-b bg-card px-6">
      <Button variant="outline" size="icon-sm" tabIndex={-1} className="pointer-events-none">
        <ArrowLeftIcon />
      </Button>
      <span className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
        <BoxIcon className="size-5" />
      </span>
      <span className="text-lg font-semibold">Uygulama</span>
      <Button color="violet" tabIndex={-1} className="pointer-events-none ml-auto">
        Planı Yönet
      </Button>
    </div>
  )
}

const labels = {
  templates: "Şablonlar",
  shipments: "Gönderimler",
  printers: "Yazıcılar",
  history: "Geçmiş",
} as const

type Section = keyof typeof labels

export default function PageNavInPanel() {
  const [section, setSection] = React.useState<Section>("shipments")

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border bg-background shadow-card">
      <PanelBar />
      <Page width="full" className="pt-0">
        <PageNav
          value={section}
          onValueChange={setSection}
          items={[
            { value: "templates", label: labels.templates },
            { value: "shipments", label: labels.shipments, badge: 3 },
            { value: "printers", label: labels.printers },
            { value: "history", label: labels.history },
          ]}
        />
        <PageHeader
          title={labels[section]}
          description="Başlık bölümün adıdır; uygulamanın adı ve logosu panelin üst barında zaten var."
          actions={
            <Button>
              <PlusIcon data-icon="inline-start" />
              Etiket oluştur
            </Button>
          }
        />
        <Card>
          <CardContent className="text-sm text-muted-foreground">{labels[section]} bölümünün içeriği.</CardContent>
        </Card>
      </Page>
    </div>
  )
}
