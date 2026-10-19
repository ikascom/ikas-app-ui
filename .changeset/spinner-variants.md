---
"ikas-app-ui": minor
---

`@ikas/spinner`: add a `variant` prop with 16 indicators in five families: rotating (`default`, `ring`, `spokes`, `comet`, `dual`), dots (`dots`, `bounce`, `grid`), bars (`bars`, `wave`), pulse (`ripple`, `ping`, `orbit`) and shapes (`infinity`, `morph`, `cradle`). Every variant stays a 24×24 `currentColor` SVG, so `className="size-*"` and text colors work as before, and `default` keeps the open arc. Their keyframes and `animate-spinner-*` utilities ship with `@ikas/theme`; `--spinner-speed` scales the timing and reduced motion slows spinners down instead of stopping them. One demo per family, each with a preview-only color picker that shows the variants take any text color.
