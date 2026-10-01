# Spark Systems — Website

The Spark Systems marketing site, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS 4**.
It is a component-based port of the `Spark design v2/Spark Homepage.dc.html` design.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Optional `.env.local`:

```bash
# Outline copy that still needs client confirmation ([title TBC], [figure to confirm], …)
NEXT_PUBLIC_HIGHLIGHT_TBC=true
```

## Project structure

```
src/
├── app/                       Routing only — no business logic
│   ├── layout.tsx             <html>, fonts, metadata, global providers
│   ├── globals.css            Design tokens (@theme), custom utilities, reveal styles
│   └── (site)/                Route group for marketing pages
│       ├── layout.tsx         Header, floating nav, footer (shared chrome)
│       └── page.tsx           Home page = a list of sections
│
├── components/                Shared, feature-agnostic building blocks
│   ├── ui/                    Design-system primitives: PillLink, Reveal, Field/Input,
│   │                          PartnerBadge, MonoLabel, Eyebrow, TagList, Tbc, SmartLink…
│   ├── layout/                Site chrome: SiteHeader, FloatingNav, MenuList, SiteFooter
│   └── providers/             MotionProvider, SmoothScrollProvider, RevealObserver
│
├── features/                  One folder per feature/page area
│   ├── home/
│   │   ├── sections/          One file per page section (Hero, Solutions, Services…)
│   │   ├── components/        Pieces used only by the home sections
│   │   └── index.ts           Public API of the feature
│   └── contact/               Contact form, server action, validation
│
├── content/home.ts            All home-page copy, images and lists (typed data)
├── config/site.ts             Site-wide config: nav, socials, offices, partners
├── types/content.ts           Content model types (Solution, Project, Testimonial…)
├── hooks/                     useFrame, useViewport, useWheelSteps, useInViewOnce…
├── lib/
│   ├── motion/                Easing/math helpers, shared rAF ticker
│   ├── scroll/                ScrollController (smooth wheel, anchor links, tweens)
│   ├── three/                 BallSwarm (three.js sphere swarm in the AI band, lazy-loaded)
│   └── utils.ts               cn() — clsx + tailwind-merge
└── assets/images/             Statically imported images (sized + blurred by next/image)
```

## Conventions

**Content is data, not markup.** Copy, images and lists live in `content/` and `config/` and are typed by `types/content.ts`.
To add a solution, project, service, client logo or testimonial, add an entry to the array. You don't need to touch any component.

**Server Components by default.** Sections are Server Components. Only the parts that need the browser are Client Components (`"use client"`), for example `SolutionsScene`, `WorkCarousel`, `LogoWall` and `StatCounter`.
Server-rendered markup is passed into client scenes as `children` or props (see `work-section.tsx` and `solutions-section.tsx`).

**Design tokens live in one place.** Colours, fonts, radii and easings are defined in `@theme` in `globals.css`, so use classes like `bg-brand`, `text-fog-500` and `rounded-card` rather than hex values.
The design's fluid sizing uses container-query units (`cqw`) relative to the site wrapper (`@container` in `(site)/layout.tsx`). Repeated values are custom utilities: `px-gutter`, `bg-texture`, `glass`.

**Motion architecture**

| Piece | Responsibility |
| --- | --- |
| `lib/motion/ticker.ts` | One shared `requestAnimationFrame` loop; components subscribe through `useFrame` |
| `MotionProvider` / `useMotion()` | Respects `prefers-reduced-motion`; every animation checks it |
| `ScrollController` | Adapter over [Lenis](https://lenis.dev): smooth scrolling (driven by the shared ticker), `#anchor` links and eased tweens |
| `useWheelSteps` | Turns wheel gestures in a pinned scene into one-step-per-gesture snaps (Solutions) |
| `<Reveal>` + `RevealObserver` | Declarative fade-up on scroll; works inside Server Components |
| `useViewport` | SSR-safe viewport size and mobile flag (`< 760px`, which is also Tailwind's `md`) |

Scroll scenes write transforms straight to DOM refs inside `useFrame`, so they don't re-render on every frame. React state changes only for discrete steps, such as the active slide.

**Links.** Use `SmartLink` (or `PillLink`), which renders `next/link` for internal routes and a plain `<a>` for `#anchors` and external URLs.

## Adding a page

1. Create `src/app/(site)/<route>/page.tsx`. It inherits the header and footer automatically.
2. Put its sections in `src/features/<route>/sections/` and its content in `src/content/<route>.ts`.
3. Point the matching entries in `config/site.ts` (`menuNav`, `companyNav`) to the new route.

## Open items carried over from the design

- Copy marked `Tbc` (testimonial job titles, "15M+ users served", two project subtitles, the Spine Creative Backbone logo) still needs to be confirmed.
- Menu entries About, Insights and Careers, plus the solution/project/service links, point to `#` until those pages exist.
- `features/contact/actions.ts` validates the form but doesn't send it anywhere yet (marked `TODO`).
