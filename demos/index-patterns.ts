import type * as React from "react"

import ScriptInstallerLocalhost from "./script-installer/localhost"
import ScriptInstallerStorefronts from "./script-installer/storefronts"
import LaunchpadFirstRun from "./launchpad/first-run"
import LaunchpadStates from "./launchpad/states"
import ToggleSectionModules from "./toggle-section/modules"

export const patternDemos = {
  "toggle-section/modules": ToggleSectionModules,
  "launchpad/first-run": LaunchpadFirstRun,
  "launchpad/states": LaunchpadStates,
  "script-installer/storefronts": ScriptInstallerStorefronts,
  "script-installer/localhost": ScriptInstallerLocalhost,
} satisfies Record<string, () => React.ReactNode>
