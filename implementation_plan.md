# Entire Project Enterprise UI Modernization Plan

This plan outlines the visual redesign of the **entire project** to an enterprise-grade standard. Every view, component, form, button, list, dashboard, settings page, and navigation element will be updated to adhere to a premium, unified theme. All backend logic, APIs, Zustand states, and form validations will remain completely unchanged.

## Design System & Themes

### 1. Typography (Global)
- **Headings**: Geist (modern, clean, high-tech sans-serif).
- **Body & Controls**: Inter (highly readable, professional sans-serif).
- Loaded via `next/font/google` in the root `layout.tsx` and applied globally via CSS variables.

### 2. "Calm Luxury" Color Palette (Global)
- **Light Theme**:
  - Background: Warm Soft Alabaster (`#FBFBFA`) / Warm Stone (`#F5F4F0`)
  - Foreground: Charcoal Black (`#1A1D20`)
  - Cards & Panels: Crisp Pearl White (`#FFFFFF`)
  - Border: Soft Warm Taupe (`#E4E2DE`)
  - Accents: Champagne Gold / Antique Bronze (`#C5A880` / `#9E825C`) and Deep Navy/Slate (`#2C3539` / `#1F2937`)
- **Dark Theme**:
  - Background: Obsidian Black (`#0A0A0B`) / Rich Ebony (`#121214`)
  - Foreground: Warm Ivory (`#F5F5F0`)
  - Cards & Panels: Deep Onyx (`#161618`)
  - Border: Muted Bronze-Slate (`#2A2A2E`)
  - Accents: Satin Gold (`#D4AF37` / `#C5A880`)

### 3. "Jira Style" UI (Global Layouts & Views)
- Standardize borders with thin, clean lines (`border-[1px] border-border/70`).
- Border-radius: Clean `rounded-md` (6px) or `rounded-lg` (8px) globally instead of bubbly shapes.
- High-efficiency spacing, consistent padding, clear table layouts, clean Kanban boards, and flat dashboard widgets.

---

## Proposed Changes

### Core Configuration & Styling

#### [MODIFY] [layout.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/layout.tsx)
- Load `Geist` and `Inter` from `next/font/google` and attach them to the global body context.

#### [MODIFY] [globals.css](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/globals.css)
- Implement the complete **Calm Luxury** theme for light & dark modes.
- Map the typography fonts globally.
- Standardize spacing, inputs, buttons, and card borders.

### Authentication Pages (ClickUp-Inspired)

#### [MODIFY] [AuthLayout.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/AuthLayout.tsx)
- Replace bubbly glassmorphic structures with a sleek, premium centered auth container.
- Clean typography, high-contrast action buttons, and luxury minimalist design.

#### [MODIFY] All Auth Pages:
- [login/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/login/page.tsx)
- [signup/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/signup/page.tsx)
- [forgot-password/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/forgot-password/page.tsx)
- [verify-email/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/verify-email/page.tsx)
- [verify-otp/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/(auth)/verify-otp/page.tsx)
- [reset-password/[token]/page.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/app/reset-password/[token]/page.tsx)
- Upgrade all field designs, labels, buttons, and error states.

### Main Navigation & Shell

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/Sidebar.tsx)
- Convert the workspace navigation into a clean, flat, Jira-style collapsable menu.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/Navbar.tsx)
- Refine the header with a thin bottom border, clean logo alignment, and modern profile/action toggles.

### Dashboard & Workspace Views

#### [MODIFY] All Dashboard Views & Components:
- [DashboardCards.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/DashboardCards.tsx)
- [DashboardCharts.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/DashboardCharts.tsx)
- [DashboardInsights.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/DashboardInsights.tsx)
- [TasksList.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/TasksList.tsx)
- [TaskTable.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/TaskTable.tsx)
- [PriorityBoard.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/PriorityBoard.tsx)
- [ProductivityHeatmap.tsx](file:///c:/Users/Admin/Desktop/dekho/Eye-s-On-U/frontend/src/components/ProductivityHeatmap.tsx)
- Make charts, calendar pickers, team tables, task boards, and analytical components match the new design tokens.

---

## Verification Plan

### Automated Tests
- Run `npm run build` inside `/frontend` to verify that everything compiles successfully with no compilation or TypeScript errors.

### Manual Verification
- Visual inspection of the entire app workflow (login -> dashboard -> task management -> settings -> team pages) in both light and dark modes.
