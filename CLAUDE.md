# Fresh For Less Carpet Cleaning — Website

## Project Overview
Marketing website for **Fresh For Less Carpet Cleaning**, a local carpet and upholstery cleaning business. The site targets women aged 26-65+, families, and commercial customers. The primary conversion goal is getting users to request a free quote.

## Tech Stack
- **Framework:** Next.js 16 (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using `@theme` directive, `@tailwindcss/postcss`)
- **Animations:** Framer Motion
- **Font:** Inter (via `next/font/google`)

## Project Structure
```
src/
├── app/
│   ├── globals.css          # Tailwind imports, @theme color tokens, base styles
│   ├── layout.tsx           # Root layout with metadata and font setup
│   └── page.tsx             # Main page — assembles all sections
└── components/
    ├── AnimatedSection.tsx   # Reusable scroll-triggered animation wrapper
    ├── Navbar.tsx            # Fixed navbar with scroll-aware styling + mobile menu
    ├── Footer.tsx            # Site footer with links and contact info
    ├── QuoteModal.tsx        # Quote request form modal (primary CTA)
    └── sections/
        ├── Hero.tsx          # Hero with headline, CTAs, trust metrics
        ├── PainPoints.tsx    # Problem/pain agitation section
        ├── Benefits.tsx      # Solution/benefits grid
        ├── Process.tsx       # 4-step "How It Works" with timeline
        ├── Testimonials.tsx  # Social proof — grid (desktop) + carousel (mobile)
        ├── About.tsx         # Credibility section with dashboard-style stats
        └── FinalCTA.tsx      # Bottom CTA section
```

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build (static export to /out)
npm run start    # Serve production build
npm run lint     # Run ESLint
```

**Note:** Node.js is installed at `C:\Users\User\AppData\Local\nodejs\node-v22.14.0-win-x64`. It must be on PATH before running commands. Use the PowerShell pattern:
```powershell
$nodePath = 'C:\Users\User\AppData\Local\nodejs\node-v22.14.0-win-x64'
$env:Path = "$nodePath;$env:Path"
```

## Design System
- **Color tokens** defined in `globals.css` via `@theme` — `primary` (blue), `accent` (green), `slate` (neutral)
- **Design direction:** Clean modern interface with systematic grids, geometric typography, frosted glass effects, layered components with depth, precise alignment
- **All icons** are inline SVGs from Heroicons (outline style, 24px)
- **Animations** use Framer Motion — `AnimatedSection` component for scroll-triggered reveals, `motion` for hero animations and floating orbs

## Key Patterns
- All section components are client components (`"use client"`) because they use Framer Motion
- The `QuoteModal` is controlled by `page.tsx` state and passed via `onQuoteClick` props
- The Navbar uses a transparent-to-frosted-glass transition on scroll
- Static export mode (`output: "export"` in `next.config.ts`) — no server-side features
- Testimonials section uses a grid on desktop and a carousel with AnimatePresence on mobile

## Business Details (placeholder)
- **Phone:** (555) 123-4567
- **Email:** info@freshforless.com
- **Hours:** Mon-Sat 7am-7pm
- These are placeholder values and should be replaced with real business info.
