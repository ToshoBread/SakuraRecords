# SakuraRecords — Global Search Dropdown

## Overview

Replace the current keyword-routing search bar with a **live search dropdown** using the shadcn-vue Command component. As the user types 2+ characters, a dropdown appears below the search bar showing matching results across all entities (Clients, Products, Purchase Orders), grouped by type. Clicking a result navigates to its detail page. A global **Cmd+K / Ctrl+K** shortcut focuses the search bar from anywhere.

## Package

- **shadcn-vue Command** — `pnpm dlx shadcn-vue@latest add command`
- Built on reka-ui (already installed), provides `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty`, `CommandSeparator`
- Built-in fuzzy filtering, keyboard navigation, grouping

## New Files

### `src/composables/useSearch.ts`

Central search logic composable.

- On first focus: fetch all clients, products, and POs in parallel (3 Supabase queries, small dataset)
- `search(query)` function: client-side filtering on cached data
- Returns grouped results: `{ clients: Client[], products: Product[], purchaseOrders: PurchaseOrder[] }`
- Caches data, re-fetches on demand (e.g., after creating/deleting an entity)
- Uses existing composables: `useClients`, `useProducts`, `usePurchaseOrders`

### `src/components/layout/SearchDropdown.vue`

Dropdown panel component.

- Renders shadcn-vue `Command` with `CommandInput`, `CommandList`, `CommandGroup` per entity type
- Each `CommandItem` shows entity details:
  - Clients: `name`
  - Products: `name` (code)
  - Purchase Orders: `PO# — Client Name`
- Clicking an item navigates to the detail page via `router.push`
- Shows `CommandEmpty` when no results match
- Positioned absolutely below the search input
- Closes on Escape, click outside, or after navigation

## Modified Files

### `src/components/layout/TopNav.vue`

- Replace current `handleSearch` keyword routing with reactive search
- Wire up `SearchDropdown` below the search input
- Add Cmd+K / Ctrl+K global shortcut using VueUse's `useMagicKeys` + `whenever`
- Show search icon (magnifying glass) + "⌘K" hint on desktop, just icon on mobile

## Data Flow

```
User focuses input → useSearch fetches all entities (parallel)
User types 2+ chars → search(query) filters locally, updates dropdown
User clicks result → router.push to detail page, clear search
User presses Escape / clicks outside → close dropdown
```

## Result Display

Each entity type gets a `CommandGroup` with heading:
- **Clients** — shows `name` (e.g., "Juan Dela Cruz")
- **Products** — shows `name (code)` (e.g., "Tuna Fillet (TF-001)")
- **Purchase Orders** — shows `PO# — Client Name` (e.g., "PO-2026-001 — Juan Dela Cruz")

Max ~6-8 results total, with "View all" links at the bottom of each group if more exist.

## Keyboard Shortcut

- **Cmd+K** (Mac) / **Ctrl+K** (Windows/Linux) — focuses the search input from anywhere
- Implemented via `useMagicKeys()` from `@vueuse/core`
- Visual hint: show "⌘K" badge inside the search input on desktop

## Mobile Considerations

- Search input takes full width in the top nav (existing behavior)
- Dropdown overlays content below, max-height with scroll
- Cmd+K shortcut works (shows "Ctrl+K" on Android/Windows keyboards)
- Touch-friendly: large tap targets on result items
