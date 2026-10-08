"use client"

import { ScriptInstaller } from "@/components/ikas/script-installer"
import { storefronts } from "@/demos/_data"

/** A localhost script URL triggers the "not reachable from the storefront" warning. */
export default function ScriptInstallerLocalhost() {
  return (
    <ScriptInstaller
      className="w-full max-w-xl"
      scriptUrl="http://localhost/widget.js"
      storefronts={[{ ...storefronts[0], status: "not-installed" }]}
      onInstall={() => {}}
      onRemove={() => {}}
    />
  )
}
