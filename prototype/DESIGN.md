# Design System: Luxury Noir (Vault)

> Category: Institutional Crypto & Private Wealth
> A digital vault experience designed for high-net-worth individuals. Deep obsidian surfaces with champagne gold and silver accents.

## 1. Visual Theme & Atmosphere

The "Luxury Noir" theme balances Coinbase's institutional trust with the exclusivity of private banking. It uses a near-black foundation to eliminate visual noise, allowing the user's capital and performance data to remain the primary focus. High-contrast negative space and hairline borders create a sense of precision and "weight."

**Key Characteristics:**
- **Obsidian Foundation**: Deep, matte black surfaces (`oklch(12% 0.01 250)`).
- **Champagne Accents**: Refined gold highlights (`oklch(85% 0.02 80)`) used sparingly for critical actions and brand markers.
- **Glass Morphism**: Subtle backdrop blurs and semi-transparent surfaces for secondary overlays.
- **Dual-Font System**: Serif for narrative/editorial impact; Sans-serif for high-density data.
- **Zero-Radius Posture**: Sharp, 0px corners on primary containers to signal structural rigidity and security.

## 2. Color Palette (OKLch)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `oklch(12% 0.01 250)` | Primary background (Obsidian) |
| `--surface` | `oklch(18% 0.015 250)` | Secondary containers / glass backgrounds |
| `--fg` | `oklch(98% 0.005 250)` | Primary text (Pure Off-white) |
| `--muted` | `oklch(50% 0.01 250)` | Secondary text / Captions / Labels |
| `--border` | `oklch(25% 0.01 250)` | Hairline borders (0.5px) |
| `--accent` | `oklch(85% 0.02 80)` | Primary brand accent (Champagne Gold) |
| `--accent-glow` | `oklch(85% 0.02 80 / 15%)` | Soft glow / Hover states |

## 3. Typography Rules

### Font Families
- **Display**: `'Cormorant Garamond', serif` — Hero headlines, editorial pull quotes.
- **UI / Body**: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif` — Navigation, data, standard reading.
- **Data / Mono**: `'JetBrains Mono', monospace` — Tickers, balances, transaction hashes.

### Hierarchy

| Role | Font | Size | Weight | Tracking | Notes |
|------|------|------|--------|----------|-------|
| Hero Title | Display | 64px–80px | 300 | -0.01em | Maximum editorial impact |
| Section Header | Display | 32px–42px | 400 | 0 | Clean section breaks |
| UI Header | Body | 14px | 600 | 0.05em | Nav/Sidebar headers |
| Data Primary | Mono | 24px | 500 | -0.02em | Large account balances |
| Body Standard | Body | 16px | 400 | 0 | Prose reading |
| Label | Mono | 10px | 400 | 0.2em | Kicker / Eyebrow (Uppercase) |

## 4. Component Stylings

### Buttons

**Primary (The "Vault" Button)**
- **Background**: Transparent
- **Border**: `1.5px solid var(--accent)`
- **Text**: `var(--accent)`
- **Radius**: 0px
- **Hover**: Background `var(--accent)`, Text `var(--bg)`

**Secondary (Ghost)**
- **Border**: `0.5px solid var(--border)`
- **Text**: `var(--fg)`
- **Hover**: Background `var(--surface)`

### Cards & Containers
- **Border**: `0.5px solid var(--border)`
- **Radius**: 0px (Primary) or 4px (Internal UI elements)
- **Shadow**: `0 20px 40px rgba(0,0,0,0.5)` (Subtle elevation only)

## 5. Layout & Spacing

### Spacing Scale
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`

### Principles
- **Asymmetric Grid**: Use 70/30 splits for dashboards to separate execution from intelligence.
- **Negative Space**: Ensure at least 64px padding on landing sections.
- **Hairlines**: Always use `0.5px` borders for a "technical drawing" feel.

## 6. Icons & Visuals

- **Icons**: Use minimalist line-art (Lucide style) with `stroke-width: 1.2`.
- **Charts**: OKLch-defined gradients. Always use "Champagne" for positive performance.
- **Images**: High-contrast black and white photography or abstract 3D renders.

## 7. Interactive Feedback

- **Transitions**: `300ms cubic-bezier(0.4, 0, 0.2, 1)` for all transforms.
- **Glow**: Use soft box-shadows with the `--accent-glow` token for active status indicators.
