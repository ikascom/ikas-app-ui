"use client"

import * as React from "react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/sonner"

const TOASTER = "toast-soft"

/** variant="soft": the Banner tint on every toast. For apps that want toasts to read louder. */
export default function ToastSoft() {
  React.useEffect(() => {
    const options = { toasterId: TOASTER, duration: Infinity }
    toast.info("Eşitleme sıraya alındı", { ...options, id: "soft-info", description: "Yaklaşık 2 dakika içinde başlar." })
    toast.error("Kaydedilemedi", {
      ...options,
      id: "soft-error",
      description: "Bağlantı koptu. Tekrar deneyin.",
      action: { label: "Tekrar dene", onClick: () => toast.dismiss("soft-error") },
    })
    toast.success("Ayarlar kaydedildi", { ...options, id: "soft-success" })
  }, [])

  return (
    <div className="relative mx-auto h-56 w-full max-w-[400px]">
      <Toaster id={TOASTER} variant="soft" expand position="bottom-center" offset={0} className="absolute! inset-0! w-full! transform-none!" />
    </div>
  )
}
