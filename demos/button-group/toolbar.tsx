"use client"

import { ChevronDownIcon, CopyIcon, DownloadIcon, PencilIcon, PrinterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ButtonGroupToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonGroup aria-label="Sipariş işlemleri">
        <Button variant="outline">
          <PencilIcon data-icon="inline-start" />
          Düzenle
        </Button>
        <Button variant="outline">
          <PrinterIcon data-icon="inline-start" />
          Yazdır
        </Button>
        <Button variant="outline" size="icon" aria-label="Kopyala">
          <CopyIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Dışa aktar">
        <Button>
          <DownloadIcon data-icon="inline-start" />
          Dışa aktar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" aria-label="Biçim seç">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>Excel</DropdownMenuItem>
            <DropdownMenuItem>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
