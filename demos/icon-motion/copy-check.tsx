"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { AnimatedCheckIcon, CopyIconButton } from "@/components/ikas/animated-check"

export default function IconMotionCopyCheck() {
  const [saved, setSaved] = React.useState(0)

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex h-10 items-center gap-2 rounded-lg border bg-card pr-1.5 pl-3 font-mono text-[13px]">
        sk_test_8f2a…c91
        <CopyIconButton value="sk_test_8f2a91c91" label="API anahtarını kopyala" size="icon-xs" />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setSaved((n) => n + 1)}>
          Kaydet
        </Button>
        {saved > 0 && (
          <span key={saved} className="flex items-center gap-1.5 text-sm text-success">
            <AnimatedCheckIcon />
            Kaydedildi
          </span>
        )}
      </div>
    </div>
  )
}
