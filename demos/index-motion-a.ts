import type * as React from "react"

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
  "animated-number/cart-total": AnimatedNumberCartTotal,
  "animated-number/counter": AnimatedNumberCounter,
  "collapse/disclosure": CollapseDisclosure,
  "collapse/switch-section": CollapseSwitchSection,
} satisfies Record<string, () => React.ReactNode>
