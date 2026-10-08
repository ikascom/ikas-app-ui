import type * as React from "react"

import { motionDemosA } from "./index-motion-a"
import { motionDemosB } from "./index-motion-b"
import { chartDemosA } from "./index-charts-a"
import { chartDemosB } from "./index-charts-b"
import { chartDemosC } from "./index-charts-c"
import { patternDemos } from "./index-patterns"

import BadgeVariants from "./badge/variants"
import BadgeColors from "./badge/colors"
import BadgeOrderStatuses from "./badge/order-statuses"
import BadgeStatuses from "./badge/statuses"
import BannerSurface from "./banner/surface"
import BannerStatuses from "./banner/statuses"
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
import EmptyStateError from "./empty-state/error"
import EmptyStatePage from "./empty-state/page"
import EmptyStateSection from "./empty-state/section"
import FormControls from "./form/controls"
import FormField from "./form/field"
import FormInputGroup from "./form/input-group"
import LayoutSettingsGroup from "./layout/settings-group"
import LayoutMainAside from "./layout/main-aside"
import PageHeaderDemo from "./page/header"
import PageSimple from "./page/simple"
import RecordTableError from "./record-table/error"
import RecordTableOrders from "./record-table/orders"
import RecordTableStates from "./record-table/states"
import UnsavedBarSettingsForm from "./unsaved-bar/settings-form"
import SettingRowList from "./setting-row/list"
import StatCardRow from "./stat-card/row"
import ToastActions from "./toast/actions"
import ToastPreview from "./toast/preview"
import ToastProgress from "./toast/progress"
import ToastSoft from "./toast/soft"
import ToastTypes from "./toast/types"

export const demos = {
  ...motionDemosA,
  ...motionDemosB,
  ...chartDemosA,
  ...chartDemosB,
  ...chartDemosC,
  ...patternDemos,
  "badge/variants": BadgeVariants,
  "badge/colors": BadgeColors,
  "badge/order-statuses": BadgeOrderStatuses,
  "badge/statuses": BadgeStatuses,
  "banner/surface": BannerSurface,
  "banner/statuses": BannerStatuses,
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
  "empty-state/error": EmptyStateError,
  "empty-state/page": EmptyStatePage,
  "empty-state/section": EmptyStateSection,
  "form/controls": FormControls,
  "form/field": FormField,
  "form/input-group": FormInputGroup,
  "layout/settings-group": LayoutSettingsGroup,
  "layout/main-aside": LayoutMainAside,
  "page/header": PageHeaderDemo,
  "page/simple": PageSimple,
  "record-table/error": RecordTableError,
  "record-table/orders": RecordTableOrders,
  "record-table/states": RecordTableStates,
  "unsaved-bar/settings-form": UnsavedBarSettingsForm,
  "setting-row/list": SettingRowList,
  "stat-card/row": StatCardRow,
  "toast/actions": ToastActions,
  "toast/preview": ToastPreview,
  "toast/progress": ToastProgress,
  "toast/soft": ToastSoft,
  "toast/types": ToastTypes,
} satisfies Record<string, () => React.ReactNode>

export type DemoId = keyof typeof demos
