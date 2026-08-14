# SakuraRecords — UI/UX Design Spec

## Overview

SakuraRecords is a client management and delivery tracking system for a small Philippine business. Two users: Admin (developer) and Operator (non-tech-savvy). Primary workflow: create POs with deliveries, view quarterly reports. Accessed on phone + laptop.

**Tech stack:** Vue 3 + Vite + TypeScript, Tailwind CSS, shadcn-vue, Supabase, deployed on Cloudflare Pages.

**Design principles:**
- Mobile-first responsive design
- Large touch targets, minimal navigation depth
- Clean, minimal aesthetic with lavender/purple accents
- Optimize for the Operator's simplicity over power-user efficiency

---

## 1. Navigation & Layout

### Phone

- **Hamburger menu** (top-left) triggers a slide-out sidebar
- Sidebar contains: Dashboard, POs, Clients, Products, Reports
- Prominent **"+ New PO"** button at the top of the sidebar
- Main content area takes full width
- **Back button** in the header when navigating deeper (e.g., PO detail → delivery form)
- **Sidebar close:** Tap outside the sidebar OR tap the X button (both work)

### Desktop

- **Top nav bar** with sections: Dashboard, POs, Clients, Products, Reports
- **"+ New PO"** button in the top-right, always visible
- Content area with comfortable max-width (1200px, centered)

### Consistent Across Both

- Header always shows current section name
- **User avatar/menu** (top-right) with role indicator and logout
- Lavender/purple accent color on active nav items and primary CTAs
- shadcn-vue components throughout (Button, Input, Select, Table, Dialog, etc.)

---

## 2. Dashboard (Home Screen)

What the Operator sees when opening the app. Optimized for at-a-glance awareness.

### Quick Stats Row

Two rows of stats — monthly and quarterly:

**Monthly stats** (2×2 grid on phone, row on desktop):

| Card | Description |
|------|-------------|
| **Open POs** | Count of POs with remaining undelivered quantity (non-soft-deleted) |
| **Deliveries This Month** | Count of deliveries in current month |
| **Gross Sales This Month** | Sum of (shipped_quantity × unit_price) for current month |
| **Overdue Payments** | Count of unpaid deliveries where `delivery_date + payment_terms < today` |

**Quarterly stats** (same layout):

| Card | Description |
|------|-------------|
| **Deliveries This Quarter** | Count of deliveries in current quarter |
| **Gross Sales This Quarter** | Sum of (shipped_quantity × unit_price) for current quarter |

### Search Bar

Prominently placed above the PO list. **Hybrid search:**
- Typing filters the recent POs list client-side (fast, no network)
- When no local matches exist, a **"Search all POs"** link appears below the list — tapping it triggers a server-side search via Supabase
- Searches by PO number or client name

### Recent POs List

Last 10 POs displayed as a list/cards:

- **PO number** (bold, primary text)
- **Client name** (secondary text)
- **Delivery count** / product count (e.g., "3 deliveries, 2 products")
- **Date created**
- Tap/click → navigates to PO detail

**Empty state:** When no POs exist, show an `Empty` component with message "No purchase orders yet" and a "+ Create your first PO" CTA button.

### "+ New PO" FAB

Floating action button on phone (bottom-right corner). On desktop, the top-right nav button serves this purpose. Always visible from the dashboard.

---

## 3. PO Creation Flow (Two-Phase)

The primary workflow. Two clear phases, each with its own screen.

### Phase 1: Create PO

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| PO Number | Text input | Yes | User-supplied VARCHAR ID, must be unique |
| Client | Searchable dropdown | Yes | Searches by client name |
| Notes | Textarea | No | Freeform notes |

**Products section** (below the form):

- **"+ Add Product"** button opens a Sheet (side panel on desktop, bottom drawer on mobile)
- Sheet contains: product searchable dropdown + ordered quantity input
- Added products appear as a table:

| Product | Code | Ordered Qty | Edit | Remove |

- **Minimum:** At least one product with quantity > 0

**Validation:**
- PO number uniqueness: **check on blur** (query Supabase when user leaves the field) + DB constraint as fallback
- Client required
- At least one product required
- Ordered quantity ≥ 0

