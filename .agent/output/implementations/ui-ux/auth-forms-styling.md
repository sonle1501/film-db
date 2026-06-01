# UI/UX Implementation Details: Cyberpunk Terminal Auth Forms

## User's Intent
The user requested to enhance the Sign In (Login) and Sign Up (Register) forms inside `apps/frontend/film-db-ui` to match a Cyberpunk Terminal theme. Specifically, this included adding a top-right close button `[X]` to exit back to `/`, and styling active action buttons, status indicators, and toggles on both forms to use the principal interactive color, **Cyberpunk Cyan** (`#55ead4`).

## Visual Enhancements Description
- **Cyberpunk Neo-Terminal Style**: Standard modern rounded design is replaced with sharp borders (`rounded-none`), monospace headers, inputs, error logs, and helper labels.
- **Top status title bars**: Added interactive terminal title bars (`SECURE_AUTH_GATEWAY.EXE` / `SECURE_REGISTRATION_GATEWAY.EXE`) with close buttons (`ESC [X]`).
- **Background Atmosphere**: Added a repeating dot-grid pattern and horizontal technical scanline overlays.
- **Button & Toggle Styling**:
  - Sign-in actions, tab toggles, and status indicators glow and hover with Cyberpunk Cyan theme colors (`#55ead4`).
  - Sign-up actions, tab toggles, and status indicators on the registration form are also styled in Cyberpunk Cyan (`#55ead4`) for design consistency across both authorization pages.
- **Input Fields**: Input fields on both pages mimic terminal command prompts prefixed with a prompt arrow `> `, and glow Cyberpunk Cyan when focused.

## Modified UI Components & Files
- [login/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/%28auth%29/login/page.tsx): Redesigned standard LoginPage component to the Cyberpunk Cyan theme.
- [register/page.tsx](file:///s:/Coding/Projects/film-db/apps/frontend/film-db-ui/src/app/%28auth%29/register/page.tsx): Redesigned standard RegisterPage component to use the Cyberpunk Cyan theme for all input focus states, buttons, toggles, and status indicators.

## Before/After Appearance Notes & Recommendations
- **Before**: 
  - Rounded `2xl` cards with white translucent backgrounds.
  - Standard inputs with rounded corners and generic blue/indigo focus rings.
  - Solid blue (`primary-600`) submit button.
  - No close or exit option on the card.
- **After**:
  - Sharp corners (`rounded-none`), monospaced fonts, and command prompts.
  - Cyberpunk Cyan styling (`#55ead4`) consistently applied across buttons, tabs, input focus glows, status dots, and arrows for both forms.
  - Functional close button on the top-right console bar routing to Home (`/`).
  - Background scanlines and grid patterns to complete the hacker aesthetic.
- **Recommendations**:
  - Keep the form titles capitalised in monospace for high readability.
  - Integrate matching sound effects (e.g., retro keystrokes or system alerts) to further elevate terminal skeuomorphism.
