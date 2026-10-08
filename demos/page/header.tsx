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
        back={{ label: "Siparişler", onClick: () => {} }}
        title="IK-1048"
        badges={
          <>
            <Badge status="warning" dot>
              Hazırlanıyor
            </Badge>
            <Badge variant="surface" status="success">
              Pazaryerine iletildi
            </Badge>
          </>
        }
        description="6 Ekim 2026, 12:24 · Pazaryeri A"
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
            <Button variant="outline">Faturayı görüntüle</Button>
            <Button>Kargoya ver</Button>
          </>
        }
      />
    </Page>
  )
}
