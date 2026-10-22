import type * as React from "react"

import ProgressBarBasic from "./progress-bar/basic"
import ProgressBarIndeterminate from "./progress-bar/indeterminate"
import ProgressBarSegments from "./progress-bar/segments"
import StepsCompact from "./steps/compact"
import StepsHorizontal from "./steps/horizontal"
import StepsMarkers from "./steps/markers"
import StepsVertical from "./steps/vertical"

export const progressDemos = {
  "progress-bar/basic": ProgressBarBasic,
  "progress-bar/indeterminate": ProgressBarIndeterminate,
  "progress-bar/segments": ProgressBarSegments,
  "steps/horizontal": StepsHorizontal,
  "steps/vertical": StepsVertical,
  "steps/compact": StepsCompact,
  "steps/markers": StepsMarkers,
} satisfies Record<string, () => React.ReactNode>
