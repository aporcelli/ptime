## 2025-05-16 - Handling Loading States in @react-pdf/renderer
**Learning:** `PDFDownloadLink` from `@react-pdf/renderer` renders an anchor tag (`<a>`) which does not support the HTML `disabled` attribute. Applying `disabled:` Tailwind variants directly to it or its children will not work as expected.
**Action:** To implement a loading state for PDF generation, wrap the content in a nested element (like a `span`) and apply conditional styling (e.g., `opacity-50`, `pointer-events-none`, `cursor-not-allowed`) based on the `loading` render prop provided by `PDFDownloadLink`.