**Actions:**
- **"Save PO"** button → creates the PO and navigates to Phase 2 (PO detail)
- **"Cancel"** → returns to dashboard without saving

### Phase 2: PO Detail View (after creation)

After saving, the Operator lands directly on the PO detail page.

**PO Info header:**
- PO number (large, bold)
- Client name
- Notes (if any)
- Edit button (pencil icon) — opens PO edit form

**Products section (informational):**

Table showing ordered products with quantities:

| Product | Code | Ordered Qty | Shipped Qty | Remaining |
|---------|------|-------------|-------------|-----------|

- `Remaining = Ordered Qty - Shipped Qty` (sum of all non-soft-deleted deliveries for that product)
- When remaining = 0, the product is grayed out in the delivery form dropdown
- Products are "part of" the PO once at least one delivery exists for them

**"+ Add Delivery" button** — prominent, top-right of the deliveries section

**Deliveries section:**

Table of deliveries logged for this PO (excluding soft-deleted):

| Date | Product | Shipped Qty | Unit Price | Total (₱) | Address | Paid | Actions |
|------|---------|-------------|------------|-----------|---------|------|---------|

- `Total = Shipped Qty × Unit Price`
- **Paid** column: `Switch` component (green = paid, gray = unpaid). Tap to toggle.
- **Actions:** Edit (pencil), Delete (trash icon — soft delete for Operator, hard delete for Admin)

### PO Edit

**Editable fields:** Notes and Products (with delivery guard).
**Locked:** Client cannot be changed after creation.

**Delivery guard:** A product can only be removed from the PO if it has zero deliveries. If it has deliveries, show a warning: "This product has X deliveries and cannot be removed."

---

## 4. Delivery Form

Opened via "+ Add Delivery" button on the PO detail page. **Uses a `Sheet` component** (side panel on desktop, bottom drawer on mobile). Keeps the PO detail visible underneath.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product | Dropdown | Yes | Filtered to products in this PO with remaining qty > 0 |
| Shipped Quantity | Number input | Yes | Validated: must be ≤ remaining quantity for selected product |
| Unit Price | Number input (₱) | Yes | Price per unit |
| Delivery Date | Date picker | Yes | Date of shipment |
| Address | Dropdown | Yes | Filtered to addresses belonging to this PO's client |
| Payment Terms | Number input (days) | Yes | Default: 30 |
| Transaction Document | Dropdown | Yes | From `transaction_document` lookup table |
| Delivery Requirement | Dropdown | Yes | From `delivery_requirement` lookup table |

**If client has no addresses:** Show an inline "Add Address" form within the Sheet (label + address text fields). No need to leave the delivery flow.

### Validation

- **Client-side (Zod + VeeValidate):** Immediate feedback on field errors. Shipped quantity checked against remaining quantity before submission.
- **Server-side (PostgreSQL trigger):** Same calculation enforced at the database level as a safety net.

### Behavior

- After saving, the Sheet closes and the delivery appears in the PO detail deliveries table
- The product's "Remaining" quantity updates immediately (optimistic or refetched)
- If remaining reaches 0, that product is removed from the delivery form dropdown
- **"Cancel"** closes the Sheet without saving

### Edit Delivery

Same form as creation, pre-filled with existing values. Opens when clicking the edit (pencil) icon on a delivery row.

---

## 5. Entity Management

### Clients

**List view:** Table with columns:

| Name | # of POs | # of Addresses | Created |

- Soft-deleted clients hidden by default
- Admin can toggle to show soft-deleted records
- Click row → Client detail page
- **Empty state:** `Empty` component with "No clients yet" + "Add your first client" CTA

**"+ New Client" button** → form (Sheet):
- Name — text input, required

**Client Detail page:**
- Client info (name, created date, updated date)
- **Addresses section:** List of addresses with name + address text
  - "+ Add Address" button → form (Sheet): Label (name) + Address text, both required
  - Edit/delete actions on each address
- **POs section:** List of POs for this client (clickable links to PO detail)

### Products

**List view:** Table with columns:

| Name | Code | Description | # of POs | Created |

- Soft-deleted products hidden by default
- Click row → Product detail page
- **Empty state:** `Empty` component with "No products yet" + "Add your first product" CTA

