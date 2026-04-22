## 2025-05-22 - [Accessibility in Dashboard Lists and Progress Bars]
**Learning:** Icon-only buttons and visual-only progress bars are common accessibility gaps in this dashboard. Screen readers need explicit labels for actions and numeric roles for visual bars to properly interpret the UI state.
**Action:** Always add `aria-label` to icon buttons and `role="progressbar"` with `aria-valuenow` to any custom progress indicator.
