# System UI: portfolio hero design spec

**Owner:** Nathaniel Adama · **Status:** concept approved, ready to build · **Scope:** the home page hero (one screen), plus optional phase 2.

This spec is written for the coding agent that builds it. Read it top to bottom before writing code. Before you touch Next.js APIs, follow `AGENTS.md`: this repo runs **Next.js 16.4 / React 19.3 / Tailwind v4 / Bun**, so read the relevant guides in `node_modules/next/dist/docs/` first.

---

## 1. References

| What | Where | Use it for |
|---|---|---|
| Interactive prototype | [`prototype.html`](./prototype.html), opened directly in a browser | Exact behavior, timing, copy and styling. Add `#hud` to skip to the HUD, or `#gate` to also open the red gate. |
| Screenshots | [`screens/`](./screens) | Visual targets: `01-notification`, `02-status-hud`, `03-red-gate`, `04-mobile`. |
| Original artifact | https://claude.ai/artifact/PJnaMzLW37CcVxCYEWVHEi (the "★ System Awakening" tab; private to the owner) | The same prototype next to the other concepts that were considered. |

The prototype is **throwaway reference code**: one HTML file with vanilla JS and hard-coded timers. Match what it does and how it looks, but don't port its structure. Section 7 defines the real architecture.

---

## 2. Concept

The portfolio is the **System** from a hunter-awakening story, inspired by Solo Leveling. The visitor is a newly detected "visitor," and Nathaniel is the **Player** whose profile they open.

| Story element | Portfolio meaning |
|---|---|
| System notification | The entry gate to the site |
| Status window | The profile: name, job, level, rank, stats as skills |
| Ability points | A small interactive toy (the visitor spends 5 points) |
| Daily quest | **The navigation.** Goals send visitors to projects and contact. |
| Gates (blue and red) | Projects, ranked C to S. The red gate is the flagship. |
| Shadow extraction | Each viewed project joins Nathaniel's "shadow army" |
| Quest complete + reward | The payoff after contact is made |

The page's job: a visitor leaves having seen the projects and knowing how to reach Nathaniel. The game layer exists to get them there.

### 2.1 Homage boundary (hard rules)

This is a public portfolio, so it must be **inspired by** the series, never copied from it.

