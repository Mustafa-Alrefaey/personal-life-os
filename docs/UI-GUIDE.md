# Personal Life OS — Frontend UI Guide

Complete reference for design system, components, libraries, styles, and architecture.

---

## Table of Contents

1. [Tech Stack & Libraries](#1-tech-stack--libraries)
2. [Design Tokens & Colors](#2-design-tokens--colors)
3. [Typography](#3-typography)
4. [Themes](#4-themes)
5. [Layout — Sidebar & Navbar](#5-layout--sidebar--navbar)
6. [UI Components](#6-ui-components)
7. [Global CSS Classes](#7-global-css-classes)
8. [State Management (Stores)](#8-state-management-stores)
9. [API Services](#9-api-services)
10. [Routing & Auth Guard](#10-routing--auth-guard)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Utilities](#12-utilities)
13. [Pages Overview](#13-pages-overview)
14. [File Structure](#14-file-structure)

---

## 1. Tech Stack & Libraries

| Library | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI framework |
| `react-dom` | ^19.2.0 | DOM rendering |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `zustand` | ^5.0.11 | Lightweight global state management |
| `@tanstack/react-query` | ^5.90.21 | Server state caching & fetching |
| `axios` | ^1.13.6 | HTTP client with interceptors |
| `i18next` | ^25.8.14 | Internationalization core |
| `react-i18next` | ^16.5.4 | React bindings for i18next |
| `react-datepicker` | ^9.1.0 | Date picker (uses @floating-ui internally) |
| `recharts` | ^3.8.0 | Charts (dashboard) |
| `tailwindcss` | ^4.2.1 | Utility-first CSS (v4 — no config required) |
| `vite` | ^7.3.1 | Build tool & dev server |
| `typescript` | ~5.9.3 | Type safety |

**Dev Server:** `http://localhost:5173`
**Build command:** `npm run build` (runs `tsc -b && vite build`)

---

## 2. Design Tokens & Colors

All colors are CSS custom properties defined in `src/index.css`. Use `var(--token-name)` anywhere.

### Backgrounds

| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#f7f5f0` (warm cream) | `#1a1814` |
| `--bg-surface` | `#ffffff` | `#252320` |
| `--bg-subtle` | `#ede9e0` | `#2e2c29` |
| `--bg-muted` | `#e2ddd5` | `#363330` |
| `--bg-sidebar` | `#f0ece4` | `#1e1c1a` |
| `--bg-input` | `#ffffff` | `#2a2825` |
| `--bg-row-hover` | `#f0ece4` | `#2e2c28` |

### Text

| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#111009` | `#f0ede8` |
| `--text-secondary` | `#2e2b28` | `#c8c4be` |
| `--text-muted` | `#706a63` | `#8a847d` |

### Borders

| Token | Light | Dark |
|---|---|---|
| `--border-default` | `#d5cfc6` | `#3a3835` |
| `--border-subtle` | `#e8e3da` | `#302e2b` |
| `--border-focus` | `#c96030` | `#c96030` |

### Accent (Terracotta)

| Token | Value |
|---|---|
| `--accent` | `#c96030` |
| `--accent-hover` | `#b05428` |
| `--accent-active` | `#9a4820` |
| `--accent-light` | `#fef3ec` (light) / `#2a1a10` (dark) |
| `--accent-text` | `#ffffff` |

### Semantic Colors

| Intent | Token | Light | Dark |
|---|---|---|---|
| Success | `--success` | `#1a7a40` | `#3ecf6e` |
| Warning | `--warning` | `#a85d00` | `#f4b740` |
| Danger | `--danger` | `#bf1b1b` | `#f07070` |
| Info | `--info` | `#1a65a8` | `#5ba0f0` |

Each semantic color also has `--success-bg`, `--success-border`, `--warning-bg`, etc. variants.

### Shadows

| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle card lift |
| `--shadow-sm` | Default card shadow |
| `--shadow-md` | Modal, dropdown |
| `--shadow-lg` | Overlays, floating elements |

---

## 3. Typography

**Font family:** `Tajawal` (Google Fonts, weights 300/400/500/700/800) — supports Arabic & Latin
**Fallback:** `ui-sans-serif, system-ui, sans-serif`

Applied globally on `body`. RTL-aware — font renders correctly in both `dir="ltr"` and `dir="rtl"`.

---

## 4. Themes

### Light Mode (default `:root`)
Warm cream base with terracotta accent.

### Dark Mode (`.dark` class on `<html>`)
Toggled via `themeStore`. Reads system preference on first visit, then persists to `localStorage` key `"theme"`.

### Ramadan Theme (`data-ramadan="true"` on `<html>`)
Special festive theme active **18 Feb – 19 Mar 2026 (Ramadan 1447)**:

**Light Ramadan:**
- Accent: `#c8881c` (golden amber)
- Background: `#f5f0e3` (warmer cream)

**Dark Ramadan:**
- Background: `#070520` (deep midnight indigo)
- Accent: `#d4a820` (rich gold)
- Body: radial gradient — indigo center with dark edges
- Cards: faint gold `1px` border outline

Auto-enables during Ramadan window. User can toggle via `ramadanStore.setEnabled()`. Preference persists in `localStorage` key `"ramadan-enabled"`.

---

## 5. Layout — Sidebar & Navbar

### Sidebar (Desktop)

- **Width:** `224px` expanded / `60px` collapsed
- **Animation:** width transition `0.28s ease`
- **Sticky:** fixed to left side, full height
- **Toggle:** chevron button at top, state persists in `localStorage` key `"sidebar-collapsed"`

**Sidebar sections:**
1. **Logo** — "PL" badge in accent color + Ramadan star overlay (when active)
2. **Navigation** — 7 routes with SVG icons (16×16):
   - Dashboard, Tasks, Bills, Transactions, Receipts, Journal, Profile
3. **Bottom controls:**
   - Language toggle (`EN` / `ع`)
   - Dark mode toggle (sun/moon icon)
   - User avatar (circular, accent-light bg, first letter of name)
   - Logout button (danger color)
   - Collapsed mode: icon-only; Expanded: icon + label

**Active nav item:** `background: var(--accent-light)`, `color: var(--accent)`

### Mobile Header

Visible on `< md` breakpoint only:
- Sticky top bar with hamburger menu button
- App logo + name
- Dark mode toggle

Mobile sidebar opens as a full-height overlay (`z-50`) with backdrop blur. Slide-in animation (`panelSlideInRTL` for RTL, standard for LTR).

### Main Content Area

- `.page-enter` fade-up animation on route change (`0.28s`)
- Max width: `5xl` container with `1.5rem` padding
- Ramadan banner renders above main content (outside route key to avoid re-animation)
- Footer: copyright + current year

---

## 6. UI Components

All in `src/components/ui/`.

### `Modal`
Centered overlay portal rendered to `document.body`.
```tsx
<Modal open={bool} onClose={fn} title="string" maxWidth="520px">
  {children}
</Modal>
```
- Backdrop: `rgba(0,0,0,0.45)` + `backdrop-filter: blur(2px)`
- Disables body scroll when open
- Enter animation: scale `0.95→1` + translateY `8px→0` over `0.18s`
- **Does NOT close on backdrop click or Escape** (must use X button)

### `ConfirmDialog`
Accessible confirmation dialog.
```tsx
<ConfirmDialog
  open={bool}
  title="string"
  message="string"
  confirmLabel="Delete"    // optional
  cancelLabel="Cancel"     // optional
  variant="danger"         // 'danger' | 'warning'
  loading={bool}
  onConfirm={fn}
  onCancel={fn}
/>
```
- ARIA: `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- Cancel button auto-focused on open
- Escape key closes

### `Pagination`
```tsx
<Pagination
  page={currentPage}
  totalPages={totalPages}
  onPageChange={setPage}
  totalItems={filtered.length}
  pageSize={PAGE_SIZE}
/>
```
- Hides when `totalPages <= 1`
- Shows `X–Y of Z` item count
- Ellipsis for large page ranges
- Active page: accent background
- Button size: `1.5rem` height, `0.7rem` font
- **Page size across all pages: 6 items**

### `AppDatePicker`
Styled wrapper around `react-datepicker`.
```tsx
<AppDatePicker
  value="2024-01-15"         // YYYY-MM-DD string
  onChange={(val) => ...}    // returns YYYY-MM-DD
  placeholder="Select date"
  required={bool}
  minDate={new Date()}
/>
```
- Calendar icon (left, pointer-events-none)
- Clear (×) button (right, shown when date selected)
- Format displayed: `dd/MM/yyyy`
- Popper placement: `bottom-start`

### `AppSelect`
Custom keyboard-navigable dropdown (not native `<select>`).
```tsx
<AppSelect
  value="Work"
  onChange={(val) => ...}
  options={[{ value: 'Work', label: 'Work' }, ...]}
  placeholder="Select category"
/>
```
- Keyboard: `Enter`/`Space`/`↓` opens, `Escape` closes, `↑↓` navigates, `Enter` selects
- Checkmark on selected option
- Click-outside closes

### `Toast`
Global notification system via context.
```tsx
const { showToast } = useToast();
showToast('Saved successfully', 'success'); // 'success' | 'error' | 'info'
```
- Auto-dismiss: visible `2.8s`, slides out by `3.3s`
- Position: bottom-right (bottom-left in RTL)
- Provider wraps app at root level

### `Spinner` / `PageLoader`
```tsx
<Spinner size="sm" />   // 'sm' | 'md' | 'lg'
<PageLoader message="Loading..." />
```
- Color: `var(--accent)` border-top
- Sizes: `16px` / `32px` / `48px`

### `DarkModeToggle`
```tsx
<DarkModeToggle />
```
Sun icon (light mode) / Moon icon (dark mode). Calls `themeStore.toggleTheme()`.

### `RamadanBanner`
```tsx
<RamadanBanner />
```
Renders only when `ramadanStore.enabled === true`. Features animated twinkling stars (15), crescent moon SVG with glow, golden text. Dark gradient background.

---

## 7. Global CSS Classes

Defined in `src/index.css`, usable anywhere.

### Buttons
```
.btn              Base button (padding, border-radius, font-weight, transition)
.btn-sm           0.8125rem font, smaller padding
.btn-md           0.875rem font
.btn-lg           0.9375rem font

.btn-primary      Accent background (#c96030), white text
.btn-secondary    Subtle background, secondary text
.btn-ghost        Transparent, secondary text, subtle hover
.btn-danger       Danger background
.btn-success      Success background
.btn-accent-light Accent-light background, accent text
```
Active: `transform: scale(0.97)`. Hover: `filter: brightness(...)`.

### Cards
```
.card             Surface background + border + shadow-xs
.interactive-card .card + hover lift (translateY -1px + shadow-sm)
```

### Badges
```
.badge            Base inline-flex pill (0.6875rem, border-radius 999px)
.badge-success    Green
.badge-warning    Amber
.badge-danger     Red
.badge-accent     Terracotta
.badge-muted      Muted gray
```

### Animations
```
.page-enter       fadeUp (opacity 0→1, translateY 10px→0) over 0.28s
.modal-enter      scale 0.95→1 + translateY 8px→0 over 0.18s
.nav-label        fadeIn with 0.08s delay (sidebar label appear)
```

---

## 8. State Management (Stores)

Using **Zustand** (`src/stores/`).

### `authStore`
```ts
user: User | null
isAuthenticated: boolean
isInitialized: boolean
setUser(user)     // called after login/register
logout()          // clears localStorage + state
initialize()      // called on app boot, loads from localStorage
```

### `themeStore`
```ts
isDarkMode: boolean
toggleTheme()       // toggles dark class on <html>
initializeTheme()   // reads localStorage or system preference
```

### `ramadanStore`
```ts
enabled: boolean
setEnabled(bool)    // persists to localStorage, sets data-ramadan on <html>
```
Auto-enables between `2026-02-18` and `2026-03-19`.

### `sidebarStore`
```ts
collapsed: boolean
toggle()    // persists to localStorage key "sidebar-collapsed"
```

---

## 9. API Services

Base URL: `http://localhost:5207/api`
File: `src/services/api.ts`

**Request interceptor:** Injects `Authorization: Bearer {token}` from `localStorage`. Skips `Content-Type` header for `FormData` (file uploads).

**Response interceptor:** On `401` → clears storage + redirects to `/login`.

### Services

| File | Methods |
|---|---|
| `auth.service.ts` | `register()`, `login()`, `logout()`, `isAuthenticated()`, `getCurrentUser()` |
| `task.service.ts` | `getAllTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `completeTask()`, `uncompleteTask()` |
| `receipt.service.ts` | `getAllReceipts()`, `createReceipt(data, file, onProgress?)`, `updateReceipt()`, `updateReceiptImage(id, file, onProgress?)`, `deleteReceipt()` |
| `bill.service.ts` | `getAllBills()`, `createBill()`, `updateBill()`, `markAsPaid()`, `markAsUnpaid()`, `deleteBill()` |
| `journal.service.ts` | `getAllJournals()`, `createJournal()`, `updateJournal()`, `deleteJournal()` |
| `transaction.service.ts` | `getAllTransactions()`, `createTransaction()`, `updateTransaction()`, `deleteTransaction()` |
| `dashboard.service.ts` | `getDashboard()` |

**Receipt images** are stored on Google Drive. `imagePath` field contains the Drive file ID. Display URL: `https://drive.google.com/thumbnail?id={fileId}&sz=w200`.

---

## 10. Routing & Auth Guard

**Router:** React Router v7, defined in `src/App.tsx`.

| Path | Component | Protected |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/` | `DashboardPage` | Yes |
| `/tasks` | `TasksPage` | Yes |
| `/bills` | `BillsPage` | Yes |
| `/transactions` | `TransactionsPage` | Yes |
| `/receipts` | `ReceiptsPage` | Yes |
| `/journal` | `JournalPage` | Yes |
| `/profile` | `ProfilePage` | Yes |

**`ProtectedRoute`** (`src/components/layout/ProtectedRoute.tsx`):
- Waits for `isInitialized` (shows `<PageLoader />`)
- Redirects to `/login` if not authenticated

---

## 11. Internationalization (i18n)

**Languages:** English (`en`) and Arabic (`ar`)
**Persistence:** `localStorage` key `"lang"`
**Default:** `"en"`

**RTL:** Arabic sets `<html dir="rtl" lang="ar">`. Applied before React mounts to prevent layout flicker.

**Translation structure** (`src/i18n/en.json`, `ar.json`):
```
nav.*         Sidebar navigation labels
auth.*        Login, register, validation messages
dashboard.*   Stats, greetings, empty states
tasks.*       CRUD labels, status labels, priority labels
bills.*       CRUD labels, paid/unpaid
receipts.*    CRUD labels, upload progress
transactions.*CRUD labels, income/expense
journal.*     CRUD labels, search
categories.*  Work, Personal, Health, Finance, Shopping, Learning, Salary, etc.
common.*      Cancel, delete, confirm, date filters, error messages
ramadan.*     Banner greeting and subtext
```

**Usage:**
```tsx
const { t, i18n } = useTranslation();
t('tasks.created')          // → "Task created successfully"
i18n.changeLanguage('ar')   // switch to Arabic
```

---

## 12. Utilities

### `formatDate(value)` → `string`
Returns `dd/mm/yyyy` (en-GB locale). Returns `"—"` for null/invalid.

### `formatDateLong(value, locale)` → `string`
Returns `"Monday, 1 January 2024"` style. Maps `"en"` → `"en-GB"` to ensure day-before-month order.

### `CATEGORY_I18N_KEYS` (from `categoryLabel.ts`)
Maps raw category strings to i18n keys:
```ts
'Work' → 'categories.work'
'Food & Dining' → 'categories.foodDining'
'Salary' → 'categories.salary'
// ... 18 categories total
```

---

## 13. Pages Overview

All pages use the same pattern:
- `useQuery` for data fetching (TanStack Query)
- `useMutation` for create/update/delete
- Client-side filtering (search + date range + status)
- `Pagination` component (6 items per page)
- `Modal` for create/edit forms
- `ConfirmDialog` for delete confirmation
- `useToast` for success/error feedback

| Page | Route | Key Features |
|---|---|---|
| `DashboardPage` | `/` | Stats cards, recharts bar/pie charts |
| `TasksPage` | `/tasks` | Status + priority filter, complete toggle (circle button), soft delete |
| `BillsPage` | `/bills` | Paid toggle, overdue detection, reminder days |
| `TransactionsPage` | `/transactions` | Income/Expense filter, balance summary cards |
| `ReceiptsPage` | `/receipts` | Image upload to Google Drive, thumbnail preview, lightbox |
| `JournalPage` | `/journal` | **Grid layout** (1→2→3 columns), notes clamped to 5 lines |
| `ProfilePage` | `/profile` | User info display |

---

## 14. File Structure

```
frontend/
├── src/
│   ├── main.tsx                    Entry point
│   ├── App.tsx                     Router + QueryClient + ToastProvider
│   ├── index.css                   Design system (CSS vars, global classes)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      Sidebar + mobile header + page wrapper
│   │   │   └── ProtectedRoute.tsx  Auth guard
│   │   └── ui/
│   │       ├── AppDatePicker.tsx
│   │       ├── AppSelect.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── DarkModeToggle.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       ├── RamadanBanner.tsx
│   │       ├── Spinner.tsx
│   │       └── Toast.tsx
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── BillsPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── ReceiptsPage.tsx
│   │   ├── JournalPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   ├── ramadanStore.ts
│   │   └── sidebarStore.ts
│   │
│   ├── services/
│   │   ├── api.ts                  Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── task.service.ts
│   │   ├── receipt.service.ts
│   │   ├── bill.service.ts
│   │   ├── journal.service.ts
│   │   └── transaction.service.ts
│   │
│   ├── types/
│   │   ├── task.ts
│   │   ├── bill.ts
│   │   ├── receipt.ts
│   │   ├── transaction.ts
│   │   └── journal.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   └── categoryLabel.ts
│   │
│   └── i18n/
│       ├── index.ts                i18next setup + RTL init
│       ├── en.json
│       └── ar.json
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```
