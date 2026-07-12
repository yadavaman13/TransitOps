# ERP Starter Kit — Complete Component Reference

> **For AI agents:** This is a self-contained ERP component library living at `client/src/features/template/`. Every component has **zero business logic**, **zero API calls**, and **zero external context** outside this folder. The only exception is `Sidebar` and `Breadcrumb`, which import `Link` and `useLocation` from `react-router`. All CSS custom properties are prefixed with `--t-`. All class names are prefixed with `t-`.

---

## Table of Contents

1. [Quick Start — How to Import](#1-quick-start--how-to-import)
2. [Architecture Overview](#2-architecture-overview)
3. [Design Tokens](#3-design-tokens)
4. [Layout Components](#4-layout-components)
   - [AppLayout](#41-applayout)
   - [Sidebar](#42-sidebar)
   - [TopNavbar](#43-topnavbar)
5. [UI Components](#5-ui-components)
   - [Button](#51-button)
   - [Badge](#52-badge)
   - [Card](#53-card)
   - [StatCard](#54-statcard)
   - [Dropdown](#55-dropdown)
6. [Form Components](#6-form-components)
   - [Input](#61-input)
   - [Select](#62-select)
   - [DatePicker](#63-datepicker)
   - [Form System (Form, FormSection, FormRow, FormActions)](#64-form-system)
7. [Data Display Components](#7-data-display-components)
   - [DataTable](#71-datatable)
   - [Tabs](#72-tabs)
8. [Navigation Components](#8-navigation-components)
   - [Breadcrumb](#81-breadcrumb)
   - [SearchBar](#82-searchbar)
9. [Overlay Components](#9-overlay-components)
   - [Modal](#91-modal)
   - [ConfirmDialog](#92-confirmdialog)
10. [Feedback Components](#10-feedback-components)
    - [Toast / useToast / ToastProvider](#101-toast--usetoast--toastprovider)
11. [Dashboard Components](#11-dashboard-components)
    - [FilterPanel](#111-filterpanel)
12. [Template Pages (Reference Implementations)](#12-template-pages-reference-implementations)
    - [DashboardTemplatePage](#121-dashboardtemplatepage)
    - [CrudTemplatePage](#122-crudtemplatepage)
    - [TemplateDemoLayout](#123-templatedemolayout)
13. [Composition Patterns — What to Use Where](#13-composition-patterns--what-to-use-where)
14. [Global Setup Checklist](#14-global-setup-checklist)

---

## 1. Quick Start — How to Import

Everything is exported from a single barrel file.

```js
// Barrel import — always use this path
import {
  AppLayout,
  Sidebar,
  TopNavbar,
  Button,
  Badge,
  Card,
  StatCard,
  Dropdown,
  Input,
  Select,
  DatePicker,
  Form,
  FormSection,
  FormRow,
  FormActions,
  DataTable,
  Tabs,
  Breadcrumb,
  SearchBar,
  Modal,
  ConfirmDialog,
  ToastProvider,
  useToast,
  FilterPanel,
} from '@/features/template';
```

> **Template pages must be imported directly** (they are excluded from the barrel to avoid circular deps):
```js
import DashboardTemplatePage from '@/features/template/pages/DashboardTemplatePage';
import CrudTemplatePage      from '@/features/template/pages/CrudTemplatePage';
```

> **Styles must be imported once** at the root layout level:
```js
import '@/features/template/styles/index.scss';
```

---

## 2. Architecture Overview

```
client/src/features/template/
├── index.js                      ← Master barrel export (all named exports here)
├── styles/
│   ├── _variables.scss           ← All --t- CSS custom properties (source of truth)
│   ├── _mixins.scss              ← SCSS mixins (respond-to, etc.)
│   ├── _reset.scss               ← Base CSS reset
│   └── index.scss                ← Imports _variables, _reset (import this once at app root)
├── components/
│   ├── layout/                   ← AppLayout, Sidebar, TopNavbar
│   ├── ui/                       ← Button, Badge, Card, StatCard, Dropdown
│   ├── forms/                    ← Input, Select, DatePicker, Form
│   ├── data-display/             ← DataTable, Tabs
│   ├── navigation/               ← Breadcrumb, SearchBar
│   ├── overlays/                 ← Modal, ConfirmDialog
│   ├── feedback/                 ← ToastProvider, useToast
│   └── dashboard/                ← FilterPanel
├── pages/
│   ├── TemplateDemoLayout.jsx    ← Demo shell (copy/adapt as your feature shell)
│   ├── DashboardTemplatePage/    ← Copy-paste ready dashboard page
│   └── CrudTemplatePage/         ← Copy-paste ready CRUD page
└── hooks/
    └── useToast.js               ← Re-export shortcut for useToast
```

### Key Rules (enforced by design)

| Rule | Detail |
|------|--------|
| **No API calls** | Components receive all data as props. API calls happen in the parent page/feature. |
| **No global context** | No Redux, no React Query, no context reads (except `useToast` inside `ToastProvider`). |
| **CSS isolation** | All CSS variables start with `--t-`. All class names start with `t-`. Never clash with app styles. |
| **Prop-driven** | Every configurable behaviour is driven by a prop, not an internal toggle. |

---

## 3. Design Tokens

All tokens live in `styles/_variables.scss` as CSS custom properties. Use them in any inline style or SCSS file.

### Colors

| Token | Value | Use |
|-------|-------|-----|
| `--t-primary` | `#714b67` | Primary brand purple — main CTAs, active states |
| `--t-primary-hover` | `#5f3954` | Hover state for primary elements |
| `--t-on-primary` | `#ffffff` | Text on primary background |
| `--t-primary-faint` | `rgba(113,75,103,0.08)` | Light tinted backgrounds |
| `--t-bg-app` | `#f4f2f8` | App page background |
| `--t-bg-sidebar` | `#ffffff` | Sidebar background |
| `--t-bg-card` | `#ffffff` | Card surface |
| `--t-bg-input` | `#f9f8fc` | Input field fill |
| `--t-text-main` | `#1f1a37` | Primary text |
| `--t-text-muted` | `#6a6779` | Secondary / placeholder text |
| `--t-danger` | `#e65b65` | Error / destructive |
| `--t-success` | `#22c55e` | Success states |
| `--t-warning` | `#92400e` | Warning states |
| `--t-info` | `#075985` | Info states |
| `--t-border-color` | `#e5e0f3` | Default borders |

### Spacing

| Token | Value |
|-------|-------|
| `--t-space-1` | 4px |
| `--t-space-2` | 8px |
| `--t-space-3` | 12px |
| `--t-space-4` | 16px |
| `--t-space-5` | 20px |
| `--t-space-6` | 24px |
| `--t-space-8` | 32px |

### Typography

| Token | Value | Role |
|-------|-------|------|
| `--t-font-family` | `'Inter', system-ui` | Base font |
| `--t-font-size-xl` | 2.25rem | Page-level headings |
| `--t-font-size-md` | 1.5rem | Section headings |
| `--t-font-size-base` | 1rem | Body text |
| `--t-font-size-body-sm` | 0.875rem | Small labels |
| `--t-font-weight-bold` | 700 | |
| `--t-font-weight-semibold` | 600 | |

### Structure

| Token | Value | Use |
|-------|-------|-----|
| `--t-sidebar-width` | 260px | Sidebar fixed width |
| `--t-modal-width` | 550px | Modal default width |
| `--t-radius` | 8px | Default border radius |
| `--t-shadow-md` | elevation shadow | Cards, dropdowns |
| `--t-transition` | 0.2s cubic-bezier | All micro-animations |

---

## 4. Layout Components

### 4.1 AppLayout

**File:** `components/layout/AppLayout/AppLayout.jsx`

The root shell for all authenticated ERP pages. It wires the sidebar, topbar, and page content into a side-by-side layout.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sidebar` | `ReactNode` | No | — | Rendered `<Sidebar />` node |
| `topbar` | `ReactNode` | No | — | Rendered `<TopNavbar />` node |
| `children` | `ReactNode` | Yes | — | Page content area |

#### Usage

```jsx
import { AppLayout, Sidebar, TopNavbar } from '@/features/template';

// Build sidebar and topbar separately, then pass as props
const sidebar = <Sidebar logo="My ERP" navItems={navItems} user={user} />;
const topbar  = <TopNavbar title="Dashboard" user={user} />;

<AppLayout sidebar={sidebar} topbar={topbar}>
  <YourPageContent />
</AppLayout>
```

#### When to use
- Every authenticated page in the app needs this as the outer wrapper.
- Place `<ToastProvider>` just outside (wrapping) `<AppLayout>` so toasts overlay the entire screen.

> [!IMPORTANT]
> Do not nest `AppLayout` inside another `AppLayout`. One per route shell.

---

### 4.2 Sidebar

**File:** `components/layout/Sidebar/Sidebar.jsx`

A config-driven, collapsible navigation panel that supports:
- Flat links with icon + badge
- Nested groups with expand/collapse
- Permission-based rendering
- Responsive mobile drawer with overlay

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `logo` | `string` | No | `'ERP Kit'` | Brand name shown in sidebar header |
| `logoIcon` | `string` | No | `'ri-command-fill'` | Remix icon class for logo |
| `user` | `{ name: string, role: string }` | No | — | User object; shows avatar + role in footer |
| `navItems` | `NavItem[]` | No | `[]` | Navigation configuration array (see below) |
| `onLogout` | `() => void` | No | — | If provided, shows a "Log Out" button in footer |

#### NavItem Shape

```ts
type NavItem = {
  title: string;          // Menu label
  icon?: string;          // Remix icon class e.g. 'ri-dashboard-3-line'
  route?: string;         // React Router path — if omitted, treated as group header
  permission?: string;    // Renders only if user.role === permission
  badge?: number | string; // Counter/notification bubble
  children?: NavItem[];   // Sub-menu items (one level of nesting)
};
```

#### Usage — flat menu

```jsx
const navItems = [
  { title: 'Dashboard', icon: 'ri-dashboard-3-line', route: '/dashboard' },
  { title: 'Users',     icon: 'ri-group-line',       route: '/users', badge: 3 },
  { title: 'Settings',  icon: 'ri-settings-3-line',  route: '/settings', permission: 'ADMIN' },
];

<Sidebar
  logo="MyERP"
  logoIcon="ri-shield-flash-line"
  user={{ name: 'John Doe', role: 'ADMIN' }}
  navItems={navItems}
  onLogout={() => authContext.logout()}
/>
```

#### Usage — nested groups

```jsx
const navItems = [
  { title: 'Dashboard', icon: 'ri-dashboard-3-line', route: '/dashboard' },
  {
    title: 'HR Module',
    icon: 'ri-team-line',
    children: [
      { title: 'Employees', icon: 'ri-user-line',     route: '/hr/employees' },
      { title: 'Leave',     icon: 'ri-calendar-line', route: '/hr/leave' },
    ],
  },
];
```

#### When to use
- Build `<Sidebar>` in the layout wrapper (`TemplateDemoLayout.jsx` style) and pass it to `AppLayout`.
- Always supply `navItems` as a static/derived array, never hardcode routes inside the component.

---

### 4.3 TopNavbar

**File:** `components/layout/TopNavbar/TopNavbar.jsx`

A sticky top bar that shows a page title, user avatar, and optional custom action nodes.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | No | — | Page title shown on the left |
| `user` | `{ name: string }` | No | — | If provided, shows an avatar circle with initial letter |
| `actions` | `ReactNode` | No | — | Custom nodes rendered to the right (e.g., notification bell, quick-add button) |

#### Usage

```jsx
<TopNavbar
  title="Employee Management"
  user={{ name: 'Alice Johnson' }}
  actions={
    <>
      <Button variant="ghost" iconLeft="ri-notification-3-line" />
      <Button variant="outline" size="sm">Quick Add</Button>
    </>
  }
/>
```

---

## 5. UI Components

### 5.1 Button

**File:** `components/ui/Button/Button.jsx`

Universal button with 7 visual variants, 4 sizes, loading state, icons, and full-width mode.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'success' \| 'text'` | No | `'primary'` | Visual style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` | Button size |
| `loading` | `boolean` | No | `false` | Shows a spinner, disables click |
| `iconLeft` | `string` | No | — | Remix icon class rendered before children |
| `iconRight` | `string` | No | — | Remix icon class rendered after children |
| `disabled` | `boolean` | No | `false` | Native disabled state |
| `fullWidth` | `boolean` | No | `false` | Stretches to 100% of container width |
| `type` | `'button' \| 'submit' \| 'reset'` | No | `'button'` | HTML button type |
| `onClick` | `(e) => void` | No | — | Click handler |
| `className` | `string` | No | `''` | Extra CSS classes |

#### Usage examples

```jsx
// Primary CTA
<Button onClick={handleSave}>Save Changes</Button>

// Destructive action
<Button variant="danger" iconLeft="ri-delete-bin-line" onClick={handleDelete}>
  Delete
</Button>

// Loading state during async operation
<Button loading={isSubmitting} onClick={handleSubmit}>Submit</Button>

// Icon-only (ghost)
<Button variant="ghost" iconLeft="ri-more-2-fill" />

// Full-width in a form
<Button fullWidth type="submit">Sign In</Button>

// Sizes
<Button size="xs">Tiny</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large CTA</Button>
```

#### When to use which variant

| Variant | Use case |
|---------|----------|
| `primary` | Main CTA per section — Create, Save, Submit |
| `secondary` | Secondary CTA — Import, Duplicate |
| `outline` | Utility actions — Export, Filter, Download |
| `ghost` | Table row actions, icon-only buttons, Cancel |
| `danger` | Destructive — Delete, Remove, Revoke |
| `success` | Confirmation — Approve, Mark Complete |
| `text` | Inline text links, minimal chrome |

---

### 5.2 Badge

**File:** `components/ui/Badge/Badge.jsx`

Inline label for status, category, or count display.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | No | `'neutral'` | Color scheme |
| `size` | `'sm' \| 'md'` | No | `'md'` | Font and padding size |
| `icon` | `string` | No | — | Remix icon class shown before text |
| `children` | `ReactNode` | Yes | — | Badge label |
| `className` | `string` | No | `''` | Extra CSS classes |

#### Usage

```jsx
// Status badges in a table column
<Badge variant="success">Active</Badge>
<Badge variant="neutral">Inactive</Badge>
<Badge variant="danger">Rejected</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">In Review</Badge>

// With icon
<Badge variant="success" icon="ri-checkbox-circle-line">Approved</Badge>

// In a DataTable column render function
const columns = [
  {
    key: 'status',
    title: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
        {row.status}
      </Badge>
    ),
  },
];
```

---

### 5.3 Card

**File:** `components/ui/Card/Card.jsx`

A surface container with optional header (title + actions) and configurable body padding.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | No | — | Card heading rendered in the header bar |
| `actions` | `ReactNode` | No | — | Nodes rendered to the right of the title (usually buttons) |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` | Inner body padding |
| `children` | `ReactNode` | Yes | — | Card body content |
| `className` | `string` | No | `''` | Extra CSS classes |

#### Usage

```jsx
// Simple wrapping card
<Card title="Recent Orders" actions={<Button size="sm">View All</Button>}>
  <DataTable columns={cols} data={orders} />
</Card>

// Padding none — for tables that need edge-to-edge rendering inside a card
<Card padding="none">
  <DataTable columns={cols} data={data} />
</Card>

// Plain content card
<Card>
  <p>Some content</p>
</Card>
```

> [!NOTE]
> When `DataTable` is nested inside `Card`, use `padding="none"` on the Card to avoid double borders/spacing.

---

### 5.4 StatCard

**File:** `components/ui/StatCard/StatCard.jsx`

KPI metric card for dashboard overview rows. Shows a title, large value, icon, and optional trend indicator.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | — | Metric label (e.g. "Total Revenue") |
| `value` | `string \| number` | Yes | — | Formatted metric value (e.g. "₹1,20,000") |
| `icon` | `string` | No | — | Remix icon class for the icon circle |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | No | `'primary'` | Icon background color |
| `trend` | `string` | No | — | Trend text (e.g. "+12%") |
| `trendUp` | `boolean` | No | — | `true` = green upward arrow, `false` = red downward arrow |
| `subtitle` | `string` | No | — | Contextual note shown below trend (e.g. "vs last month") |

#### Usage

```jsx
// Typical dashboard KPI row
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
  <StatCard
    title="Total Revenue"
    value="₹1,20,000"
    icon="ri-money-dollar-circle-line"
    color="primary"
    trend="+12%"
    trendUp
    subtitle="vs last month"
  />
  <StatCard
    title="Active Users"
    value="248"
    icon="ri-group-line"
    color="success"
    trend="+5%"
    trendUp
  />
  <StatCard
    title="Pending Orders"
    value="34"
    icon="ri-shopping-cart-2-line"
    color="warning"
    trend="-3"
    trendUp={false}
  />
  <StatCard
    title="Open Issues"
    value="7"
    icon="ri-error-warning-line"
    color="danger"
  />
</div>
```

---

### 5.5 Dropdown

**File:** `components/ui/Dropdown/Dropdown.jsx`

An accessible, click-triggered action menu. Closes on outside click, Escape key, and after any item is selected.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `trigger` | `ReactNode` | Yes | — | The element that opens the menu (e.g. a Button) |
| `items` | `DropdownItem[]` | No | `[]` | Menu item config array (see below). If empty, renders `children` instead |
| `align` | `'left' \| 'right'` | No | `'right'` | Menu alignment relative to trigger |
| `children` | `ReactNode` | No | — | Custom menu content (used when `items` is empty) |
| `className` | `string` | No | `''` | Extra CSS classes on the wrapper |

#### DropdownItem Shape

```ts
type DropdownItem = {
  label: string;         // Menu item text
  icon?: string;         // Remix icon class
  onClick?: (e) => void; // Click handler
  danger?: boolean;      // Renders item in red danger style
  disabled?: boolean;    // Grays out and prevents click
  divider?: boolean;     // If true, renders a horizontal rule separator (ignore other keys)
};
```

#### Usage — row action menu in DataTable

```jsx
const columns = [
  {
    key: '_actions',
    title: '',
    render: (row) => (
      <Dropdown
        trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
        items={[
          { label: 'Edit',   icon: 'ri-pencil-line',   onClick: () => onEdit(row) },
          { divider: true },
          { label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onClick: () => onDelete(row) },
        ]}
        align="right"
      />
    ),
  },
];
```

> [!IMPORTANT]
> The `Dropdown` uses `e.stopPropagation()` internally on the trigger click. Do NOT wrap it in another click-stopping element, or the outside-click-to-close will break.

---

## 6. Form Components

### 6.1 Input

**File:** `components/forms/Input/Input.jsx`

Universal form field supporting all native input types, with built-in validation, label, helper, error, icons, and ref-based imperative API.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `string` | No | `'text'` | HTML input type: `text`, `email`, `password`, `number`, `url`, `tel`, `search`, `date` |
| `label` | `string` | No | — | Field label above the input |
| `id` | `string` | No | — | Input id (auto-generated if omitted) |
| `name` | `string` | No | — | Input name attribute |
| `placeholder` | `string` | No | — | Placeholder text |
| `value` | `string` | Yes | — | Controlled value |
| `onChange` | `(e) => void` | Yes | — | Standard React change handler |
| `onBlur` | `(e) => void` | No | — | Blur handler |
| `onFocus` | `(e) => void` | No | — | Focus handler |
| `error` | `string` | No | — | External error message (overrides internal validation) |
| `helper` | `string` | No | — | Hint text shown when no error |
| `required` | `boolean` | No | `false` | Shows asterisk, validates on blur |
| `iconLeft` | `string` | No | — | Remix icon class inside input left edge |
| `prefix` | `string` | No | — | Static text prefix (e.g. "$", "+91") |
| `suffix` | `string` | No | — | Static text suffix (e.g. "kg", ".com") |
| `loading` | `boolean` | No | `false` | Shows spinner, disables field |
| `disabled` | `boolean` | No | `false` | Disables field |
| `clearable` | `boolean` | No | `false` | Shows X button to clear value |
| `validate` | `(value: string) => string \| undefined` | No | — | Custom validation function; return error string or undefined |
| `onValidate` | `(isValid: boolean, error: string) => void` | No | — | Called after each validation run |
| `minLength` | `number` | No | — | Native minlength + built-in validation |
| `maxLength` | `number` | No | — | Native maxlength + built-in validation |
| `pattern` | `string \| RegExp` | No | — | Regex pattern validation |
| `className` | `string` | No | `''` | Extra CSS classes on wrapper |

#### Built-in Validation Rules (run automatically on blur)

| Condition | Error message |
|-----------|---------------|
| `required && value.trim() === ''` | `"<label> is required"` |
| `type === 'email'` and invalid format | `"Please enter a valid email address"` |
| `type === 'url'` and invalid URL | `"Please enter a valid URL"` |
| `minLength` not met | `"Minimum length is N characters"` |
| `maxLength` exceeded | `"Maximum length is N characters"` |
| `pattern` fails | `"Please match the requested format"` |
| `validate(value)` returns string | Custom error string returned |

#### Ref / Imperative API

```ts
// Methods available via ref
{
  validate: () => boolean;   // Runs all validations, shows error, returns true/false
  focus: () => void;         // Focuses the underlying <input>
  clear: () => void;         // Clears the localError state
}
```

#### Usage examples

```jsx
// Basic text input
<Input
  label="Full Name"
  placeholder="John Doe"
  value={formData.name}
  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
  required
/>

// Email with external error
<Input
  type="email"
  label="Email Address"
  value={formData.email}
  onChange={handleEmailChange}
  required
  error={formErrors.email}
/>

// Password with reveal toggle (automatic)
<Input type="password" label="Password" value={pw} onChange={setPw} />

// Phone with prefix
<Input
  type="tel"
  label="Phone"
  prefix="+91"
  placeholder="9876543210"
  value={phone}
  onChange={setPhone}
/>

// With search icon and clearable
<Input
  type="search"
  iconLeft="ri-search-line"
  clearable
  value={query}
  onChange={setQuery}
  placeholder="Search..."
/>

// Imperative validation (trigger from parent)
const nameRef = useRef();
// ...
const handleSubmit = () => {
  const isValid = nameRef.current.validate();
  if (!isValid) return;
  // proceed
};
// ...
<Input ref={nameRef} label="Name" value={name} onChange={...} required />
```

---

### 6.2 Select

**File:** `components/forms/Select/Select.jsx`

Custom styled dropdown for single or multi-select. Renders options in a React Portal (no overflow/clip issues). Auto-closes on outside click, Escape key, or parent scroll.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | No | — | Label above the trigger |
| `id` | `string` | No | — | Element id (auto-generated if omitted) |
| `name` | `string` | No | — | Name attribute |
| `options` | `Option[]` | Yes | `[]` | Array of options (see shape below) |
| `value` | `string \| string[]` | Yes | — | Selected value(s); array for `multiple` |
| `onChange` | `(e: { target: { name, value } }) => void` | Yes | — | Change handler — fires synthetic event-like object |
| `multiple` | `boolean` | No | `false` | Multi-select mode — checkboxes shown |
| `clearable` | `boolean` | No | `false` | Shows "clear" option at top (single mode only) |
| `loading` | `boolean` | No | `false` | Shows spinner, disables trigger |
| `disabled` | `boolean` | No | `false` | Disables trigger |
| `error` | `string` | No | — | Error message shown below |
| `placeholder` | `string` | No | `'Select...'` | Text shown when no value selected |
| `required` | `boolean` | No | `false` | Shows asterisk on label |
| `inline` | `boolean` | No | `false` | Removes wrapper flex direction for inline layout |
| `size` | `'md' \| 'sm'` | No | `'md'` | Compact `sm` for tight toolbars/filter panels |
| `className` | `string` | No | `''` | Extra CSS classes on wrapper |

#### Option Shape

```ts
type Option = {
  value: string;       // The stored value
  label: string;       // Display text
  disabled?: boolean;  // Grays out and prevents selection
};
```

#### onChange Behaviour

`onChange` fires a **synthetic event-like object**: `{ target: { name, value } }`.
- Single mode: `value` is a `string`.
- Multi mode: `value` is a `string[]`.

```jsx
// Single select
const [status, setStatus] = useState('active');

<Select
  label="Status"
  options={[
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>

// Multi-select
const [roles, setRoles] = useState([]);

<Select
  label="Roles"
  options={[
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'viewer', label: 'Viewer' },
  ]}
  value={roles}
  onChange={(e) => setRoles(e.target.value)}
  multiple
  clearable
/>

// Compact size for filter toolbars
<Select
  options={statusOptions}
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
  size="sm"
  clearable
  placeholder="All Status"
/>
```

---

### 6.3 DatePicker

**File:** `components/forms/DatePicker/DatePicker.jsx`

Custom calendar picker with day/month/year view switching. Outputs value as `YYYY-MM-DD` string. Uses a React Portal (no clip issues).

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | No | — | Label above the trigger |
| `id` | `string` | No | — | Element id |
| `name` | `string` | No | — | Name attribute |
| `value` | `string` | Yes | — | ISO date string `YYYY-MM-DD` or empty string |
| `onChange` | `(e: { target: { name, value } }) => void` | Yes | — | Called with `YYYY-MM-DD` string on selection |
| `placeholder` | `string` | No | `'YYYY-MM-DD'` | Placeholder text |
| `disabled` | `boolean` | No | `false` | Disables trigger |
| `required` | `boolean` | No | `false` | Shows asterisk on label |
| `error` | `string` | No | — | Error message shown below |
| `helper` | `string` | No | — | Helper text shown when no error |
| `inline` | `boolean` | No | `false` | Inline layout modifier |
| `className` | `string` | No | `''` | Extra CSS classes on wrapper |

#### Usage

```jsx
const [date, setDate] = useState('');

<DatePicker
  label="Joined Date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  required
  error={formErrors.joinedDate}
/>
```

#### Calendar Navigation

| Click target | Effect |
|---|---|
| `← arrow` | Previous month/year/year-range |
| `→ arrow` | Next month/year/year-range |
| Month name in header | Switch to 12-month grid |
| Year in header | Switch to 12-year grid |
| Month in grid | Navigate back to day grid |
| Year in grid | Navigate to month grid |
| "Today" button | Selects today and closes |
| "Clear" button | Clears value and closes |

---

### 6.4 Form System

**File:** `components/forms/Form/Form.jsx`

Four composable layout components that structure any form without custom CSS.

#### Components & Props

**`Form`** — Root form element. Prevents default submit.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(e) => void` | — | Called when form is submitted (default prevented) |
| `className` | `string` | `''` | Extra CSS classes |
| `children` | `ReactNode` | — | Form content |

**`FormSection`** — Groups related fields with an optional heading (renders `<fieldset>`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Optional section heading |
| `children` | `ReactNode` | — | Fields |

**`FormRow`** — Responsive grid row. Defaults to 1 column; specify `cols` for multi-column.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `number` | — | Number of equal columns (e.g. `2`, `3`) |
| `children` | `ReactNode` | — | Form fields |

**`FormActions`** — Right-aligned action button row. Use in Modal footer or at end of form.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Buttons |

#### Usage

```jsx
import Form, { FormSection, FormRow, FormActions } from '@/features/template';

<Form onSubmit={handleSubmit}>
  <FormSection title="Personal Information">
    <FormRow cols={2}>
      <Input label="First Name" value={firstName} onChange={...} required />
      <Input label="Last Name"  value={lastName}  onChange={...} required />
    </FormRow>
    <FormRow cols={2}>
      <Input type="email" label="Email" value={email} onChange={...} required />
      <Input type="tel"   label="Phone" value={phone} onChange={...} />
    </FormRow>
  </FormSection>

  <FormSection title="Account Details">
    <FormRow>
      <Select label="Role" options={roleOptions} value={role} onChange={...} />
    </FormRow>
    <FormRow cols={2}>
      <DatePicker label="Start Date" value={startDate} onChange={...} />
      <Select label="Department" options={deptOptions} value={dept} onChange={...} />
    </FormRow>
  </FormSection>

  <FormActions>
    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
    <Button type="submit">Save</Button>
  </FormActions>
</Form>
```

> [!NOTE]
> When using `Form` inside `Modal`, put `<FormActions>` in the Modal's `footer` prop, not inside the Form. This prevents duplicate borders between FormActions and Modal footer.

---

## 7. Data Display Components

### 7.1 DataTable

**File:** `components/data-display/DataTable/DataTable.jsx`

Universal ERP data grid with built-in search, sort, selection, pagination, and custom toolbar actions. Works for any data entity (users, orders, products, employees, etc.).

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `Column[]` | Yes | `[]` | Column definitions (see shape below) |
| `data` | `object[]` | Yes | `[]` | Array of row objects |
| `loading` | `boolean` | No | `false` | Shows loading skeleton rows |
| `searchable` | `boolean` | No | `false` | Enables internal search bar in toolbar |
| `selectable` | `boolean` | No | `false` | Shows checkboxes for row selection |
| `paginated` | `boolean` | No | `false` | Enables pagination below the table |
| `pageSize` | `number` | No | `10` | Rows per page (only if `paginated`) |
| `emptyMessage` | `string` | No | `'No records found.'` | Text when data array is empty |
| `onRowClick` | `(row) => void` | No | — | Called when a row is clicked |
| `toolbarActions` | `ReactNode` | No | — | Buttons rendered on the right of the toolbar |

#### Column Shape

```ts
type Column = {
  key: string;                        // Row data key to read value from
  title: string;                      // Column header text
  sortable?: boolean;                 // Enables click-to-sort on this column
  render?: (row: object) => ReactNode; // Custom cell renderer (overrides row[key])
};
```

#### Usage

```jsx
const columns = [
  { key: 'name',   title: 'Name',   sortable: true },
  { key: 'email',  title: 'Email',  sortable: true },
  { key: 'role',   title: 'Role' },
  {
    key: 'status',
    title: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: '_actions',
    title: '',
    render: (row) => (
      <Dropdown
        trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
        items={[
          { label: 'Edit',   icon: 'ri-pencil-line', onClick: () => onEdit(row) },
          { label: 'Delete', icon: 'ri-delete-bin-line', danger: true, onClick: () => onDelete(row) },
        ]}
        align="right"
      />
    ),
  },
];

<DataTable
  columns={columns}
  data={filteredData}
  searchable
  selectable
  paginated
  pageSize={10}
  emptyMessage="No records found matching your search."
  toolbarActions={
    <Button variant="outline" size="sm" iconLeft="ri-download-line">Export</Button>
  }
/>
```

> [!NOTE]
> The `searchable` prop adds an internal search on **all column keys**. If you need external/custom filtering (e.g. by dropdown), manage filters in your page state and pre-filter the `data` prop before passing it in (as shown in `CrudTemplatePage`).

---

### 7.2 Tabs

**File:** `components/data-display/Tabs/Tabs.jsx`

Horizontal tab bar. Fully controlled — manages no internal state.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tabs` | `Tab[]` | Yes | `[]` | Tab definitions |
| `activeTab` | `string` | Yes | — | Key of the currently active tab |
| `onChange` | `(key: string) => void` | Yes | — | Called when a tab is clicked |

#### Tab Shape

```ts
type Tab = {
  key: string;    // Unique identifier
  label: string;  // Tab label
  icon?: string;  // Remix icon class
};
```

#### Usage

```jsx
const TABS = [
  { key: 'overview',  label: 'Overview',  icon: 'ri-layout-grid-line' },
  { key: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' },
  { key: 'history',   label: 'History',   icon: 'ri-history-line' },
];

const [activeTab, setActiveTab] = useState('overview');

// Render the Tabs bar
<Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

// Render content conditionally below
{activeTab === 'overview'  && <OverviewContent />}
{activeTab === 'analytics' && <AnalyticsContent />}
{activeTab === 'history'   && <HistoryContent />}
```

---

## 8. Navigation Components

### 8.1 Breadcrumb

**File:** `components/navigation/Breadcrumb/Breadcrumb.jsx`

Page location trail with chevron separators. Last item renders as plain text (current page). All others render as React Router `<Link>`.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `BreadcrumbItem[]` | Yes | `[]` | Ordered list of crumbs |

#### BreadcrumbItem Shape

```ts
type BreadcrumbItem = {
  label: string;   // Display text
  href?: string;   // React Router path. Omit for the last (current) item.
};
```

#### Usage

```jsx
<Breadcrumb items={[
  { label: 'Home',       href: '/' },
  { label: 'HR Module',  href: '/hr' },
  { label: 'Employees' },  // Last item — no href, renders as current page
]} />
```

---

### 8.2 SearchBar

**File:** `components/navigation/SearchBar/SearchBar.jsx`

Standalone search input with a search icon and an `×` clear button.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | — | Controlled search value |
| `onChange` | `(value: string) => void` | Yes | — | Called with the **string value** (not event) |
| `placeholder` | `string` | No | `'Search...'` | Input placeholder |
| `className` | `string` | No | `''` | Extra CSS classes on wrapper |

> [!IMPORTANT]
> `onChange` receives the **string value directly**, not an event object. This is different from Input.

#### Usage

```jsx
const [search, setSearch] = useState('');

<SearchBar
  value={search}
  onChange={setSearch}   // receives string, not event
  placeholder="Search employees..."
/>

// Then filter your data manually
const filtered = data.filter(row =>
  Object.values(row).some(v =>
    String(v).toLowerCase().includes(search.toLowerCase())
  )
);
```

---

## 9. Overlay Components

### 9.1 Modal

**File:** `components/overlays/Modal/Modal.jsx`

Accessible, portal-based dialog. Locks body scroll when open. Closes on Escape key. Optionally closes on overlay click.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | — | Controls visibility |
| `onClose` | `() => void` | Yes | — | Called when user requests close |
| `title` | `string` | No | — | Dialog heading in the header bar |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | `'md'` | Modal width |
| `footer` | `ReactNode` | No | — | Content in the footer area (typically action buttons) |
| `children` | `ReactNode` | Yes | — | Modal body content |
| `closeOnOverlayClick` | `boolean` | No | `true` | Clicking the dark overlay closes the modal |

#### Usage

```jsx
const [open, setOpen] = useState(false);
const [saving, setSaving] = useState(false);

<Modal
  isOpen={open}
  onClose={() => !saving && setOpen(false)}
  title="New Employee"
  size="md"
  closeOnOverlayClick={!saving}
  footer={
    <FormActions>
      <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
        Cancel
      </Button>
      <Button loading={saving} onClick={handleSave}>
        Save
      </Button>
    </FormActions>
  }
>
  <Form onSubmit={handleSave}>
    {/* form fields */}
  </Form>
</Modal>
```

#### Modal Sizes

| Size | Approx width | Use case |
|------|-------------|----------|
| `sm` | ~360px | Confirm prompts, simple messages |
| `md` | ~550px | Standard create/edit forms |
| `lg` | ~750px | Complex multi-section forms |
| `xl` | ~95vw | Fullscreen workflows, detail views |

---

### 9.2 ConfirmDialog

**File:** `components/overlays/ConfirmDialog/ConfirmDialog.jsx`

Pre-wired confirmation modal built on top of `Modal` + `Button`. Use whenever you need "Are you sure?" before a destructive action.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | — | Controls visibility |
| `onClose` | `() => void` | Yes | — | Called on cancel or close |
| `onConfirm` | `() => void` | Yes | — | Called when user clicks confirm |
| `title` | `string` | No | `'Confirm'` | Dialog heading |
| `message` | `string` | No | `'Are you sure you want to proceed?'` | Body message |
| `confirmLabel` | `string` | No | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | No | `'Cancel'` | Cancel button text |
| `confirmVariant` | `string` | No | `'danger'` | Button variant for confirm (use `'danger'` for delete, `'primary'` for approve) |
| `loading` | `boolean` | No | `false` | Shows spinner on confirm button; prevents close on overlay click |

#### Usage

```jsx
const [deleteTarget, setDeleteTarget] = useState(null);

// Trigger
<Button variant="danger" onClick={() => setDeleteTarget(record)}>Delete</Button>

// Dialog
<ConfirmDialog
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title="Delete Employee"
  message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={isDeleting}
/>
```

---

## 10. Feedback Components

### 10.1 Toast / useToast / ToastProvider

**Files:** `components/feedback/Toast/ToastProvider.jsx`

Context-based toast notification system. `ToastProvider` manages the toast queue and renders the container. `useToast` returns `showToast()`.

#### Setup — Required Once Per Layout Shell

```jsx
// Wrap your authenticated layout with ToastProvider
import { ToastProvider } from '@/features/template';

<ToastProvider>
  <AppLayout sidebar={...} topbar={...}>
    <Outlet />
  </AppLayout>
</ToastProvider>
```

#### `useToast` API

```ts
const { showToast } = useToast();

showToast(
  message: string,           // Toast text
  type?: 'info' | 'success' | 'warning' | 'error',  // Default: 'info'
  duration?: number          // Auto-dismiss ms, default 3500
): void
```

#### Usage inside any component (must be inside ToastProvider)

```jsx
import { useToast } from '@/features/template';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await api.save(data);
      showToast('Record saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save record. Please try again.', 'error');
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
};
```

#### Toast Types & Icons

| Type | Icon | Color |
|------|------|-------|
| `success` | ✅ `ri-checkbox-circle-line` | Green |
| `error` | ⚠️ `ri-error-warning-line` | Red |
| `warning` | ⚡ `ri-alert-line` | Amber |
| `info` | ℹ️ `ri-information-line` | Blue |

> [!CAUTION]
> Calling `useToast()` outside a `<ToastProvider>` throws: `"useToast must be used inside <ToastProvider>"`. Always verify your layout wraps with `ToastProvider`.

---

## 11. Dashboard Components

### 11.1 FilterPanel

**File:** `components/dashboard/FilterPanel/FilterPanel.jsx`

A row of labeled `Select` dropdowns for filtering data. Each filter maps to a key-value pair in your state. Uses compact `size="sm"` selects by default.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `FilterDef[]` | Yes | `[]` | Filter definitions (see shape below) |
| `values` | `Record<string, string>` | Yes | `{}` | Current filter state object |
| `onChange` | `(key: string, value: string) => void` | No | — | Called when any filter value changes |
| `onReset` | `() => void` | No | — | If provided, shows a "Reset" button |
| `inline` | `boolean` | No | `false` | Renders filters in a horizontal line |

#### FilterDef Shape

```ts
type FilterDef = {
  key: string;       // Key in values state object
  label: string;     // Display label above select
  options: Option[]; // Select options array { value, label }
};
```

#### Usage

```jsx
const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active',   label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'department',
    label: 'Department',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'hr',          label: 'HR' },
      { value: 'finance',     label: 'Finance' },
    ],
  },
];

const [filterValues, setFilterValues] = useState({ status: '', department: '' });

const handleFilterChange = (key, value) => {
  setFilterValues(prev => ({ ...prev, [key]: value }));
};

const handleReset = () => {
  setFilterValues({ status: '', department: '' });
};

<FilterPanel
  filters={FILTERS}
  values={filterValues}
  onChange={handleFilterChange}
  onReset={handleReset}
  inline
/>

// Then apply filters to data
const filtered = data.filter(row =>
  (!filterValues.status     || row.status     === filterValues.status) &&
  (!filterValues.department || row.department === filterValues.department)
);
```

---

## 12. Template Pages (Reference Implementations)

These are fully working, copy-paste-ready pages. Copy the `.jsx` file into your feature folder and replace the sample data with real API calls.

### 12.1 DashboardTemplatePage

**File:** `pages/DashboardTemplatePage/DashboardTemplatePage.jsx`

Demonstrates: `Breadcrumb`, `Button`, `StatCard` KPI row, `Card`, `Tabs`, `DataTable`, `Badge`.

**Pattern:**
1. Page header with breadcrumb, heading, and action buttons.
2. 4-column KPI `StatCard` grid.
3. `Card` with `Tabs` on top and `DataTable` below (tab-switched).

**To adapt for your feature:**
- Replace `COLUMNS` with your entity's columns.
- Replace `SAMPLE_DATA` with `data` from your API hook (e.g. `useQuery`).
- Replace `BREADCRUMBS` with your actual route trail.
- Replace `StatCard` values with real metrics from your API.

---

### 12.2 CrudTemplatePage

**File:** `pages/CrudTemplatePage/CrudTemplatePage.jsx`

Demonstrates: `Breadcrumb`, `Button`, `Card`, `SearchBar`, `FilterPanel`, `DataTable`, `Dropdown`, `Badge`, `Modal`, `Form`, `FormSection`, `FormRow`, `FormActions`, `Input`, `Select`, `DatePicker`, `ConfirmDialog`, `useToast`.

**Pattern:**
1. Page header with breadcrumb and "New Record" button.
2. Card with `SearchBar` + `FilterPanel` toolbar.
3. `DataTable` with sortable columns, badge-status column, and `Dropdown` actions per row.
4. Create/Edit `Modal` with a form inside and `FormActions` in footer.
5. Delete `ConfirmDialog`.
6. `useToast` for all success/error feedback.

**State shape to copy:**
```js
const [records,      setRecords]      = useState([]);
const [search,       setSearch]       = useState('');
const [filterValues, setFilterValues] = useState({ status: '', role: '' });
const [formOpen,     setFormOpen]     = useState(false);
const [editTarget,   setEditTarget]   = useState(null);
const [formData,     setFormData]     = useState(EMPTY_FORM);
const [formErrors,   setFormErrors]   = useState({});
const [deleteTarget, setDeleteTarget] = useState(null);
const [loading,      setLoading]      = useState(false);
```

---

### 12.3 TemplateDemoLayout

**File:** `pages/TemplateDemoLayout.jsx`

A complete authenticated layout shell. Shows how to compose `ToastProvider`, `AppLayout`, `Sidebar`, and `TopNavbar` into one route layout with `<Outlet />`.

**This is the pattern to replicate for any new feature layout:**

```jsx
import { ToastProvider, AppLayout, Sidebar, TopNavbar } from '@/features/template';
import '@/features/template/styles/index.scss'; // import once per shell

const MyFeatureLayout = () => {
  const user = { name: 'Current User', role: 'ADMIN' };

  const navItems = [
    { title: 'Dashboard', icon: 'ri-dashboard-3-line', route: '/dashboard' },
    { title: 'Employees', icon: 'ri-group-line',       route: '/employees' },
    {
      title: 'HR',
      icon: 'ri-team-line',
      children: [
        { title: 'Leave', icon: 'ri-calendar-line', route: '/hr/leave' },
      ],
    },
  ];

  return (
    <ToastProvider>
      <div className="t-root">
        <AppLayout
          sidebar={
            <Sidebar
              logo="My ERP"
              logoIcon="ri-shield-flash-line"
              user={user}
              navItems={navItems}
              onLogout={() => { /* call auth logout */ }}
            />
          }
          topbar={
            <TopNavbar title="My ERP" user={user} />
          }
        >
          <Outlet />
        </AppLayout>
      </div>
    </ToastProvider>
  );
};
```

---

## 13. Composition Patterns — What to Use Where

### Dashboard Overview Page

```
Page
└── AppLayout
    ├── Sidebar (navItems with your routes)
    ├── TopNavbar (title + user)
    └── Content
        ├── Breadcrumb
        ├── Page heading + Button (New Record)
        ├── StatCard × 4 (KPI row)
        └── Card (padding="none")
            ├── Tabs
            └── DataTable (paginated, searchable, selectable)
```

### CRUD Management Page

```
Page
└── AppLayout
    └── Content
        ├── Breadcrumb + h1 + Button (New)
        └── Card (padding="none")
            ├── SearchBar
            ├── FilterPanel (inline)
            └── DataTable
                └── columns → Badge + Dropdown(Edit/Delete)
        └── Modal (Create/Edit)
            └── Form
                └── FormSection
                    └── FormRow cols={2}
                        ├── Input
                        ├── Input (email)
                        ├── Select
                        └── DatePicker
            footer → FormActions → Button (Cancel) + Button (Save, loading)
        └── ConfirmDialog (Delete)
```

### Settings Page

```
Page
└── Card title="Settings" actions={<Button>Save</Button>}
    └── Form
        ├── FormSection title="Profile"
        │   ├── FormRow cols={2}
        │   │   ├── Input (Full Name)
        │   │   └── Input (email, disabled)
        │   └── FormRow
        │       └── Input (Phone, prefix="+91")
        ├── FormSection title="Preferences"
        │   └── FormRow
        │       └── Select (Timezone, options=[...])
        └── FormActions
            └── Button (Save Changes)
```

### Detail/Preview Page

```
Page
└── Breadcrumb
└── Card title="Employee Details" actions={<Dropdown trigger={<Button>Actions</Button>} items={[...]} />}
    └── FormRow cols={2}
        ├── [ label: value pairs using CSS variables ]
        └── Badge (status)
└── Card title="Work History"
    └── DataTable (no pagination, no search)
```

### Delete Flow Pattern

```jsx
// 1. Hold target in state
const [deleteTarget, setDeleteTarget] = useState(null);

// 2. Column action triggers
{ label: 'Delete', danger: true, onClick: () => setDeleteTarget(row) }

// 3. Dialog reads from state
<ConfirmDialog
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  message={`Delete "${deleteTarget?.name}"?`}
  loading={isDeleting}
/>
```

---

## 14. Global Setup Checklist

Before using any component in a new project or feature, verify:

- [ ] **Remix Icons CDN** is loaded in `index.html` (required for all icons):
  ```html
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
  ```

- [ ] **Inter font** is available (optional, falls back to system-ui):
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ```

- [ ] **Styles imported once** in the root layout shell:
  ```js
  import '@/features/template/styles/index.scss';
  ```

- [ ] **`ToastProvider` wraps the layout** if you use `useToast()` anywhere:
  ```jsx
  <ToastProvider>
    <AppLayout ...>
      <Outlet />
    </AppLayout>
  </ToastProvider>
  ```

- [ ] **React Router** is installed and a `<Router>` wraps the app (`Sidebar` uses `useLocation` and `Link` from `react-router`).

- [ ] **Path alias `@/`** resolves to `client/src/` in Vite/Webpack config (for `@/features/template` imports).

---

> **Last updated:** Based on sprint completion through `CrudTemplatePage` with form validation, portal-based Select/DatePicker, compact FilterPanel selects, and inline layout support. See `.ai/CURRENT_SPRINT.md` for full changelog.