- **Do:** use the genre's ideas (system windows, ranks E–S, gates, daily quests, shadow extraction, "level up") with **original UI and original wording**.
- **Don't:** use the series' logo, title treatment, character names, character art, screenshots, or verbatim dialogue (for example, the series' exact line about "acquiring the qualifications to be a Player"). Don't use the series name anywhere in the UI.
- One-word callouts like **ARISE** and **LEVEL UP** are fine.
- Shadow silhouettes must be original generic figures (see the SVG in the prototype), not traced characters.

---

## 3. Experience flow

A client-side state machine with three phases:

```
notification ──accept──▶ awakening (level count-up) ──done──▶ hud (interactive)
      │ decline ×1 → warning toast + shake
      │ decline ×2 → "The System has accepted on your behalf." → accept
```

### 3.1 Timing (from the prototype; keep these unless they feel wrong in the real build)

| Moment | Timing |
|---|---|
| Notification window opens | 0.5 s after load. Open animation 550 ms: line at `scale(.3,.02)`, widen to full width, then expand vertically. |
| Notification text types | Starts at 1.0 s. 22 ms per character, 180 ms pause on each newline. Buttons appear when typing ends. |
| Accept | Window closes in 350 ms (reverse of opening). |
| HUD windows open | Staggered: status 0 ms, quest 150 ms, shadows 300 ms, gates 450 ms. Same open animation. |
| Level count-up | Starts 650 ms after the HUD shows. Counts 1 → 27, with the step interval easing from 40 ms to about 120 ms. A small gold "LEVEL UP!" floats above the number every 3 levels. The rank badge pulses on each tier change. |
| Count-up ends | "LEVEL UP" banner (1.5 s). Toast `[ RANK ] Player rank reassessed: S`. One second later, toast `[ DAILY QUEST ] "Hire a Developer" has arrived.` |
| Enter gate | Full-screen portal swirl for 1.2 s, then the gate window opens. |
| Extract shadow | "ARISE" banner (1.8 s) over rising purple particles, then close the overlay and rise the shadow into its slot (0.8 s). |
| Toasts | 2.8 s by default (5 s for the message and reward toasts), at most 3 stacked, oldest removed first. |

### 3.2 Return visits

Persist progress (section 7.3). If the visitor has already accepted once:

- Skip the notification and count-up. Render the HUD at level 27 / rank S immediately.
- Show the toast `[ SYSTEM ] Welcome back, Hunter.`
- Show a small "Replay awakening" control in the corner.

The first visit must also offer a visible **Skip intro** button, at the bottom right during the notification and count-up.

---

## 4. Components and behavior

All windows share one frame (section 5.3). Everything listed here is in the prototype.

### 4.1 Notification
- Title chip: `NOTIFICATION`
- Copy (original wording, keep it): "A visitor has been detected. / You have been granted access to the Player's profile. / *(blank line)* / Will you accept?"
- Buttons: **ACCEPT** (primary) and **DECLINE** (ghost).
  - First decline: red toast `[ WARNING ] Declining is not permitted.` and the window shakes (400 ms).
  - Second decline: toast `[ SYSTEM ] The System has accepted on your behalf.`, then accept.
- `role="dialog"` with `aria-modal`. Focus moves to Accept once the buttons appear.

### 4.2 Status window (the profile)
- Header row: **LEVEL** (big number), identity block (NAME / JOB / TITLE), **RANK** badge.
- Bars: HP `9,999 / 9,999` (red), MP `Focus 640 / 800` (blue). These are jokes; keep them short.
- Stats in a 2-column grid, each with a `+` button:
  - STR · Backend 78 / AGI · Frontend 92 / PER · Design 74 / VIT · Uptime 88 / INT · Architecture 85
  - POINTS 5 (gold)
- Clicking `+`: the stat goes up by 1, points go down by 1, a gold "+1" floats up, and the toast `AGI increased by 1.` appears. At 0 points, all `+` buttons disable.
- Skill chips: `Passive · Type Safety Lv.MAX`, `Active · Ship Cooldown 0s`, `Active · Realtime Sync Lv.8`.
- Rank tiers: **E** 1–5, **D** 6–10, **C** 11–15, **B** 16–20, **A** 21–25, **S** 26+. Colors are in section 5.1.

### 4.3 Daily quest (the navigation)
- Title chip `DAILY QUEST`, heading **Hire a Developer**.
- Goals, each with a live `n/max` counter that turns green with a strike-through when done:
  1. Clear gates (view projects): `0/3`
  2. Allocate ability points: `0/5`
  3. Send the Player a message: `0/1`, with a **SEND** button. The button shows the email in a 5 s toast and marks the goal done. In the real build it should also open a contact sheet or `mailto:`.
- Red warning line: "WARNING: Leaving this quest incomplete may result in missing a great hire."
- **TIME REMAINING**: a real countdown to the visitor's local midnight (`HH:MM:SS`, tabular numerals).
- When all three goals are done: "QUEST COMPLETE" banner, then the 5 s toast `[ REWARD ] Title acquired: "Talent Scout". The Player replies within 24h.`

### 4.4 Shadows
- Title chip `SHADOWS`, with one slot per gate (3). Empty slots are dashed purple outlines labeled "empty".
- After an extraction, the slot fills with the glowing-eyed silhouette (rise animation) and the label `{grade} · {project}`, for example `Knight · Realtime Chat`.
- Hint line: "Clear a gate to extract its shadow."
- The ambient mist turns more purple as the army grows: purple share = shadows / total × 0.7.

### 4.5 Gates (projects)
- A row of gate cards. Each has a spinning portal ring (conic gradient), `RANK X`, the project name, and `ENTER ›`.
- **Red gate** (the flagship project): red ring and border, labeled `RED GATE · RANK S`.
- Clicking a gate opens the full-screen gate overlay:
  1. Portal swirl canvas plus blinking text `ENTERING GATE · RANK A` (or `ENTERING RED GATE · …`), for 1.2 s.
  2. The gate window: rank chip, name, stack line, summary, Loot (real links: case study, demo, source), then **EXTRACT SHADOW** and **LEAVE**.
  3. On the red gate, LEAVE is hidden until the gate is cleared, and the toast `[ WARNING ] This is a red gate. You cannot leave until it is cleared.` appears. **Accessibility override:** Esc must still close the overlay. Show the toast once, and close on the second Esc.
  4. Extract: the ARISE sequence (section 3.1). The gate is marked `CLEARED ✓` with a dimmed ring, the shadow is added, the quest updates, and a purple toast reads `[ SHADOW EXTRACTED ] {project} joined the army as {grade}.`
  5. Re-entering a cleared gate skips straight to the window, showing `CLEARED ✓` and LEAVE.

### 4.6 Toasts and banners
- Toasts are small System windows: `[ LABEL ]` in bold glow, then the message. Variants: default (blue), `danger` (red), `shadow` (purple).
- Banners are huge centered text: `LEVEL UP` and `QUEST COMPLETE` in gold Rajdhani; `ARISE` in Cinzel, pale violet with a purple glow, blurring in and out.

### 4.7 Ambient background
- Radial navy gradient with a canvas of about 80 rising motes (blue, plus purple per section 4.4), drawn additively with a soft halo.

---

## 5. Visual system

### 5.1 Color tokens

Put these in Tailwind v4 `@theme` in `app/globals.css`. The page commits to a single dark look, so there is no light theme for this hero.

| Token | Value | Use |
|---|---|---|
| `--color-sys-blue` | `#49c6ff` | Primary glow, borders, corner brackets |
| `--color-sys-line` | `rgb(73 198 255 / .55)` | Window borders |
| `--color-sys-text` | `#dff4ff` | Body text |
| `--color-sys-muted` | `#7fa8c4` | Labels, secondary text |
| `--color-sys-gold` | `#ffd36b` | Level up, points, rewards |
| `--color-sys-purple` | `#8f5bff` | Shadows, ARISE |
| `--color-sys-red` | `#ff3b4e` | Red gate, warnings, HP |
| `--color-sys-green` | `#5fe39a` | Completed goals, cleared |
| Background | `radial-gradient(ellipse at 50% 110%, #0c2a4d 0%, #050b18 55%, #02040a 100%)` | Page |
| Window fill | `linear-gradient(180deg, rgb(10 28 52 / .86), rgb(4 12 26 / .92))` + `backdrop-filter: blur(3px)` | All windows |

Rank colors: E `#9aa6b2`, D `#5fe39a`, C `#49c6ff`, B `#a98bff`, A `#ffd36b`, S `#ff4d6a`.

### 5.2 Type
- **Rajdhani** 500 / 600 / 700 for all UI text.
- **Cinzel** 700 for the ARISE banner only.
- Load both with `next/font/google` (self-hosted, no layout shift) and expose them as CSS variables.
- Title chips: 14px, weight 700, uppercase, `letter-spacing: .32em`, with a blue text-shadow glow.
- Level number: 52px, weight 700, `tabular-nums`. All counters use tabular numerals.

### 5.3 Window anatomy (the signature element)
1. A 1px `--color-sys-line` border, with glow `0 0 22px rgb(73 198 255 / .22)` plus an inset glow.
2. Four **L-shaped corner brackets** (14px × 2px arms), offset −4px outside the border, with a `drop-shadow` glow. The prototype draws them as eight `linear-gradient` backgrounds on `::before`. Keep that technique as a single CSS component class (`.sys-window`), not as utilities.
3. A centered, bordered **title chip**.
4. Variants switch the bracket and border color: blue (default), red (`danger`), purple (`shadow`).

### 5.4 Motion vocabulary
- **Open:** `scale(.3,.02)` → `scale(1,.02)` → `none`, 550 ms, `cubic-bezier(.2,.9,.2,1)`.
- **Close:** the reverse, 350 ms, ease-in.
- **Shake:** ±8px, decaying over 400 ms.
- **Pulse:** scale 1.5 → 1 with a brightness flash, 450 ms (rank badge).
- **Float:** move up 16px while fading out, 700–800 ms ("+1", "LEVEL UP!").
- **Rise:** `translateY(30px) scaleY(.2)` → `none` with an overshoot ease, 800 ms (shadow slot).

---

## 6. Recommended stack and dependencies

Already in the repo: `next@16.4.3`, `react@19.3.0`, `tailwindcss@4`, TypeScript, Bun. Install the latest stable versions with `bun add`.

| Package | Why | Notes |
|---|---|---|
| **`motion`** (import from `motion/react`) | Window open/close variants, `AnimatePresence` for the overlay, toasts and banners, `animate()` for the level count-up, and `useReducedMotion`. | The current package for what was Framer Motion. Don't install `framer-motion`. One animation library only. |
| **`zustand`** (+ its `persist` middleware) | One game store shared by status, quest, shadows and gates without prop drilling; `persist` handles return visits through localStorage. | Persist only progress fields (section 7.3). |
| **`clsx`** + **`tailwind-merge`** | A `cn()` helper for variant classes. | Tiny. |
| **`use-sound`** *(optional)* | System chime on notifications and a deeper tone on ARISE. | **Muted by default** behind a visible sound toggle. Add it after everything else works. |
| `next/font/google` (built in) | Rajdhani and Cinzel. | No external font requests at runtime. |
| Canvas 2D (no library) | Ambient mist and gate portal. | Two small hooks (`useMistCanvas`, `usePortalCanvas`) of about 80 lines each. The prototype's `sysMist()` and `portalFx()` are the reference. |
| React `<ViewTransition>` (built into React 19.3) | **Phase 2 only:** morph a gate card into a `/projects/[slug]` page header. | Works in the App Router with no config. Read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` first. |
| `@playwright/test` *(dev, optional)* | One end-to-end test of the full quest flow. | See section 9. |

**Don't add:** GSAP (redundant next to Motion), three.js / react-three-fiber (2D canvas covers this; that's about 150 KB for nothing), tsparticles (heavy for 80 dots), CSS-in-JS libraries (Tailwind v4 is already set up), or any UI kit (every surface here is custom).

---

## 7. Architecture

### 7.1 File layout

```
app/
  layout.tsx            fonts (Rajdhani, Cinzel) as CSS variables, metadata
  page.tsx              Server Component: loads content, renders <SystemHero>
  globals.css           @theme tokens, .sys-window frame, keyframes
components/system/
  system-hero.tsx       'use client' — phase machine, layout grid, overlays
  system-window.tsx     shared frame: corners, title chip, variant, open/close motion
  notification.tsx
  status-window.tsx
  quest-window.tsx
  shadows-window.tsx
  gate-card.tsx
  gate-overlay.tsx      portal phase → gate window → arise
  toast-stack.tsx
  banner.tsx
  mist-canvas.tsx       uses useMistCanvas
  portal-canvas.tsx     uses usePortalCanvas
  shadow-silhouette.tsx original SVG figure
  skip-controls.tsx     Skip intro / Replay awakening / sound toggle
lib/system/
  store.ts              zustand store + persist
  rank.ts               rankOf(level), rank colors
  use-countdown.ts      time to local midnight
  use-canvas-loop.ts    rAF loop that pauses when the tab is hidden or the canvas is covered
content/
  profile.ts            name, job, title, stats, skills, contact
  gates.ts              projects as gates
```

### 7.2 Server vs. client
- `page.tsx` stays a **Server Component** and server-renders the HUD markup (name, job, stats and gates with real links). That makes the content indexable and gives the largest paint real text.
- The notification is a client overlay on top of the server-rendered HUD. The HUD stays `inert` and visually hidden until accept, so nothing shifts when it appears.
- Only `components/system/*` needs `'use client'`.

### 7.3 Store shape

```ts
type Phase = 'notification' | 'awakening' | 'hud'
type StatKey = 'STR' | 'AGI' | 'PER' | 'VIT' | 'INT'

interface SystemState {
  phase: Phase
  declines: number
  points: number                 // starts at profile.points (5)
  stats: Record<StatKey, number>
  allocated: number
  cleared: string[]              // gate slugs, in extraction order (fills shadow slots)
  contacted: boolean
  questComplete: boolean
  introSeen: boolean
  soundOn: boolean
  // actions: accept, decline, allocate(key), clearGate(slug), contact, skipIntro, replayIntro, toggleSound
}
// persist: points, stats, allocated, cleared, contacted, questComplete, introSeen, soundOn
// never persist: phase, declines
```

Toasts and banners can live in a small separate store or context, since they're ephemeral and never persisted.

### 7.4 Content model

```ts
// content/profile.ts
export const profile = {
  name: 'Nathaniel Adama',
  job: 'Full-Stack Developer',
  title: 'The One Who Ships on Fridays',
  level: 27,
  hp: { label: '9,999 / 9,999', pct: 100 },
  mp: { label: 'Focus 640 / 800', pct: 80 },
  stats: [
    { key: 'STR', label: 'Backend', value: 78 },
    { key: 'AGI', label: 'Frontend', value: 92 },
    { key: 'PER', label: 'Design', value: 74 },
    { key: 'VIT', label: 'Uptime', value: 88 },
    { key: 'INT', label: 'Architecture', value: 85 },
  ],
  points: 5,
  skills: [
    { kind: 'Passive', name: 'Type Safety', level: 'Lv.MAX' },
    { kind: 'Active', name: 'Ship', level: 'Cooldown 0s' },
    { kind: 'Active', name: 'Realtime Sync', level: 'Lv.8' },
  ],
  email: 'hello@yourdomain.dev',
} as const

// content/gates.ts
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export interface Gate {
  slug: string
  name: string
  rank: Rank
  red?: boolean                  // exactly one: the flagship project
  stack: string[]
  summary: string                // one or two sentences
  loot: { label: string; href: string }[]
  shadowGrade: 'Soldier' | 'Knight' | 'Commander'
}
```

The quest goal "Clear gates 0/N" uses `gates.length`, and there is one shadow slot per gate. Keep 3–4 gates so they fit in one row on desktop.

---

## 8. Layout, accessibility and performance

### 8.1 Layout
- **Desktop (≥ 1024px):** centered container, `max-width` about 1200px, **vertically centered** in the viewport.
  - Grid areas: `"status quest" "status shadows" "gates gates"`, columns `1.15fr 1fr`, gap 14px.
- **Tablet and mobile (< 760px):** single column in the order status → quest → gates → shadows. On mobile the page scrolls normally (no inner scroll container); gates stack one per row. Under 420px, stats drop to one column and the level number shrinks to 42px.
- The full-screen overlays (notification, gate, banners) use `position: fixed` and respect safe-area insets.

### 8.2 Fixes over the prototype (seen in `screens/02-status-hud.png`)
1. **The toast stack covers the status window's rank badge.** On desktop, move toasts to the top-right corner. On mobile, put them at the bottom center, above the safe area.
2. **The status window has dead space at the bottom**, because it spans two rows. Fix it in one of two ways:
   - Fill the space with a short "Recent activity" log: the last 3 System events, such as "Shipped Realtime Chat v2 · 3 days ago."
   - Or size the rows to their content.
3. **The HUD sits at the top, leaving the lower viewport empty.** Center it vertically (section 8.1).
4. **New controls the prototype lacks:** Skip intro, Replay awakening, and the sound toggle (section 3.2).
5. **On mobile, a long TITLE wraps under its label** (`screens/04-mobile.png`). Lay out the identity rows as a two-column grid (label | value) so wrapped values stay aligned.

### 8.3 Accessibility
- **Reduced motion (`prefers-reduced-motion`):**
  - No typing effect: show the full text.
  - No count-up: render level 27 directly.
  - The portal shows a static radial glow instead of the swirl; banners fade only; the mist is a single static frame.
- **Focus:**
  - Every window action is a real `<button>` or `<a>` with a visible focus ring (blue glow).
  - Focus moves into the gate overlay and returns to the gate card on close.
  - Esc closes the overlay (with the red-gate exception in section 4.5).
- **Announcements:** toasts render in one `aria-live="polite"` region. Don't announce every "+1"; announce goal completion instead.
- **Links:** project loot links are real links. The contact goal must expose the email as selectable text, not only as a toast that disappears.
- **Contrast:** muted text `#7fa8c4` on the navy background passes AA. Keep body text at 14px or larger.

### 8.4 Performance
- Canvas loops pause when `document.visibilityState !== 'visible'` and while an overlay covers the mist. Cap the device pixel ratio at 2. Keep about 80 mist particles and about 260 portal particles.
- The largest paint must be the server-rendered name and status text, not a canvas.
- Animate only `transform`, `opacity` and `filter`.
- Target Lighthouse performance ≥ 90 on mobile.

---

## 9. Acceptance criteria

- [ ] A first visit shows the notification, typing, and Accept/Decline, including both decline behaviors.
- [ ] Accepting runs the HUD open stagger, the level 1 → 27 count-up with rank tiers E→S and pulses, then the LEVEL UP banner and both toasts.
- [ ] Spending all 5 points updates stats, disables the `+` buttons, and completes quest goal 2.
- [ ] Each gate runs portal → window → extract → ARISE → shadow slot fills → gate shows CLEARED → quest counter goes up.
- [ ] The red gate hides LEAVE until it is cleared and shows the warning, and Esc still exits on the second press.
- [ ] SEND completes goal 3 and shows the email as selectable text.
- [ ] Completing all goals shows QUEST COMPLETE and the reward toast.
- [ ] Reloading keeps progress, skips the intro, and shows the welcome-back toast. "Replay awakening" restarts the intro without wiping progress.
- [ ] Skip intro works on first visit.
- [ ] Reduced motion behaves as described in section 8.3, with no infinite animations except the slow gate ring spin.
- [ ] Layout matches section 8.1 at 1440px, 1024px, 768px and 390px, with no horizontal scroll.
- [ ] No series logos, names, art or verbatim lines anywhere (section 2.1).
- [ ] `bun run build` and `bun run lint` pass.

---

## 10. Phase 2 (optional, after the hero ships)

- `/projects/[slug]`: a full "dungeon report" page per gate, styled as a large System window. Morph the gate ring into the page header with React `<ViewTransition>`.
- Hidden **dungeon break** easter egg: typing `arise` anywhere summons all the shadows across the screen.
- An OG image of the status window, generated with `next/og` (see `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`).

---

## 11. Placeholders to replace before launch

All of these are sample content from the prototype. Get the real values from Nathaniel:

- Email (`hello@yourdomain.dev`) and social links
- The three projects: names, ranks, stacks, summaries, loot URLs, and which one is the red gate
- Stat values, level number, title line, HP/MP joke labels and skill chips
- Recent activity log entries (if you choose that fix in section 8.2)
