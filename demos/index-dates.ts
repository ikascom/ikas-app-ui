import type * as React from "react"

import CalendarDisabledDays from "./calendar/disabled-days"
import CalendarRange from "./calendar/range"
import CalendarSingle from "./calendar/single"
import DatePickerMinMax from "./date-picker/min-max"
import DatePickerSimple from "./date-picker/simple"
import DateRangePickerForm from "./date-range-picker/form"
import DateRangePickerPresets from "./date-range-picker/presets"

export const dateDemos = {
  "calendar/single": CalendarSingle,
  "calendar/range": CalendarRange,
  "calendar/disabled-days": CalendarDisabledDays,
  "date-picker/simple": DatePickerSimple,
  "date-picker/min-max": DatePickerMinMax,
  "date-range-picker/presets": DateRangePickerPresets,
  "date-range-picker/form": DateRangePickerForm,
} satisfies Record<string, () => React.ReactNode>
