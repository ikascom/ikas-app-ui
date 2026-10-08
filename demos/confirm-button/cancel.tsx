"use client"

import { toast } from "sonner"

import { ConfirmButton } from "@/components/ikas/confirm-button"

export default function ConfirmButtonCancel() {
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-card">
      <div className="flex flex-col">
        <span className="text-sm font-medium">Tedarikçi siparişi #482</span>
        <span className="text-[13px] text-muted-foreground">6 adetten 2&apos;si teslim alındı</span>
      </div>
      <ConfirmButton size="sm" confirmLabel="Kalan 4 adet iptal edilsin mi?" onConfirm={() => toast.success("Kalan 4 adet iptal edildi")}>
        Kalanı iptal et
      </ConfirmButton>
    </div>
  )
}
