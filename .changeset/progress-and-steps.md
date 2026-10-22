---
"ikas-app-ui": minor
---

Progress and steps, in the motion language of the uiarc progress family and ikas's own motion tokens.

- New `@ikas/progress-bar`: a bar or segments (`segmentType`: skew, block, pill, notch, dot, diamond). One spring drives the fill and the number; the fill slides so its rounded end holds; at the end it turns green and a check draws in (segments turn green as a wave from the left). `indeterminate` travels the track and, when the total arrives, the fill starts where that bar is. Label and hint swap in place.
- New `@ikas/steps`: horizontal, vertical (description and error swap under the current step, with its actions) and compact. Jumps fill the connectors one after another and the current step's halo lands last; changes are announced.
- New `@ikas/step-kit`: `StepMarker` (diamond, circle, square, pill), `StepConnector`, drawn check and alert glyphs, `useStepTravel`, and `StepMarkerProvider` to set the shape once for the app.
- New `@ikas/swap-text`: text that changes in place, rising out of a soft blur.
- `@ikas/launchpad`: `layout="checklist"` (header ring, tickable rows via `onStepToggle`, strike-through, done rows fold into "Tamamlananlar" and the next step opens; once every step is done the card shrinks to its header with "Adımları gör" and the close button) and `layout="timeline"` (the rail with drawn checks, a line that fills down to the next step, struck titles and an animated count), plus `marker` for the node shape and `progressType` for the header progress (ring, bar or any ProgressBar segment type; "ring" in the checklist, "skew" in rail and timeline). The default rail layout looks the same.
- `@ikas/meter`: `RadialMeter variant="gauge"` with `bands` for scores, and `valueFormat` (e.g. "2/5"). The ring no longer shows a dot at zero.
- `@ikas/motion`: `SPRING_EXIT` (closing rows run faster than opening) and `STAGGER`. `@ikas/theme`: `animate-progress-indeterminate`, a soft pulse under reduced motion.
- `@ikas/ui-rules`: when to use Launchpad, Steps, ProgressBar and the gauge, and one StepMarkerProvider per app.
