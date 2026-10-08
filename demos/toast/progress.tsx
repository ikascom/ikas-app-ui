"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

const TOASTER = "toast-progress"

/** progress: a 2px bar counts down the duration and stops while the pointer is over the toasts. */
export default function ToastProgress() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => toast.success("Ayarlar kaydedildi", { toasterId: TOASTER })}>
        Kaydet (4 sn)
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Rapor hazırlanıyor", {
            toasterId: TOASTER,
            description: "Hazır olduğunda e-posta ile göndereceğiz.",
            duration: 8000,
          })
        }
      >
        Rapor iste (8 sn)
      </Button>
      <Toaster id={TOASTER} progress />
    </div>
  )
}
