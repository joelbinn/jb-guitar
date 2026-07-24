# Handoff: JB Guitar — "Studio Ledger" Visual Restyle

## Overview

A full visual restyle of the JB Guitar practice app (desktop + mobile) away from
the previously-bound "Industry" wireframe/blueprint design system to a new
custom look: warm paper background, rust/copper accent, condensed-grotesque
headings over a humanist body font. No functional or structural changes — same
screens, same flows, same copy.

## About the Design Files

The files in this bundle (`desktop.dc.html`, `mobile.dc.html`) are **design
references built as standalone HTML prototypes** — they demonstrate the intended
visual system (colors, type, spacing, component states) and behavior, not
production code to paste into the Angular app. The task is to **recreate this
visual design inside the existing Angular codebase** (`jb-guitar-frontend`),
using Angular's own component/SCSS structure — apply the new tokens and
component styling to the real Angular components, don't import these HTML files.

## Fidelity

**High-fidelity.** Colors, fonts, spacing and component styling below are final.
Recreate pixel-close using Angular's styling approach (component SCSS + global
tokens file), not by copying markup.

## Design Tokens

### Colors

| Token                 | Hex       | Usage                                                                  |
|-----------------------|-----------|------------------------------------------------------------------------|
| `--color-bg`          | `#f5efe2` | Page background (warm paper)                                           |
| `--color-text`        | `#241f18` | Primary text (ink)                                                     |
| `--color-accent`      | `#b1502e` | Primary accent (rust/copper) — primary buttons, active states, kickers |
| `--color-accent-100`  | `#f2ddd0` | Accent tint — active/selected backgrounds                              |
| `--color-accent-700`  | `#7c3319` | Accent hover/pressed, accent text on light bg                          |
| `--color-accent-900`  | `#3d1a0d` | Accent active/darkest                                                  |
| `--color-neutral-100` | `#ece4d4` | Subtle fills                                                           |
| `--color-neutral-200` | `#ddd2ba` | Hover fills, progress track                                            |
| `--color-neutral-300` | `#c8b99c` | Borders on hover                                                       |
| `--color-neutral-400` | `#a89a7c` | Muted dots/icons                                                       |
| `--color-neutral-500` | `#8a7c62` | Secondary meta text                                                    |
| `--color-neutral-600` | `#6b5f4a` | Secondary text                                                         |
| `--color-neutral-700` | `#4a4030` | Tertiary text on tints                                                 |
| `--color-divider`     | `#d6c8ab` | Hairline borders                                                       |
| Card/surface fill     | `#fffdf7` | Cards, inputs, dialogs (off-white paper)                               |

### Typography

- Heading font: **Bricolage Grotesque** (weights 400/600/700/800), via Google
  Fonts
- Body font: **Public Sans** (weights 400/500/600/700), via Google Fonts
- Headings: weight 700, color `--color-text`
- Card title: 17px, weight 600 (`--font-heading-weight`)
- Card kicker / section eyebrow: 11px, uppercase, letter-spacing 0.08em, color
  `--color-accent-700`
- Body copy: Public Sans, 14–15px

### Spacing scale

`--space-1: 4px, --space-2: 8px, --space-3: 12px, --space-4: 16px, --space-5: 20px, --space-6: 24px, --space-8: 32px`

### Radius

`--radius-sm: 6px`, `--radius: 10px` (cards, buttons, inputs, dialogs)

### Shadows

- `--shadow-sm: 0 1px 3px rgba(36,31,24,0.10)` — cards with `elev`
- `--shadow-md: 0 6px 20px rgba(36,31,24,0.14)`
- `--shadow-lg: 0 14px 36px rgba(36,31,24,0.18)` — dialogs

## Components

**Buttons** (`.btn`): 10px/18px padding, `--radius` corners, heading font weight
600.

- Primary: solid `--color-accent` fill, `#fbf3e8` text; hover →
  `--color-accent-700`; active → `--color-accent-900`.
- Secondary: transparent fill, `1px solid --color-divider`; hover →
  `--color-neutral-100` fill + `--color-neutral-300` border.
- Ghost: transparent, `--color-neutral-600` text; hover → `--color-accent-100`
  fill + `--color-accent-700` text.
- Icon buttons: 40px square (44–46px min hit target on mobile).
- Disabled: 45% opacity.

**Cards** (`.card`): off-white (`#fffdf7`) fill, `1px solid --color-divider`,
`--radius` corners, `--space-4` padding, soft-corner (no blueprint/corner-mark
motif — that belonged to the old system and has been removed). `.elev-sm` adds
`--shadow-sm`.

**Tags** (`.tag`): pill shape (999px radius), 11px uppercase, 4px/11px padding.
Variants: neutral fill, accent tint (`--color-accent-100`/`--color-accent-700`
text), outline (transparent + divider border).

**Inputs** (`.input`): off-white fill, `1px solid --color-divider`,
`--radius-sm`, focus border → `--color-accent`.

**Dialogs**: centered modal, `#fffdf7` fill, `--shadow-lg`, `--radius` corners,
`rgba(36,31,24,0.45)` backdrop.

**Progress bars**: track `--color-neutral-200/300`, fill `--color-accent` (or
`--color-neutral-500` when a session is completed).

**Focus state**: `2px solid --color-accent` outline, 2px offset, on all
interactive elements — never the browser default.

## Screens / Views

Same seven views as the existing app (all logic and copy unchanged — see the DC
files for exact markup/behavior):

1. **Landing** — latest session card + progress, or empty state with "Starta
   övningssession" CTA.
2. **Öva (Practice)** — latest session recap + grid/list of other in-progress
   sessions + "Ny session" tile.
3. **Session player** — exercise sidebar/chip-scroller, current exercise card (
   link + copy-link), Timer card, Metronom card (BPM/taktart/beat-strength
   dots), prev/next + pause/restart/delete controls.
4. **Skapa (Create)** — exercise cards grid + plan cards grid, each with "Ny …"
   add tile.
5. **Exercise edit** — name, source picker (YouTube/JTC/Soundslice/Annan tags),
   URL, description, save/cancel/delete.
6. **Plan edit** — name, ordered exercise rows (move up/down/remove), "+ Lägg
   till övning", save/cancel/delete.
7. **Hjälp (Help)** — static guide copy.
   Plus two dialogs: plan picker (start new session) and add-exercise picker (
   inside plan edit).

Mobile view: same structure, single column, bottom tab bar (Hem/Öva/Skapa/Hjälp)
instead of top nav links, horizontally scrolling exercise chips instead of the
sidebar list.

## Interactions & Behavior

Unchanged from the existing app — view/tab switching, session CRUD,
exercise/plan CRUD, countdown timer (start/pause/reset, editable minutes),
metronome (Web Audio beep, BPM 20–300, 1–16 beat time signature, 3-level
beat-strength cycling with click), copy-link with a 1.5s "copied" confirmation
state. See the logic class in the DC files for exact state machine.

## Assets

No images/icons beyond inline Lucide-style SVG line icons (stroke-width 1.5)
already embedded in the markup — reuse those paths directly, no external asset
files.

## Files

- `desktop.dc.html` — full desktop reference (nav + main content area, all 7
  views + 2 dialogs)
- `mobile.dc.html` — full mobile reference (header + bottom tab bar, same 7
  views adapted to single column)

Both are self-contained; open directly in a browser to see the live reference (
state is mocked with sample exercises/plans/sessions).
