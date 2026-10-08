"use client"

import * as React from "react"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"

/** status="danger": the section could not load. Say what failed, then offer a retry. */
export default function EmptyStateError() {
  const [retrying, setRetrying] = React.useState(false)

  return (
    <Card className="w-full max-w-lg py-0">
      <EmptyState
        status="danger"
        title="Kampanyalar yüklenemedi"
        description="Sunucuya ulaşılamadı. Kampanyalarınız etkilenmedi; birazdan tekrar deneyin."
        onRetry={() => {
          setRetrying(true)
          setTimeout(() => setRetrying(false), 1500)
        }}
        retrying={retrying}
        footer={<span className="font-mono">Hata kodu: CMP-503</span>}
      />
    </Card>
  )
}
