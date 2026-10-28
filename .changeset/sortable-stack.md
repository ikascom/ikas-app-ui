---
"ikas-app-ui": minor
---

`@ikas/sortable-stack`: new. A vertical list reordered by dragging a handle or with the keyboard (↑ ↓ Home End), with one step of undo (`onItemsChange` fires once a drag ends, and after each keyboard move and undo), screen reader announcements and focus kept on the moved row. In ikas styling: Launchpad-style rows, a ghost grip button, an overlay shadow while lifted and `SPRING` from `@/lib/motion` (instant under reduced motion). Demo: a "Bugünkü işler" card; the dashboard example now has it too.

`@ikas/ui-rules`: tell app agents to reach for `SortableStack` when the user sets an order.
