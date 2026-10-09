import type * as React from "react"

import CalendarDisabledDays from "./calendar/disabled-days"
import CalendarRange from "./calendar/range"
import CalendarSingle from "./calendar/single"
import DatePickerMinMax from "./date-picker/min-max"
import DatePickerSimple from "./date-picker/simple"
import DateRangePickerForm from "./date-range-picker/form"
import DateRangePickerPresets from "./date-range-picker/presets"
import DateWheelPickerDrawer from "./date-wheel-picker/drawer"
import DateWheelPickerMinMax from "./date-wheel-picker/min-max"
import DateWheelPickerSimple from "./date-wheel-picker/simple"
import WheelPickerBasic from "./wheel-picker/basic"
import WheelPickerTime from "./wheel-picker/time"

export const dateDemos = {
  "calendar/single": CalendarSingle,
  "calendar/range": CalendarRange,
  "calendar/disabled-days": CalendarDisabledDays,
  "date-picker/simple": DatePickerSimple,
  "date-picker/min-max": DatePickerMinMax,
  "date-range-picker/presets": DateRangePickerPresets,
  "date-range-picker/form": DateRangePickerForm,
  "wheel-picker/basic": WheelPickerBasic,
  "wheel-picker/time": WheelPickerTime,
  "date-wheel-picker/simple": DateWheelPickerSimple,
  "date-wheel-picker/min-max": DateWheelPickerMinMax,
  "date-wheel-picker/drawer": DateWheelPickerDrawer,
} satisfies Record<string, () => React.ReactNode>
