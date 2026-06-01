---
trigger: always_on
---

# Design Principles: Film DB (Terminal Cyberpunk System)

This document outlines the visual philosophy, layout guidelines, and interactive approaches for the Film DB user interface. It acts as a guide to maintaining a cohesive, immersive cyberpunk aesthetic across pages and widgets.

---

## 1. Visual Philosophy & Aesthetic

The design of Film DB is inspired by **retro-futuristic terminal displays** combined with **cyberpunk aesthetic**. It balances technical, monospaced data grids with highly readable, geometric sans-serif copy. 

### Key Characteristics:
- **High-contrast hierarchy**: Key interactions and metrics glow, drawing immediate focus.
- **Flat industrial geometry**: Strict sharp corners dominate, contrasted by occasional 45-degree angle chamfers.

---

## 2. Color Palette & Styling Variables

Film DB supports a dual-theme surface structure utilizing system-level custom CSS properties.

### Active Themes:
- **Dark Mode (Default Context)**:
  - Primary Background: `#323232` (Deep Charcoal Grey, reducing eye strain).
  - Elevated Surface: `#3a3a3a` (Used for cards, panels, and floating panels).
  - Primary Text: `#c8c8c8` (Mid-tone grey, soft and readable).
  - Muted Borders/Labels: `#8a8a8a` / `#4a4a4a`.
- **Light Mode (Alternative Context)**:
  - Primary Background: `#f5f5f5`.
  - Elevated Surface: `#e5e5e5`.
  - Primary Text: `#171717`.
  - Muted Borders/Labels: `#737373` / `#d4d4d4`.

### Accent Highlight Colors (10% Rule):
- **Cyberpunk Cyan (`#55ead4`)**: The principal interactive color. Used for actions, links, successful state cues, and active search focuses.
- **Cyberpunk Yellow (`#f3e600`)**: Used to highlight key metadata metrics (like user ratings or vote totals) and alert indicators.
- **Cyberpunk Red (`#ff0055`)**: Used to mark destructive actions, negative states, or error logging signals.

---

## 3. Typography & Sizing

The system balances reading comfort with computer-terminal stylistic elements:

- **Body Text & Long Content**: Rendered using a clean, modern Sans-Serif font (`Inter`, system-ui, sans-serif) to ensure high readability and reduce eye fatigue.
- **Headings, UI Labels, and Numeric Data**: Rendered using a Monospace font (`monospace`) to evoke the feel of a terminal console or file directory listings.
- **Visual Weight**: Use varying font weights (light vs. semi-bold) and letter-spacing (wide kerning on monospaced headers) rather than drastic changes in font size to establish structure.

---

## 4. Geometric Structure & Layout Patterns

Layout structures reinforce the industrial, hardware-like theme:

- **Sharp Edges**: Avoid rounded corners. Keep buttons, input fields, cards, and modal components strictly rectangular (`border-radius: 0px`).
- **Chamfer Corners**: To isolate specialized modules, hero sections, or diagnostic panels, apply a 45-degree angled corner cut (`.chamfer-border` via CSS `clip-path`).
- **Technical Grids**: Divide dashboard modules and catalog list carousels with sharp, thin borders (`1px solid var(--border-color)`), resembling blueprint sheets or technical schematics.

---

## 5. Interaction Patterns & Micro-Animations

Micro-animations breathe life into the UI, making the terminal feel active:

### 5.1. Glowing Interactive Borders
- Standard inputs, buttons, and cards start with a muted border.
- On hover or focus, borders transition smoothly (`transition: all 0.2s`) to a glowing neon color:
  - **Cyan Glow (`.terminal-border`)**: Glows with a box-shadow (`0 0 8px rgba(85,234,212,0.4)`) on focus or hover.
  - **Yellow Glow (`.terminal-border-yellow`)**: Glows with a box-shadow (`0 0 8px rgba(243, 230, 0, 0.4)`) on focus or hover.

### 5.2. Terminal Skeuomorphism
- **CommandPrompts**: Input bars mimic command shells (e.g., using `> _` prompts).
- **Blinking Cursors**: Incorporate a subtle blink animation (`.cursor-blink`) on cursor cues to simulate a processing CLI interface.
- **Card Translations**: Elevate lists and grid blocks slightly on hover (e.g., sliding -2px on the Y-axis) to provide a satisfying depth cue.
