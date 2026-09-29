---
name: Masal Cards OS
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-telemetry:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a mission-critical telecom inventory and digital pin/card distribution operating system. Designed for high-volume telco operations, merchant aggregators, and national infrastructure operators, the UI conveys sovereign-grade reliability, ultra-low latency, and precision control.

The aesthetic fuses precision enterprise architecture with hyper-refined glassmorphism. It rejects kitschy decorative blurs in favor of structural optical depth: multi-layered frosted glass plates, luminous edge reflections, and tactile digital cards that simulate high-security holographic smart cards. The interface balances ultra-dense operational telemetry with visual poise, ensuring operators can manage multi-million-unit inventory batches and real-time distribution rails without cognitive fatigue.

## Colors

The system uses a calibrated chromatic hierarchy engineered for both deep obsidian night-ops environments and sunlit frosted-pearl terminal conditions.

### Dark Mode (Default)
- **Base Canvas:** Obsidian Slate (`#0B0F19`), anchoring the viewport.
- **Glass Base Panels:** `#0F172A` at 65% opacity with `backdrop-filter: blur(16px)`.
- **Raised Interactive Glass:** `#1E293B` at 45% opacity with subtle light refraction.
- **Primary Accent:** Electric Sapphire (`#3B82F6` resting, `#2563EB` active/hover), deployed for primary telemetry metrics, focused states, and key transactional triggers.
- **System States:**
  - Success / Live Sync: Emerald (`#10B981`)
  - Warning / Depleting Threshold: Amber (`#F59E0B`)
  - Critical / Failed PIN Batch / Tamper: Crimson (`#EF4444`)
- **Borders & Rim Lighting:** `rgba(255, 255, 255, 0.08)` to `rgba(59, 130, 246, 0.35)` on hover.

### Light Mode
- **Base Canvas:** Crisp Frosted Pearl (`#F8FAFC`).
- **Glass Base Panels:** `#FFFFFF` at 70% opacity with `backdrop-filter: blur(20px)`.
- **Raised Interactive Glass:** `#F1F5F9` at 85% opacity.
- **Primary Accent:** Deep Sapphire (`#2563EB`).
- **Borders & Rim Lighting:** `rgba(15, 23, 42, 0.08)` with dynamic directional inner shadows.

## Typography

The type system is optimized for internationalized fintech operations with seamless Latin and Arabic parity. While Inter forms the core structural shell, pairing it with Arabic fallback fonts (`Cairo`, `Tajawal`) provides unified baseline alignment, matching x-heights, and identical stroke contrast across RTL and LTR viewports.

Numeric telemetry, batch tokens, ICCID numbers, encryption hashes, and live inventory counts are strictly assigned to `JetBrains Mono` with tabular numerals (`tnum`) activated to eliminate horizontal jitter during live streaming mutations. All uppercase telemetry metadata labels use wide letter spacing (`letterSpacing: 0.06em`) for readability at microscopic scales.

## Layout & Spacing

The system runs on a 12-column adaptive fluid grid supported by an exact 4px mathematical baseline. High density is prioritized: margins and paddings are compressed compared to traditional web applications to allow dense tables, interactive card arrays, and health gauges to co-exist above the fold.

- **Desktop (1440px+):** 12 columns, 24px gutters, 32px canvas margins. Side utility panels snap to fixed 320px/380px glass sheets.
- **Tablet / Small Desktop (1024px - 1439px):** 12 columns, 20px gutters, 24px margins. Peripheral distribution analytics collapse into swipeable stacked glass drawers.
- **Mobile / Compact (Below 1024px):** 4 columns, 16px gutters, 16px margins. Telemetry cards reorder into single-column vertical cards with horizontal micro-scrollers for real-time tickers.

## Elevation & Depth

Visual hierarchy uses physical depth through refraction, blur strength, and perimeter rim lighting rather than muddy drop shadows.

- **Layer 0 (Canvas):** Pure dark substrate (`#0B0F19`) or luminous light base (`#F8FAFC`). No blur.
- **Layer 1 (Structural Shell):** App bars, persistent side rails, grouped container shells. `backdrop-filter: blur(16px)`; border: 1px solid `rgba(255, 255, 255, 0.06)`.
- **Layer 2 (Content & Analytics Cards):** `backdrop-filter: blur(24px)`; fill: `rgba(30, 41, 59, 0.5)`; border: 1px solid `rgba(255, 255, 255, 0.1)`. Highlighted by a directional linear gradient overlay across the top edge simulating overhead incident light (`linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)`).
- **Layer 3 (Floating Modals & Pin Inspection Drawers):** `backdrop-filter: blur(32px)`; fill: `rgba(15, 23, 42, 0.85)`; ambient shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.5)`. Rim lighting glows via an inner stroke tinted with Sapphire Blue: `inset 0 1px 0 0 rgba(59, 130, 246, 0.4)`.

## Shapes

The interface balances sharp industrial precision with ergonomic touch surfaces. Outer card containers feature `rounded-lg` (16px) curves to soften high-density dashboard layouts, while inner components (data grid cells, metric chips, action buttons) use `rounded` (8px). 

Digital telecommunication card replicas adhere to the canonical credit-card aspect ratio (1.586:1) with a continuous, precision curvature that mimics physical PVC/eSIM blister packs.

## Components

### Action Triggers & Buttons
- **Primary Action:** Solid Electric Sapphire (`#2563EB`) background, high-contrast white text, layered with an internal top-lit specular glass edge (`inset 0 1px 0 rgba(255, 255, 255, 0.3)`). Hover activates an outer 12px diffuse sapphire glow (`rgba(37, 99, 235, 0.45)`).
- **Glass / Secondary Action:** Frosted translucent plate (`rgba(255, 255, 255, 0.05)`), border: 1px solid `rgba(255, 255, 255, 0.15)`. Hover induces a 10% brightness increase and lifts the element by 1px.
- **Destructive Action:** Low-alpha Crimson fill (`rgba(239, 68, 68, 0.15)`), solid crimson border, dynamic red aura on engagement.

### Digital Voucher & eSIM Cards
- Physical-digital hybrid design. Surfaces incorporate a subtle diagonal micro-mesh pattern with a reactive glass sheen that shifts based on pointer location. 
- Displays operator badges (e.g., STC, Zain, Ooredoo), monetary face value in prominent display numerals, remaining inventory counters, and dynamic QR/PIN scratch zones with obfuscated states (`•••• ••••`).

### Batch Health Telemetry & Live Counters
- Compact inline telemetry blocks. Includes a live status pulse dot: 6px radial circle surrounded by an infinite expanding CSS ping wave in `#10B981` (Nominal), `#F59E0B` (Syncing / High-Load), or `#EF4444` (Depleted / Error).
- Throughput counters use `mono-telemetry` styling with instant ticker transition animations when counts increment.

### Data Inputs & Search
- Low-contrast recessed glass fields (`rgba(0, 0, 0, 0.2)` in dark mode). 
- Active focus smoothly morphs the border into a 1px Sapphire beam with a subtle inner blue illumination, stripping away harsh browser focus rings. Integrated trailing shortcuts (e.g., `⌘K`) are rendered in micro-caps chips.

### Status Chips & Tag Pills
- Ultra-compact pills with semi-translucent fills (12% opacity of the respective semantic color) and solid borders (25% opacity). Text is rendered in `label-caps` typography to provide instant visual scanning across dense tabular reports.