**"+ New Product" button** → form (Sheet):
- Name — text input, required
- Code — text input, required, must be unique
- Description — optional textarea

**Product Detail page:**
- Product info (name, code, description)
- **Usage info:** Which POs this product appears in (linked to PO detail)

### Addresses

Not a standalone screen. Managed within the Client detail page (see above).

### Soft Delete Behavior

- **Operator:** Can soft-delete clients, products, addresses, deliveries, transaction_documents, delivery_requirements (sets `deleted_at`). Cannot hard-delete. Matches ADR-0006.
- **Admin:** Can soft-delete and hard-delete all entities. POs and deliveries can only be soft-deleted (historical records).

---

## 6. Reporting

### Reports Page

**Date range picker** at the top:

- Preset buttons: This Quarter, Last Quarter, This Year
- **Quarter definition:** Philippine fiscal year (April–March). **TBD: confirm with Operator.**
  - Q1: Apr–Jun, Q2: Jul–Sep, Q3: Oct–Dec, Q4: Jan–Mar
- Custom range: start date + end date pickers

### Three Report Tabs/Cards

**Note:** All reports exclude soft-deleted deliveries. Charts use Unovis via shadcn-vue `Chart` component.

#### 1. Quantity Per Product Per Month

- **Bar chart:** Monthly breakdown of shipped quantities per product
- **Data table:** Product | Jan | Feb | Mar | ... | Total
- Source: `SUM(delivery.shipped_quantity)` WHERE delivery.deleted_at IS NULL, GROUP BY product, month(delivery_date)

#### 2. Client Gross Sales Per Month

- **Bar chart:** Monthly breakdown of gross sales per client
- **Data table:** Client | Jan | Feb | Mar | ... | Total
- Source: `SUM(shipped_quantity × unit_price)` WHERE delivery.deleted_at IS NULL, JOIN purchase_order GROUP BY client, month

#### 3. Product Gross Sales Per Month

- **Bar chart:** Monthly breakdown of gross sales per product
- **Data table:** Product | Jan | Feb | Mar | ... | Total
- Source: `SUM(shipped_quantity × unit_price)` WHERE delivery.deleted_at IS NULL, JOIN product GROUP BY product, month

### Responsive Behavior

- **Phone:** Charts stack vertically, tables scroll horizontally
- **Desktop:** Charts and tables can be side by side

### Export

**"Download CSV"** button on each report for offline use.

---

## 7. Authentication

### Login Screen

- Clean, centered form
- Email input
- Password input
- "Sign In" button
- Error message on invalid credentials
- No public signup — pre-seeded accounts only

### Session

- Supabase Auth manages sessions
- Auto-redirect to login if session expires
- No "remember me" — sessions persist until logout or expiry

---

## 8. Settings & Admin

Accessible from the user avatar menu (top-right). Admin-only sections marked.

### Lookup Tables (Admin)

- **Transaction Documents** — list + add/edit/delete
- **Delivery Requirements** — list + add/edit/delete
- Simple CRUD: list view + inline add/edit form (Sheet)

### Data Management (Admin)

- Toggle to view soft-deleted records across all entities
- Hard delete capability (permanent removal)

### User Menu (Both Roles)

Dropdown from avatar:
- Role badge (Admin / Operator)
- Settings link (Admin only)
- Logout button

---

## 9. Visual Design

### Color Palette

