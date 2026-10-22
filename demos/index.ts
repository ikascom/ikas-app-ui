import type * as React from "react"

import { motionDemosA } from "./index-motion-a"
import { motionDemosB } from "./index-motion-b"
import { chartDemosA } from "./index-charts-a"
import { chartDemosB } from "./index-charts-b"
import { chartDemosC } from "./index-charts-c"
import { patternDemos } from "./index-patterns"
import { dateDemos } from "./index-dates"
import { overlayDemos } from "./index-overlays"
import { progressDemos } from "./index-progress"

import BadgeVariants from "./badge/variants"
import BadgeColors from "./badge/colors"
import BadgeOrderStatuses from "./badge/order-statuses"
import BadgeStatuses from "./badge/statuses"
import BannerSurface from "./banner/surface"
import BannerStatuses from "./banner/statuses"
import BannerWithActions from "./banner/with-actions"
import BreadcrumbBasic from "./breadcrumb/basic"
import BreadcrumbCollapsed from "./breadcrumb/collapsed"
import BreadcrumbCustomSeparator from "./breadcrumb/separator"
import BreadcrumbDropdown from "./breadcrumb/dropdown"
import BreadcrumbIcons from "./breadcrumb/icons"
import BreadcrumbInPage from "./breadcrumb/in-page"
import BreadcrumbResponsive from "./breadcrumb/responsive"
import BreadcrumbWithLink from "./breadcrumb/link"
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
import FeatureGateAction from "./feature-gate/action"
import FeatureGateBanner from "./feature-gate/banner"
import FeatureGateColors from "./feature-gate/colors"
import FeatureGateInline from "./feature-gate/inline"
import FeatureGateOverlay from "./feature-gate/overlay"
import FeatureGatePlayground from "./feature-gate/playground"
import FeatureGatePreview from "./feature-gate/preview"
import FeatureGateUnlock from "./feature-gate/unlock"
import FormControls from "./form/controls"
import FormField from "./form/field"
import FormInputGroup from "./form/input-group"
import LayoutSettingsGroup from "./layout/settings-group"
import LayoutMainAside from "./layout/main-aside"
import PageHeaderDemo from "./page/header"
import PageSimple from "./page/simple"
import PageNavBasic from "./page-nav/basic"
import PageNavInPanel from "./page-nav/in-panel"
import PageNavLinks from "./page-nav/links"
import PageNavNested from "./page-nav/nested"
import RecordTableError from "./record-table/error"
import RecordTableOrders from "./record-table/orders"
import RecordTableStates from "./record-table/states"
import UnsavedBarSettingsForm from "./unsaved-bar/settings-form"
import SettingRowList from "./setting-row/list"
import SkeletonBasic from "./skeleton/basic"
import SkeletonCard from "./skeleton/card"
import SkeletonList from "./skeleton/list"
import SkeletonLoading from "./skeleton/loading"
import SkeletonProviderDemo from "./skeleton/provider"
import SpinnerBars from "./spinner/bars"
import SpinnerDots from "./spinner/dots"
import SpinnerPulse from "./spinner/pulse"
import SpinnerRotating from "./spinner/rotating"
import SpinnerShapes from "./spinner/shapes"
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
  ...dateDemos,
  ...overlayDemos,
  ...progressDemos,
  "badge/variants": BadgeVariants,
  "badge/colors": BadgeColors,
  "badge/order-statuses": BadgeOrderStatuses,
  "badge/statuses": BadgeStatuses,
  "banner/surface": BannerSurface,
  "banner/statuses": BannerStatuses,
  "banner/with-actions": BannerWithActions,
  "breadcrumb/basic": BreadcrumbBasic,
  "breadcrumb/separator": BreadcrumbCustomSeparator,
  "breadcrumb/icons": BreadcrumbIcons,
  "breadcrumb/dropdown": BreadcrumbDropdown,
  "breadcrumb/collapsed": BreadcrumbCollapsed,
  "breadcrumb/link": BreadcrumbWithLink,
  "breadcrumb/responsive": BreadcrumbResponsive,
  "breadcrumb/in-page": BreadcrumbInPage,
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
  "feature-gate/overlay": FeatureGateOverlay,
  "feature-gate/preview": FeatureGatePreview,
  "feature-gate/banner": FeatureGateBanner,
  "feature-gate/inline": FeatureGateInline,
  "feature-gate/action": FeatureGateAction,
  "feature-gate/colors": FeatureGateColors,
  "feature-gate/playground": FeatureGatePlayground,
  "feature-gate/unlock": FeatureGateUnlock,
  "form/controls": FormControls,
  "form/field": FormField,
  "form/input-group": FormInputGroup,
  "layout/settings-group": LayoutSettingsGroup,
  "layout/main-aside": LayoutMainAside,
  "page/header": PageHeaderDemo,
  "page/simple": PageSimple,
  "page-nav/basic": PageNavBasic,
  "page-nav/in-panel": PageNavInPanel,
  "page-nav/links": PageNavLinks,
  "page-nav/nested": PageNavNested,
  "record-table/error": RecordTableError,
  "record-table/orders": RecordTableOrders,
  "record-table/states": RecordTableStates,
  "unsaved-bar/settings-form": UnsavedBarSettingsForm,
  "setting-row/list": SettingRowList,
  "skeleton/basic": SkeletonBasic,
  "skeleton/card": SkeletonCard,
  "skeleton/list": SkeletonList,
  "skeleton/loading": SkeletonLoading,
  "skeleton/provider": SkeletonProviderDemo,
  "spinner/rotating": SpinnerRotating,
  "spinner/dots": SpinnerDots,
  "spinner/bars": SpinnerBars,
  "spinner/pulse": SpinnerPulse,
  "spinner/shapes": SpinnerShapes,
  "stat-card/row": StatCardRow,
  "toast/actions": ToastActions,
  "toast/preview": ToastPreview,
  "toast/progress": ToastProgress,
  "toast/soft": ToastSoft,
  "toast/types": ToastTypes,
} satisfies Record<string, () => React.ReactNode>

export type DemoId = keyof typeof demos
