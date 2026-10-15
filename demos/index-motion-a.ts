import type * as React from "react"

import AnimatedBadgeCounter from "./animated-badge/counter"
import AnimatedBadgeLive from "./animated-badge/live"
import AnimatedBadgeStatuses from "./animated-badge/statuses"
import AnimatedBadgeSyncList from "./animated-badge/sync-list"
import AnimatedBadgeVariants from "./animated-badge/variants"
import AnimatedNumberCartTotal from "./animated-number/cart-total"
import AnimatedNumberCounter from "./animated-number/counter"
import CollapseDisclosure from "./collapse/disclosure"
import CollapseSwitchSection from "./collapse/switch-section"
import NumberStepperStock from "./number-stepper/stock"
import NumberStepperTableRow from "./number-stepper/table-row"
import SegmentedControlCardHeader from "./segmented-control/card-header"
import SegmentedControlIcons from "./segmented-control/icons"
import SegmentedControlTabs from "./segmented-control/tabs"

export const motionDemosA = {
  "segmented-control/tabs": SegmentedControlTabs,
  "segmented-control/card-header": SegmentedControlCardHeader,
  "segmented-control/icons": SegmentedControlIcons,
  "number-stepper/stock": NumberStepperStock,
  "number-stepper/table-row": NumberStepperTableRow,
  "animated-badge/statuses": AnimatedBadgeStatuses,
  "animated-badge/variants": AnimatedBadgeVariants,
  "animated-badge/sync-list": AnimatedBadgeSyncList,
  "animated-badge/counter": AnimatedBadgeCounter,
  "animated-badge/live": AnimatedBadgeLive,
  "animated-number/cart-total": AnimatedNumberCartTotal,
  "animated-number/counter": AnimatedNumberCounter,
  "collapse/disclosure": CollapseDisclosure,
  "collapse/switch-section": CollapseSwitchSection,
} satisfies Record<string, () => React.ReactNode>
