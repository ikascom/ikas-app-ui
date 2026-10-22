import type * as React from "react"

import ActionBarReport from "./action-bar/report"
import ConfirmButtonCancel from "./confirm-button/cancel"
import ConfirmButtonRow from "./confirm-button/row"
import ExpandableSearchToolbar from "./expandable-search/toolbar"
import IconMotionCopyCheck from "./icon-motion/copy-check"
import IconMotionGallery from "./icon-motion/gallery"
import IconMotionStagger from "./icon-motion/stagger"
import IslandToastBasic from "./island-toast/basic"
import SortableStackTasks from "./sortable-stack/tasks"
import ThemeSwitchToolbar from "./theme-switch/toolbar"
import ThemeSwitchTransitions from "./theme-switch/transitions"

export const motionDemosB = {
  "action-bar/report": ActionBarReport,
  "confirm-button/cancel": ConfirmButtonCancel,
  "confirm-button/row": ConfirmButtonRow,
  "expandable-search/toolbar": ExpandableSearchToolbar,
  "icon-motion/copy-check": IconMotionCopyCheck,
  "icon-motion/gallery": IconMotionGallery,
  "icon-motion/stagger": IconMotionStagger,
  "island-toast/basic": IslandToastBasic,
  "sortable-stack/tasks": SortableStackTasks,
  "theme-switch/toolbar": ThemeSwitchToolbar,
  "theme-switch/transitions": ThemeSwitchTransitions,
} satisfies Record<string, () => React.ReactNode>
