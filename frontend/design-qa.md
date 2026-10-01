# Landing Page Design QA

## Evidence

- Reference: `C:\Users\USER\.codex\generated_images\01a05b75-a7d1-74e1-9bbf-762cb2da6289\exec-be82ca4c-df12-4aa9-9b63-3174ac2c992d.png`
- Implementation: `http://127.0.0.1:3000/` in the Codex in-app browser
- Reference viewport: 1440 × 1024 px
- Implementation desktop viewport: 1440 × 1024 CSS px, DPR 1
- Responsive viewports: 768 × 1024 and 390 × 844 CSS px, DPR 1
- State: logged out, reduced-motion preference enabled

## Full-page comparison

The implementation preserves the selected editorial composition: wide warm-white canvas, left-aligned serif statement, oversized black garment image, floating size/match card, compact blue CTA, and a three-step explanation beginning at the lower fold. Header height, hero-to-process transition, content order, and the dominant image/text balance closely match the reference.

Intentional content differences are limited to Korean product copy and the repository's real `cloth7.jpg` product asset. These keep the design direction while making the page coherent with the existing application.

## Focused comparison

- Typography: display serif scale, tight letter spacing, line height, and supporting sans-serif hierarchy match the reference intent. Korean line breaks remain semantic at desktop, tablet, and mobile widths.
- Layout and spacing: desktop hero columns, result-card position, CTA grouping, and process-section grid align with the reference. The tablet header collapses before labels can wrap.
- Color and surfaces: warm off-white background, near-black ink, restrained gray rules, blue accent, subtle result-card border, and shadow are consistent with the reference.
- Imagery: a real product photograph is used with an editorial crop and blend treatment; no placeholder illustration, custom SVG, or CSS art is used.
- Responsiveness: no horizontal overflow was observed at 1440, 768, or 390 px. The hero stacks cleanly below 820 px, and process steps collapse to one column on mobile.
- Accessibility: semantic heading order, alt text, labeled navigation, real button/link controls, visible keyboard focus, reduced-motion handling, and practical mobile tap targets are present.

## Findings and fixes

1. **P1 — Hydration mismatch in entrance motion (resolved).** Server and client selected different `initial` values when reduced motion was enabled. Initial render values are now stable, while duration and delay adapt to the user's preference.
2. **P1 — Tablet header wrapping (resolved).** At 768 px, the logo and navigation labels wrapped. Landing navigation now collapses below 900 px, and the logo/actions are non-shrinking.
3. **P2 — Mobile headline word break (resolved).** `사이즈` could split mid-word. `word-break: keep-all` and a smaller mobile type scale preserve readable wrapping.
4. **P2 — Missing explicit CTA focus treatment (resolved).** Primary and secondary hero actions now have a high-visibility `:focus-visible` outline.
5. **P2 — Scroll-motion container warning (resolved).** The unnecessary scroll-target parallax was removed while entrance, reveal, hover, and progress animations were retained.

## Verification

- Production build: passed (`next build`, 13 routes generated)
- Production console: 0 warnings, 0 errors
- Keyboard order: Project S → Home → How It Works → Products → About → Log in → Find my fit → 내 사이즈 찾기 → 추천 방식 보기
- Interaction: `추천 방식 보기` moves to `#how-it-works`
- Interaction: `내 사이즈 찾기` routes to `/profile`
- Open P0/P1/P2 findings: none

## Iteration history

- Pass 1: implemented the selected editorial landing direction using the existing product asset and localized copy.
- Pass 2: corrected hydration behavior, removed the scroll warning, improved mobile line breaking, and added focus visibility.
- Pass 3: corrected the tablet header breakpoint and rechecked desktop/tablet/mobile layouts.
- Pass 4: rebuilt without a concurrent dev server and verified the production runtime, console, focus order, and primary navigation paths.

final result: passed

---

# Recommendation Result Page Design QA

## Evidence

