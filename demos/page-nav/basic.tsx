"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Page, PageHeader } from "@/components/ikas/page"
import { PageNav } from "@/components/ikas/page-nav"

const sections = {
  overview: { label: "Genel bakış", text: "Bu ayki gönderimler ve kalan etiket hakkı." },
  shipments: { label: "Gönderimler", text: "Kargoya verilen ve etiket bekleyen gönderimler." },
  rules: { label: "Kurallar", text: "Hangi siparişin hangi kargo firmasına gideceği." },
  settings: { label: "Ayarlar", text: "Kargo hesapları ve etiket boyutu." },
} as const

type Section = keyof typeof sections

export default function PageNavBasic() {
  const [section, setSection] = React.useState<Section>("shipments")

  return (
    <Page width="full" className="py-0">
      <PageNav
        value={section}
        onValueChange={setSection}
        items={[
          { value: "overview", label: sections.overview.label },
          { value: "shipments", label: sections.shipments.label, badge: 3 },
          { value: "rules", label: sections.rules.label },
          { value: "settings", label: sections.settings.label },
        ]}
      />
      <PageHeader title={sections[section].label} description={sections[section].text} />
      <Card>
        <CardContent className="text-sm text-muted-foreground">{sections[section].label} bölümünün içeriği.</CardContent>
      </Card>
    </Page>
  )
}
