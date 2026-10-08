"use client"

import * as React from "react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/sonner"

const TOASTER = "toast-preview"

/** Toasts on their own: a local Toaster pinned inside the frame, filled on mount. */
export default function ToastPreview() {
  React.useEffect(() => {
    // Fixed ids keep StrictMode's double effect from stacking duplicates.
    const options = { toasterId: TOASTER, duration: Infinity }
    toast.info("Eşitleme sıraya alındı", { ...options, id: "preview-info", description: "Yaklaşık 2 dakika içinde başlar." })
    toast.warning("3 ürün atlandı", { ...options, id: "preview-warning", description: "Barkodu olmayan ürünler gönderilmedi." })
    toast.success("Kural silindi", {
      ...options,
      id: "preview-success",
      description: "Düşük stok uyarısı",
      action: { label: "Geri al", onClick: () => toast.dismiss("preview-success") },
    })
  }, [])

  return (
    <div className="relative mx-auto h-64 w-full max-w-[400px]">
      <Toaster id={TOASTER} expand position="bottom-center" offset={0} className="toaster group absolute! inset-0! w-full! transform-none!" />
    </div>
  )
}
