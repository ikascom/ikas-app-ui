import type * as React from "react"

import ChartCardDonut from "./chart-card/donut"
import ChartCardRevenue from "./chart-card/revenue"
import DonutChartChannels from "./donut-chart/channels"
import DonutChartPayments from "./donut-chart/payments"
import MeterLimits from "./meter/limits"
import MeterRadial from "./meter/radial"

export const chartDemosC = {
  "chart-card/revenue": ChartCardRevenue,
  "chart-card/donut": ChartCardDonut,
  "donut-chart/channels": DonutChartChannels,
  "donut-chart/payments": DonutChartPayments,
  "meter/limits": MeterLimits,
  "meter/radial": MeterRadial,
} satisfies Record<string, () => React.ReactNode>
