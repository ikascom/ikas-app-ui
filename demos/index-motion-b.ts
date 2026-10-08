import type * as React from "react"

import ActionBarReport from "./action-bar/report"
import ConfirmButtonCancel from "./confirm-button/cancel"
import ConfirmButtonRow from "./confirm-button/row"
import ExpandableSearchToolbar from "./expandable-search/toolbar"
import IconMotionCopyCheck from "./icon-motion/copy-check"
import IconMotionGallery from "./icon-motion/gallery"
import IconMotionStagger from "./icon-motion/stagger"

export const motionDemosB = {
  "action-bar/report": ActionBarReport,
  "confirm-button/cancel": ConfirmButtonCancel,
  "confirm-button/row": ConfirmButtonRow,
  "expandable-search/toolbar": ExpandableSearchToolbar,
  "icon-motion/copy-check": IconMotionCopyCheck,
  "icon-motion/gallery": IconMotionGallery,
  "icon-motion/stagger": IconMotionStagger,
} satisfies Record<string, () => React.ReactNode>
