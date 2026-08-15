<div align="center">

# SakuraRecords

Client management and delivery tracking system for sales operations.

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=fff)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=fff)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=fff)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![shadcn-vue](https://img.shields.io/badge/shadcn--vue-UI-000?style=flat-square)](https://www.shadcn-vue.com)

[Overview](#overview) | [Features](#features) | [Getting Started](#getting-started) | [Tech Stack](#tech-stack) | [Project Structure](#project-structure)

</div>

## Overview

SakuraRecords is a web application for tracking client purchases, deliveries, and generating sales statistics. It is built for a single-currency environment (Philippine peso) and focused on **retrospective reporting** — no delivery workflow tracking.

The system manages the full lifecycle: clients place purchase orders containing products, which are fulfilled through shipments with associated documentation and payment tracking.

## Features

- **Dashboard** — monthly and quarterly stats (open POs, deliveries, gross sales, overdue payments)
- **Purchase Orders** — create, edit, and track POs with product quantities and delivery history
- **Clients** — manage client records with multiple delivery addresses
- **Products** — product catalog with unique reference codes
- **Deliveries** — record shipments with quantity, pricing, payment terms, and document tracking
- **Search** — filter lists by name, code, or PO number
- **Role-based access** — admin/operator roles with gated delete actions
- **Dark mode** — smooth theme transitions with system preference detection
- **Responsive** — mobile-friendly sidebar and touch-optimized UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (recommended) or npm
- A [Supabase](https://supabase.com) project with the database schema applied

### Setup

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd SakuraRecords
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy the environment file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
pnpm build
```

Output is in `dist/`. Preview locally with `pnpm preview`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn-vue](https://www.shadcn-vue.com/) (Reka UI) |
| Icons | [Lucide](https://lucide.dev/) |
| Forms | [Zod](https://zod.dev/) validation, [VeeValidate](https://vee-validate.logaretm.com/) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Utilities | [VueUse](https://vueuse.org/) |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar, TopNav, UserMenu
│   ├── dashboard/       # DashboardView, StatCard, RecentPOList
│   ├── po/              # PO list/create/detail/edit, DeliveryForm/Table
│   ├── clients/         # Client list/create/detail/edit, AddressForm/List
│   ├── products/        # Product list/create/detail/edit
│   └── ui/              # shadcn-vue components
├── composables/         # useAuth, useTheme, usePurchaseOrders, useClients, useProducts
├── lib/
│   ├── supabase.ts      # Supabase client singleton
│   ├── format.ts        # formatCurrency, formatDate
│   └── schemas.ts       # Zod validation schemas
├── router/              # Vue Router config with auth guards
└── views/               # LoginView
```

## Database

The schema uses 8 tables: `client`, `address`, `product`, `purchase_order`, `po_product` (pivot), `delivery`, `transaction_document`, and `delivery_requirement`.

> [!NOTE]
> See [`docs/schema.md`](docs/schema.md) for the full ERD with constraints, and [`CONTEXT.md`](CONTEXT.md) for the domain glossary.

Key design decisions:
- **`payment_terms` is per-delivery**, not per-PO (terms vary per shipment)
- **PO number is user-supplied** (e.g., `PO-2026-001`), not auto-generated
- **All monetary values are Philippine peso** — no currency column
- **Soft deletes** via `deleted_at` on all tables

## Architecture Decisions

The [`docs/adr/`](docs/adr/) directory contains Architecture Decision Records covering soft-delete strategy, PO-product pivot design, identifier choices, data validation, and RLS policies. Read these before making schema or data model changes.
