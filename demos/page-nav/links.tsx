"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Page, PageHeader } from "@/components/ikas/page"
import { PageNav } from "@/components/ikas/page-nav"

const labels = {
  overview: "Genel bakış",
  shipments: "Gönderimler",
  settings: "Ayarlar",
  reports: "Raporlar",
} as const

type Section = keyof typeof labels

/** Router apps: items are links and the active one comes from the route. Here a query param stands in for a path. */
function Sections() {
  const params = useSearchParams()
  const current = params.get("section")
  const section: Section = current && current in labels ? (current as Section) : "overview"

  return (
    <Page width="full" className="py-0">
      <PageNav
        value={section}
        linkComponent={Link}
        items={[
          { value: "overview", label: labels.overview, href: "?section=overview" },
          { value: "shipments", label: labels.shipments, href: "?section=shipments", badge: 3 },
          { value: "settings", label: labels.settings, href: "?section=settings" },
          { value: "reports", label: labels.reports, href: "?section=reports", disabled: true },
        ]}
      />
      <PageHeader title={labels[section]} />
      <Card>
        <CardContent className="text-sm text-muted-foreground">{labels[section]} bölümünün içeriği.</CardContent>
      </Card>
    </Page>
  )
}

// useSearchParams needs a Suspense boundary on statically exported pages.
export default function PageNavLinks() {
  return (
    <React.Suspense>
      <Sections />
    </React.Suspense>
  )
}
