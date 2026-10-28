"use client"

import { ChevronRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SortableStack,
  SortableStackGroup,
  SortableStackHandle,
  SortableStackItem,
  SortableStackItemContent,
  SortableStackUndo,
} from "@/components/ikas/sortable-stack"

const tasks = [
  {
    id: "ship",
    title: "Kargolanmayı bekleyen siparişler",
    hint: "En eskisi 2 gün önce",
    count: 12,
    status: "neutral",
  },
  {
    id: "returns",
    title: "İade talepleri",
    hint: "Onay bekliyor",
    count: 3,
    status: "neutral",
  },
  {
    id: "stock",
    title: "Stoğu azalan ürünler",
    hint: "5 adetin altında",
    count: 5,
    status: "warning",
  },
  {
    id: "transfer",
    title: "Havale onayları",
    hint: "Ödeme kontrol edilecek",
    count: 4,
    status: "neutral",
  },
  {
    id: "reviews",
    title: "Yanıt bekleyen yorumlar",
    hint: "Son 24 saat",
    count: 2,
    status: "neutral",
  },
] as const

export default function SortableStackTasks() {
  return (
    <SortableStack label="Bugünkü işler" defaultItems={[...tasks]} getItemLabel={(task) => task.title}>
      {(items) => (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bugünkü işler</CardTitle>
            <CardDescription>Önce yapmak istediğinizi en üste taşıyın.</CardDescription>
            <CardAction>
              <SortableStackUndo />
            </CardAction>
          </CardHeader>
          <SortableStackGroup className="px-2.5">
            {items.map((task) => (
              <SortableStackItem key={task.id} id={task.id}>
                <SortableStackHandle />
                <SortableStackItemContent>
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{task.hint}</p>
                </SortableStackItemContent>
                <Badge status={task.status} dot={task.status === "warning"}>
                  {task.count}
                </Badge>
                <Button variant="ghost" size="icon-sm" aria-label={`${task.title} sayfasını aç`} className="-mr-1.5 text-icon hover:text-foreground">
                  <ChevronRightIcon data-anim="nudge" />
                </Button>
              </SortableStackItem>
            ))}
          </SortableStackGroup>
        </Card>
      )}
    </SortableStack>
  )
}
