"use client"

import * as React from "react"
import { StoreIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyIconButton } from "@/components/ikas/animated-check"
import { Banner } from "@/components/ikas/banner"
import { ConfirmButton } from "@/components/ikas/confirm-button"

type ScriptStatus = "installed" | "outdated" | "not-installed"

type Storefront = {
  id: string
  name: string
  domain?: string
  status: ScriptStatus
}

type ScriptInstallerProps = {
  /** Public URL of the script the app injects into the storefront. */
  scriptUrl: string
  storefronts: Storefront[]
  /** Install or update. Resolve when done; the row shows a loading state meanwhile. */
  onInstall: (storefrontId: string) => Promise<void> | void
  onRemove: (storefrontId: string) => Promise<void> | void
  className?: string
}

const statusBadge: Record<ScriptStatus, { label: string; status: "success" | "warning" | "neutral" }> = {
  installed: { label: "Kurulu", status: "success" },
  outdated: { label: "Güncel değil", status: "warning" },
  "not-installed": { label: "Kurulu değil", status: "neutral" },
}

/**
 * Storefront script install / update / remove, one row per storefront.
 * Warns when the script URL cannot be reached from a storefront (localhost).
 */
function ScriptInstaller({ scriptUrl, storefronts, onInstall, onRemove, className }: ScriptInstallerProps) {
  const [busy, setBusy] = React.useState<Record<string, "install" | "remove" | undefined>>({})
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(scriptUrl)

  async function run(id: string, kind: "install" | "remove") {
    setBusy((b) => ({ ...b, [id]: kind }))
    try {
      await (kind === "install" ? onInstall(id) : onRemove(id))
    } finally {
      setBusy((b) => ({ ...b, [id]: undefined }))
    }
  }

  return (
    <div data-slot="script-installer" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 shadow-inset">
        <span className="shrink-0 text-[12px] text-muted-foreground">Script</span>
        <code className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{scriptUrl}</code>
        <CopyIconButton value={scriptUrl} size="icon-xs" label="Script adresini kopyala" />
      </div>

      {isLocal && (
        <Banner status="danger" variant="surface" title="Script storefront tarafından yüklenemez">
          Adres localhost olduğu için tarayıcı storefront&apos;tan erişimi engeller. Uygulamayı bir tünel veya genel bir domain üzerinden açıp script&apos;i yeniden kurun.
        </Banner>
      )}

      <ul className="flex flex-col divide-y rounded-lg border">
        {storefronts.map((s) => {
          const state = busy[s.id]
          const badge = statusBadge[s.status]
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-icon">
                <StoreIcon className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{s.name}</span>
                {s.domain && <span className="truncate text-[13px] text-muted-foreground">{s.domain}</span>}
              </div>
              <Badge status={badge.status} dot={s.status === "installed"}>
                {badge.label}
              </Badge>
              <div className="flex items-center gap-2">
                {s.status !== "not-installed" && (
                  <ConfirmButton size="sm" variant="ghost" confirmLabel="Kaldırılsın mı?" disabled={Boolean(state)} onConfirm={() => run(s.id, "remove")}>
                    Kaldır
                  </ConfirmButton>
                )}
                {s.status !== "installed" && (
                  <Button size="sm" variant={s.status === "outdated" ? "outline" : "solid"} loading={state === "install"} disabled={Boolean(state)} onClick={() => run(s.id, "install")}>
                    {s.status === "outdated" ? "Güncelle" : "Kur"}
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { ScriptInstaller, type ScriptInstallerProps, type ScriptStatus, type Storefront }
