# Color Palette — CapexIQ

Based on spec section 25.2–25.3: white/off-white base, soft borders, minimal shadows,
restrained semantic color coding. Not a generic SaaS palette — desaturated, serious tones,
not neon or gradient-heavy.

## Base / Neutral

| Token              | Hex       | Use                                          |
|---------------------|-----------|-----------------------------------------------|
| `bg-primary`         | `#FFFFFF` | Main page background                         |
| `bg-secondary`       | `#F7F7F5` | Section backgrounds, card backgrounds (off-white) |
| `bg-tertiary`        | `#F0F0EE` | Table stripes, subtle panel backgrounds      |
| `border-subtle`      | `#E6E4E0` | Card borders, dividers (soft, not harsh gray)|
| `border-default`     | `#D8D6D1` | Input borders, table borders                 |
| `text-primary`       | `#1C1C1A` | Headings, primary body text (near-black, warm) |
| `text-secondary`     | `#5C5B57` | Secondary text, labels, captions             |
| `text-muted`         | `#8A8883` | Placeholder text, disabled state             |

## Semantic — Investment Outlook / Status

Each has a strong (icon/text) and a light (background tint) variant.

| Meaning              | Strong (text/icon) | Light (bg tint) | Notes                          |
|----------------------|---------------------|------------------|----------------------------------|
| Strong / Viable      | `#0F7B4D`           | `#E9F6EF`        | Desaturated green, not neon      |
| Moderate / Caution    | `#B7791F`           | `#FBF1E1`        | Muted amber/ochre, not bright yellow |
| Weak / Risk          | `#B23B3B`           | `#FBEAEA`        | Muted brick red, not fire-engine red |
| Neutral / Informational | `#3E5C76`         | `#EAF0F5`        | Slate blue-gray                  |

## Brand / Accent (optional, used sparingly)

| Token          | Hex       | Use                                    |
|----------------|-----------|------------------------------------------|
| `accent-navy`  | `#1E2A3A` | Header bar, primary buttons, logo mark   |
| `accent-navy-hover` | `#152030` | Button hover state                  |

## Data visualization (charts)

Use the semantic strong colors above for outlook-linked series (surplus=green, risk=red).
For neutral multi-series charts (billed vs. realized vs. cash), use this sequence so it
stays legible in both color and grayscale print:

1. `#1E2A3A` (navy — billed revenue)
2. `#3E5C76` (slate — realized revenue)
3. `#0F7B4D` (green — cash received / surplus)
4. `#B7791F` (amber — cost / EMI)
5. `#8A8883` (gray — reference/benchmark lines)

## Usage notes

- Background stays white/off-white at all times — color is reserved for status and data, never decoration.
- Shadows: use a single soft shadow, e.g. `0 1px 2px rgba(28,28,26,0.06)`, never stacked/glow shadows.
- Never use pure black (`#000000`) or pure gray-scale grays — everything here has a slight warm undertone to avoid the cold "generic SaaS" look the spec warns against (section 25.1).
- Pair with IBM Plex Mono for any numeric/tabular value so financial figures read as precise, not decorative.

See `tokens.css` in this folder for a ready-to-import CSS custom properties file.
