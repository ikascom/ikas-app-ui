"use client"

import * as React from "react"
import { ArrowRightIcon, ChevronRightIcon, DotIcon, SlashIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const separators = {
  chevron: { label: "Ok başı", icon: <ChevronRightIcon /> },
  slash: { label: "Eğik çizgi", icon: <SlashIcon /> },
  dot: { label: "Nokta", icon: <DotIcon /> },
  arrow: { label: "Ok", icon: <ArrowRightIcon /> },
} as const

type Separator = keyof typeof separators

/** One `separator` on Breadcrumb changes every separator in the trail. */
export default function BreadcrumbCustomSeparator() {
  const [separator, setSeparator] = React.useState<Separator>("slash")

  return (
    <div className="flex flex-col items-center gap-8">
      <SegmentedControl
        size="sm"
        mode="radio"
        aria-label="Ayraç"
        value={separator}
        onValueChange={setSeparator}
        options={Object.entries(separators).map(([value, s]) => ({
          value: value as Separator,
          icon: s.icon,
          "aria-label": s.label,
        }))}
      />
      <Breadcrumb separator={separators[separator].icon}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Ayarlar</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Kargo</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Teslimat bölgeleri</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>İstanbul</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
