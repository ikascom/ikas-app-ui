import type * as React from "react"

import AccordionCard from "./accordion/card"
import AccordionFaq from "./accordion/faq"
import AlertDialogDestructive from "./alert-dialog/destructive"
import AlertDialogSmall from "./alert-dialog/small"
import ButtonGroupInput from "./button-group/input"
import ButtonGroupToolbar from "./button-group/toolbar"
import ComboboxBasic from "./combobox/basic"
import ComboboxMultiple from "./combobox/multiple"
import DrawerActions from "./drawer/actions"
import DrawerForm from "./drawer/form"
import QuestionnaireCard from "./questionnaire/card"
import QuestionnaireOnboarding from "./questionnaire/onboarding"
import RecordTableDataTable from "./record-table/data-table"
import SheetDetail from "./sheet/detail"
import SheetFilters from "./sheet/filters"

export const overlayDemos = {
  "accordion/faq": AccordionFaq,
  "accordion/card": AccordionCard,
  "alert-dialog/destructive": AlertDialogDestructive,
  "alert-dialog/small": AlertDialogSmall,
  "button-group/toolbar": ButtonGroupToolbar,
  "button-group/input": ButtonGroupInput,
  "combobox/basic": ComboboxBasic,
  "combobox/multiple": ComboboxMultiple,
  "drawer/actions": DrawerActions,
  "drawer/form": DrawerForm,
  "questionnaire/onboarding": QuestionnaireOnboarding,
  "questionnaire/card": QuestionnaireCard,
  "record-table/data-table": RecordTableDataTable,
  "sheet/detail": SheetDetail,
  "sheet/filters": SheetFilters,
} satisfies Record<string, () => React.ReactNode>
