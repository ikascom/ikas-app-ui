import type * as React from "react"

import ScriptInstallerLocalhost from "./script-installer/localhost"
import ScriptInstallerStorefronts from "./script-installer/storefronts"
import SetupGuideFirstRun from "./setup-guide/first-run"
import ToggleSectionModules from "./toggle-section/modules"

export const patternDemos = {
  "toggle-section/modules": ToggleSectionModules,
  "setup-guide/first-run": SetupGuideFirstRun,
  "script-installer/storefronts": ScriptInstallerStorefronts,
  "script-installer/localhost": ScriptInstallerLocalhost,
} satisfies Record<string, () => React.ReactNode>
