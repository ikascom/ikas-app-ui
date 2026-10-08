import type * as React from "react"

import AreaChartCompare from "./area-chart/compare"
import AreaChartExpressive from "./area-chart/expressive"
import AreaChartLive from "./area-chart/live"
import AreaChartLoading from "./area-chart/loading"
import AreaChartRevenue from "./area-chart/revenue"
import AreaChartStacked from "./area-chart/stacked"
import AreaChartStrokes from "./area-chart/strokes"
import AreaChartVariants from "./area-chart/variants"
import SparklineStatCards from "./sparkline/stat-cards"
import SparklineTable from "./sparkline/table"

export const chartDemosA = {
  "area-chart/revenue": AreaChartRevenue,
  "area-chart/compare": AreaChartCompare,
  "area-chart/variants": AreaChartVariants,
  "area-chart/stacked": AreaChartStacked,
  "area-chart/loading": AreaChartLoading,
  "area-chart/expressive": AreaChartExpressive,
  "area-chart/strokes": AreaChartStrokes,
  "area-chart/live": AreaChartLive,
  "sparkline/stat-cards": SparklineStatCards,
  "sparkline/table": SparklineTable,
} satisfies Record<string, () => React.ReactNode>
