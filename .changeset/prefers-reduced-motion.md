---
"ikas-app-ui": patch
---

`@ikas/motion`: `usePrefersReducedMotion`, the reduced-motion setting followed live (motion/react's `useReducedMotion` keeps its first value). `AnimatedBadge`, `FeatureGate` and `ColorPicker` use it instead of their own copies.
