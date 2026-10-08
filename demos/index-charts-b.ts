import type * as React from "react"

import BarChartGlow from "./bar-chart/glow"
import BarChartHorizontal from "./bar-chart/horizontal"
import BarChartHoverTrace from "./bar-chart/hover-trace"
import BarChartIncomplete from "./bar-chart/incomplete"
import BarChartLoading from "./bar-chart/loading"
import BarChartStacked from "./bar-chart/stacked"
import BarChartVariants from "./bar-chart/variants"
import BarListTopProducts from "./bar-list/top-products"
import BarListTraffic from "./bar-list/traffic"

export const chartDemosB = {
  "bar-chart/hover-trace": BarChartHoverTrace,
  "bar-chart/variants": BarChartVariants,
  "bar-chart/stacked": BarChartStacked,
  "bar-chart/horizontal": BarChartHorizontal,
  "bar-chart/loading": BarChartLoading,
  "bar-chart/incomplete": BarChartIncomplete,
  "bar-chart/glow": BarChartGlow,
  "bar-list/top-products": BarListTopProducts,
  "bar-list/traffic": BarListTraffic,
} satisfies Record<string, () => React.ReactNode>
