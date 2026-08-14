# Tech Stack: Vue 3 + Supabase + Tailwind CSS

**Frontend:** Vue 3 (Composition API) with TypeScript, built with Vite
**Backend:** Supabase (PostgreSQL + auto-generated REST API + Auth)
**Styling:** Tailwind CSS + shadcn-vue (Reka UI primitives, formerly Radix Vue)
**Deployment:** Cloudflare Pages (static SPA) + Supabase (DB + auth)
**Data Fetching:** `@supabase/supabase-js` + `@vueuse/core`

**Why this stack:**
- Free hosting and database — critical constraint. Laravel requires traditional PHP hosting which is unreliable on free tiers.
- Supabase auto-generates a REST API from PostgreSQL schema — no backend code needed.
- Developer knows Vue and TypeScript.
- Plain Vue (no Nuxt) is sufficient — SPA is fine for a private tool, no SEO needed.
- Minimal infrastructure: Vue SPA on Cloudflare Pages, Supabase for everything else.
- Cloudflare Pages: unlimited bandwidth, always active, no cold starts.

**Why not Next.js/Nuxt:** Overkill — SSR not needed for a private tool, server routes not needed (Supabase handles backend).
**Why not Laravel:** Free PHP hosting is unreliable. Laravel on Vercel/Vapor adds complexity.
**Why not Rust/Go:** Learning curve outweighs benefits for a small app (~20 clients, hundreds of deliveries). Developer wants to learn Rust, but this is primarily a tool for a non-tech-savvy user — shipping fast matters.
**Why not Django:** Admin panel is functional but not polished for mobile. Would require separate frontend anyway.

**Validation:** Zod (schema validation) + VeeValidate (Vue form validation) + PostgreSQL triggers (server-side business rules).

**Auth:** Supabase Auth with email/password. Pre-seeded accounts (2 users: admin + operator). No public signup.
