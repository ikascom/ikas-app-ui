"use client"

import * as React from "react"
import { toast } from "sonner"

import { ScriptInstaller, type Storefront } from "@/components/ikas/script-installer"
import { storefronts as storeStorefronts, widgetScriptUrl } from "@/demos/_data"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ScriptInstallerStorefronts() {
  const [storefronts, setStorefronts] = React.useState<Storefront[]>(() => {
    const status: Storefront["status"][] = ["installed", "outdated", "not-installed"]
    return storeStorefronts.map((s, i) => ({ ...s, status: status[i] }))
  })
  const setStatus = (id: string, status: Storefront["status"]) => setStorefronts((list) => list.map((s) => (s.id === id ? { ...s, status } : s)))

  return (
    <ScriptInstaller
      className="w-full max-w-xl"
      scriptUrl={widgetScriptUrl}
      storefronts={storefronts}
      onInstall={async (id) => {
        await wait(1200)
        setStatus(id, "installed")
        toast.success("Script kuruldu")
      }}
      onRemove={async (id) => {
        await wait(800)
        setStatus(id, "not-installed")
        toast.success("Script kaldırıldı")
      }}
    />
  )
}
