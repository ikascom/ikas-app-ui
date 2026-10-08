"use client"

import { MoreHorizontalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Page, PageHeader } from "@/components/ikas/page"

export default function PageHeaderDemo() {
  return (
    <Page width="full" className="p-0 sm:p-0">
      <PageHeader
        backAction={{ label: "Siparişler", onClick: () => {} }}
        title="#1048"
        titleMeta={
          <>
            <Badge tone="success" dot>
              Ödendi
            </Badge>
            <Badge tone="warning">Gönderilmedi</Badge>
          </>
        }
        description="6 Ekim 2026, 12:24 · Online Mağaza"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Diğer işlemler">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>İrsaliye yazdır</DropdownMenuItem>
                <DropdownMenuItem>Kopyala</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Siparişi iptal et</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">İade et</Button>
            <Button>Ürünleri gönder</Button>
          </>
        }
      />
    </Page>
  )
}
