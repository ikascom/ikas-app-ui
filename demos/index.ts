import type * as React from "react"

import { motionDemosA } from "./index-motion-a"
import { motionDemosB } from "./index-motion-b"
import { chartDemosA } from "./index-charts-a"
import { chartDemosB } from "./index-charts-b"
import { chartDemosC } from "./index-charts-c"
import { patternDemos } from "./index-patterns"

import BadgeAppearances from "./badge/appearances"
import BadgeColors from "./badge/colors"
import BadgeStatus from "./badge/status"
import BadgeTones from "./badge/tones"
import BannerSurface from "./banner/surface"
import BannerTones from "./banner/tones"
import BannerWithActions from "./banner/with-actions"
import ButtonActions from "./button/actions"
import ButtonColors from "./button/colors"
import ButtonLoading from "./button/loading"
import ButtonSizes from "./button/sizes"
import ButtonVariants from "./button/variants"
import ButtonWithIcon from "./button/with-icon"
import CardBasic from "./card/basic"
import DescriptionListHorizontal from "./description-list/horizontal"
import DescriptionListStacked from "./description-list/stacked"
import EmptyStatePage from "./empty-state/page"
import EmptyStateSection from "./empty-state/section"
import FormControls from "./form/controls"
import FormField from "./form/field"
import FormInputGroup from "./form/input-group"
import LayoutAnnotatedSection from "./layout/annotated-section"
import LayoutMainAside from "./layout/main-aside"
import PageHeaderDemo from "./page/header"
import PageSimple from "./page/simple"
import ResourceTableOrders from "./resource-table/orders"
import ResourceTableStates from "./resource-table/states"
import SaveBarSettingsForm from "./save-bar/settings-form"
import SettingRowList from "./setting-row/list"
import StatCardRow from "./stat-card/row"
import ToastActions from "./toast/actions"
import ToastTones from "./toast/tones"

export const demos = {
  ...motionDemosA,
  ...motionDemosB,
  ...chartDemosA,
  ...chartDemosB,
  ...chartDemosC,
  ...patternDemos,
  "badge/appearances": BadgeAppearances,
  "badge/colors": BadgeColors,
  "badge/status": BadgeStatus,
  "badge/tones": BadgeTones,
  "banner/surface": BannerSurface,
  "banner/tones": BannerTones,
  "banner/with-actions": BannerWithActions,
  "button/actions": ButtonActions,
  "button/colors": ButtonColors,
  "button/loading": ButtonLoading,
  "button/sizes": ButtonSizes,
  "button/variants": ButtonVariants,
  "button/with-icon": ButtonWithIcon,
  "card/basic": CardBasic,
  "description-list/horizontal": DescriptionListHorizontal,
  "description-list/stacked": DescriptionListStacked,
  "empty-state/page": EmptyStatePage,
  "empty-state/section": EmptyStateSection,
  "form/controls": FormControls,
  "form/field": FormField,
  "form/input-group": FormInputGroup,
  "layout/annotated-section": LayoutAnnotatedSection,
  "layout/main-aside": LayoutMainAside,
  "page/header": PageHeaderDemo,
  "page/simple": PageSimple,
  "resource-table/orders": ResourceTableOrders,
  "resource-table/states": ResourceTableStates,
  "save-bar/settings-form": SaveBarSettingsForm,
  "setting-row/list": SettingRowList,
  "stat-card/row": StatCardRow,
  "toast/actions": ToastActions,
  "toast/tones": ToastTones,
} satisfies Record<string, () => React.ReactNode>

export type DemoId = keyof typeof demos