- **Primary:** Lavender/purple accent (#7C3AED or similar Tailwind violet-600)
- **Background:** White / very light gray
- **Text:** Dark gray / black
- **Success:** Green
- **Warning:** Amber
- **Error:** Red
- **Muted:** Gray-400 for secondary text

**Note:** The ui-ux-pro-max design system analysis recommended blue (#2563EB) as the primary color for a "Real-Time / Operations" pattern. The user explicitly chose lavender/purple instead — this is a user override.

### Typography

- **Font:** Inter (clean, minimal, Swiss style — recommended by design system analysis)
- Clear hierarchy: large headings for page titles, bold for key data, regular for body
- Base 16px, line-height 1.5

### Touch Targets

- Minimum 44×44px tap targets on mobile (per Apple HIG)
- Generous padding on buttons and list items
- Clear visual feedback on tap (hover states on desktop)

### Components

All from shadcn-vue (Reka UI primitives):

| Need | Component |
|------|-----------|
| Buttons/actions | `Button` with appropriate variant |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Textarea` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `Tabs`, `DropdownMenu` |
| Overlays | `Sheet` (side panel — used for delivery form, entity forms) |
| Feedback | `vue-sonner` (toast), `Alert`, `Skeleton`, `Spinner` |
| Empty states | `Empty` |
| Charts | `Chart` (Unovis) |
| Layout | `Card`, `Separator`, `ScrollArea` |

---

## 10. Routing Structure

```
/                          → Dashboard (home)
/login                     → Login page
/po                        → PO list
/po/new                    → Create PO (Phase 1)
/po/:poNumber              → PO detail (Phase 2)
/po/:poNumber/edit         → Edit PO
/clients                   → Client list
/clients/new               → Create client
/clients/:id               → Client detail
/clients/:id/edit          → Edit client
/products                  → Product list
/products/new              → Create product
/products/:id              → Product detail
/products/:id/edit         → Edit product
/reports                   → Reports page
/settings                  → Settings (Admin only)
```

---

## 11. Component Inventory

### Layout
- `AppLayout.vue` — shell with sidebar (phone) / top nav (desktop)
- `Sidebar.vue` — mobile slide-out navigation (close: tap outside OR X button)
- `TopNav.vue` — desktop navigation bar
- `UserMenu.vue` — avatar dropdown with role, settings, logout

### Dashboard
- `DashboardView.vue` — stats cards + search + recent POs
- `StatCard.vue` — individual stat card
- `RecentPOList.vue` — list of recent POs

### PO
- `POListView.vue` — table of all POs
- `POCreateView.vue` — Phase 1: create PO form
- `PODetailView.vue` — Phase 2: PO info + products + deliveries
- `POEditView.vue` — edit PO (notes + products with delivery guard)
- `POProductTable.vue` — products table on PO detail
- `DeliveryForm.vue` — add/edit delivery in a Sheet (includes inline address creation)
- `DeliveryTable.vue` — deliveries table on PO detail

### Clients
- `ClientListView.vue` — table of all clients
- `ClientCreateView.vue` — create client form (Sheet)
- `ClientDetailView.vue` — client info + addresses + POs
- `ClientEditView.vue` — edit client (Sheet)
- `AddressForm.vue` — add/edit address (Sheet)
- `AddressList.vue` — addresses within client detail

### Products
- `ProductListView.vue` — table of all products
- `ProductCreateView.vue` — create product form (Sheet)
- `ProductDetailView.vue` — product info + usage
- `ProductEditView.vue` — edit product (Sheet)

### Reports
- `ReportsView.vue` — date picker + report tabs
- `QuantityReport.vue` — quantity per product per month
- `ClientSalesReport.vue` — client gross sales per month
- `ProductSalesReport.vue` — product gross sales per month

### Auth
- `LoginView.vue` — login form

### Settings
- `SettingsView.vue` — admin settings
- `LookupTableManager.vue` — manage transaction documents / delivery requirements

### Composables
- `useAuth()` — login, logout, current user, role
- `usePOs()` — PO list, create, update, soft-delete, stats
- `usePO(poNumber)` — single PO with products + deliveries
- `useClients()` — client list, create, update, soft-delete
- `useClient(id)` — single client with addresses + POs
- `useProducts()` — product list, create, update, soft-delete
- `useDeliveries(poId)` — deliveries for a PO, create, update, soft-delete
- `useAddresses(clientId)` — addresses for a client, create, update, soft-delete
- `useReports(dateRange)` — aggregated report data

---

## 12. Architecture & Patterns

### State Management

VueUse composables only — no Pinia. Shared state via `createGlobalState` or `provide`/`inject`.

| State | Pattern |
|-------|---------|
| Current user + role | `createGlobalState` (set on login, read everywhere) |
| Feature-level state (e.g., current PO being edited) | Composable with `ref`/`computed` |
| Deep tree dependencies | `provide`/`inject` with `InjectionKey` |

### Data Fetching

Composables per entity — each encapsulates Supabase queries, loading state, error state, and data.

| Composable | Responsibility |
|------------|---------------|
| `usePOs()` | List, create, update, soft-delete POs |
| `usePO(poNumber)` | Single PO with products + deliveries |
| `useClients()` | List, create, update, soft-delete clients |
| `useClient(id)` | Single client with addresses + POs |
| `useProducts()` | List, create, update, soft-delete products |
| `useDeliveries(poId)` | List, create, update, soft-delete deliveries for a PO |
| `useAddresses(clientId)` | List, create, update, soft-delete addresses for a client |
| `useReports(dateRange)` | Fetch aggregated report data |
| `useAuth()` | Login, logout, current user, role |

Each composable returns: `{ data, loading, error, ...methods }`. Components consume composables — never call Supabase directly.

### Component Architecture (vue-best-practices)

- **Composition API + `<script setup lang="ts">`** throughout
- **Small, focused components** — one responsibility each
- **Props down, events up** — explicit typed contracts via `defineProps`/`defineEmits`
- **Feature folder layout:** `components/<feature>/`, `composables/use<Feature>.ts`
- **View components are thin** — composition surfaces, not feature implementations
- **Split triggers:** If a component has 3+ distinct UI sections, or owns both state and presentational markup, split it

### Data Flow Summary

```
Login → useAuth() → createGlobalState (user, role)
  ↓
Dashboard → usePOs().stats → Supabase queries
  ↓
PO List → usePOs().list → Supabase queries
  ↓
Create PO → usePOs().create() → inserts into purchase_order + po_product
  ↓
PO Detail → usePO(poNumber) → fetches PO + products + deliveries (excludes soft-deleted)
  ↓
Add Delivery → useDeliveries(poId).create() → validates against remaining qty → inserts into delivery
  ↓
Reports → useReports(dateRange) → queries Supabase (excludes soft-deleted) → renders charts + tables
```

---

## 13. Error Handling

- **Validation errors:** Inline field-level errors via VeeValidate (red text below inputs). Zod schemas define the shape, VeeValidate handles the form flow.
- **Server errors:** Toast notifications (vue-sonner, top-right, auto-dismiss after 5s)
- **Network errors:** Toast with retry option
- **Optimistic updates:** UI updates immediately on save, rolls back on failure
- **Loading states:** `Skeleton` loaders for lists, `Spinner` for form submissions (compose with `Button` + `data-icon` + `disabled`)
- **PO number duplicate:** Error message below the PO number field (detected on blur)
- **RLS errors:** If a Supabase query returns empty when data should exist, check RLS policies. The Supabase skill warns: "UPDATE requires a SELECT policy" — without it, updates silently return 0 rows.

---

## 14. VueUse Composables

Use VueUse where it naturally fits. Don't force it, don't avoid it.

| Composable | Usage |
|------------|-------|
| `useBreakpoints` | Responsive layout decisions (phone vs desktop sidebar/top nav) |
| `useDebounceFn` | Debounce search input (client-side filter) |
| `useLocalStorage` | Persist user preferences (if any) |
| `useOnline` | Show offline indicator if network drops |
| `useWindowSize` | Responsive calculations where breakpoints aren't sufficient |
| `useEventListener` | Clean up event listeners in components |
| `onClickOutside` | Close sidebar on tap outside (phone) |
| `useScrollLock` | Lock body scroll when sidebar is open (phone) |

---

## 15. Accessibility

- Semantic HTML (headings, labels, landmarks)
- Keyboard navigation for all interactive elements
- Focus management in Sheets/modals (trap focus, restore on close)
- Color contrast ratios meet WCAG AA (4.5:1 for text)
- Screen reader labels on icons and buttons
- `prefers-reduced-motion` respected (no animations for users who prefer reduced motion)
- All form inputs have associated labels (no placeholder-only inputs)

---

## 16. Implementation Priority

Phase 1 (MVP):
1. Auth (login)
2. Dashboard
3. PO creation + detail (two-phase)
4. Client management
5. Product management

Phase 2:
6. Reports
7. Settings/admin
8. CSV export
9. Polish (animations, loading states, error handling)

---

## 17. Open Questions

- **Quarter definition:** Philippine fiscal year (Apr–Mar) assumed. Confirm with Operator.