- Reference: `C:\Users\USER\.codex\generated_images\01a05b75-a7d1-74e1-9bbf-762cb2da6289\exec-215b18fa-b0d6-451b-9ac5-d4bb46947435.png`
- Implementation: `http://127.0.0.1:3000/result` in the Codex in-app browser
- Same-input comparison artifact: `C:\Users\USER\.codex\visualizations\2026\09\01\01a05b75-a7d1-74e1-9bbf-762cb2da6289\result-comparison.html`
- Reference and implementation viewport: 1440 × 1024 CSS px, DPR 1
- Responsive viewport: 390 × 844 CSS px, DPR 1
- State: representative completed recommendation, logged-out header, reduced-motion preference enabled

## Full-page comparison

The implementation matches the selected option's editorial split layout: equal-width product and analysis panels, oversized serif product title, large real product photograph, dominant recommended-size letter, match score and accent progress bar, three measurement rows, recommendation reason, feedback controls, and primary/secondary actions. The desktop page fits the 1440 × 1024 viewport without horizontal or vertical overflow.

Intentional differences are localized Korean explanatory copy, the repository's real product asset, and the logged-out header state. These preserve the visual direction while keeping the screen coherent with the application's live data and authentication state.

## Focused comparison

- Typography: editorial serif display type and compact sans-serif labels preserve the reference hierarchy; numeric size and match score remain the dominant analysis elements.
- Layout and spacing: the 50:50 split, vertical divider, asymmetric analysis padding, measurement-row density, and bottom actions closely match the reference crop.
- Color and surfaces: warm-white base, near-black typography, blue size/CTA accent, lime match bar, and hairline dividers reproduce the selected direction without generic rounded cards.
- Imagery: the live product image is used directly with an editorial crop; no placeholder, custom SVG, or CSS-drawn replacement is present.
- Responsiveness: desktop has no overflow and mobile stacks product and analysis panels without horizontal overflow; long Korean copy wraps without collisions.
- States and interactions: three feedback choices expose pressed state and save through the real feedback API outside demo mode; product and history actions use real routes.
- Accessibility: semantic headings and sections, alt text, labeled measurement tracks, real buttons/links, pressed state, disabled pending state, keyboard focus styles, and reduced-motion handling are present.

## Findings and fixes

1. **P1 — Bottom actions exceeded the reference fold (resolved).** Product-image crop and right-panel vertical rhythm were tightened so all result content fits the 1024 px desktop canvas.
2. **P2 — Global footer added unintended result-page scroll (resolved).** The shared footer is suppressed only on `/result`, matching the full-height editorial composition.
3. **P2 — Analysis content sat too far left and felt denser than the reference (resolved).** Analysis padding, score columns, and measurement-row heights were adjusted against the same-input comparison.
4. **P2 — Mobile split layout did not preserve hierarchy (resolved).** The panels now stack, typography scales down, controls remain tappable, and the page stays free of horizontal overflow at 390 px.
5. **P2 — Feedback could replace detailed result data after saving (resolved).** The updated feedback value is merged into the existing recommendation record so comparison rows remain intact.

## Verification

- Production build: passed (`next build`, 13 routes generated)
- Desktop geometry: 1440 × 1024 viewport, 1440 px document width, 1024 px document height
- Mobile geometry: 390 × 844 viewport, no horizontal overflow
- Interaction: feedback selection exposes `aria-pressed="true"` and a status message
- Interaction: primary action routes to `/products`; secondary action routes to `/history`
- Console: 0 errors; reduced-motion development notice only during the design preview
- Open P0/P1/P2 findings: none

## Iteration history

- Pass 1: implemented the selected result-page direction with real application data and assets.
- Pass 2: corrected full-height composition, image crop, global footer behavior, and right-panel density.
- Pass 3: validated desktop and mobile geometry, feedback behavior, links, and accessibility state.
- Pass 4: removed all design-preview data and passed the final production build against the real sequential flow.

final result: passed
