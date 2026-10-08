"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpandableSearch } from "@/components/ikas/expandable-search"

const products = ["Basic oversize tişört", "Keten gömlek", "Kanvas çanta", "Yüksek bel pantolon", "Örgü kazak"]

export default function ExpandableSearchToolbar() {
  const [query, setQuery] = React.useState("")
  const results = products.filter((p) => p.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")))

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="low">Az stok</TabsTrigger>
            <TabsTrigger value="out">Tükendi</TabsTrigger>
          </TabsList>
        </Tabs>
        <ExpandableSearch value={query} onValueChange={setQuery} placeholder="Ürün ara" />
      </div>
      <ul className="divide-y text-sm">
        {results.map((p) => (
          <li key={p} className="px-4 py-2.5">
            {p}
          </li>
        ))}
        {results.length === 0 && <li className="px-4 py-6 text-center text-muted-foreground">“{query}” için sonuç yok</li>}
      </ul>
    </div>
  )
}
