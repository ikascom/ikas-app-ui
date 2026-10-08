"use client"

import { FileTextIcon, PrinterIcon, RefreshCwIcon, SendIcon, SlidersHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { ActionBar } from "@/components/ikas/action-bar"

export default function ActionBarReport() {
  return (
    <ActionBar
      label="Rapor aksiyonları"
      items={[
        { id: "params", label: "Parametreler", icon: <SlidersHorizontalIcon data-anim="pop" />, onClick: () => toast("Parametreler açıldı") },
        { id: "refresh", label: "Yenile", icon: <RefreshCwIcon data-anim="spin" />, onClick: () => toast("Rapor yenilendi") },
        { id: "drafts", label: "Taslaklar", icon: <FileTextIcon data-anim="wiggle" />, badge: 3, onClick: () => toast("3 taslak") },
        { id: "print", label: "Yazdır", icon: <PrinterIcon data-anim="drop" />, onClick: () => toast("Yazdırılıyor") },
        { id: "send", label: "Gönder", icon: <SendIcon data-anim="lift" />, variant: "solid", onClick: () => toast.success("Rapor gönderildi") },
      ]}
    />
  )
}
