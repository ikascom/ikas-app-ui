---
"ikas-app-ui": minor
---

`@ikas/tooltip` in the ikas style: no arrow, 6px from the trigger, a `shortcut` prop that renders a `Kbd`. `TooltipProvider` now waits 400ms for the first tooltip and opens neighbours at once; neighbours and keyboard focus open without motion and replace the previous bubble instantly. Enter is 125ms on `--ease-reveal`, exit a 100ms fade; reduced motion keeps only the fade. Adds toolbar, states and sides demos.
