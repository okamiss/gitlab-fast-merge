# Branch Table Responsive Scroll Design

## Problem

The saved Branch table always receives `scroll={{ x: 820 }}`. Ant Design therefore renders the table with a horizontal scroll area even when a desktop container has enough room for all columns.

## Goal

Remove the unnecessary desktop horizontal scrollbar while preserving horizontal table scrolling on small screens where the columns need more room.

## Design

Use Ant Design's responsive breakpoint hook inside `BranchTable`.

- On screens at the `md` breakpoint or wider, omit the table `scroll` prop so the table uses the available container width naturally.
- Below the `md` breakpoint, keep `scroll={{ x: 820 }}` so Branch, repository, description, progress, and action columns remain usable without clipping.
- Keep the existing columns, widths, pagination, edit modal, and surrounding layout unchanged.

## Scope

Modify only `frontend/src/components/BranchTable.tsx`. No backend, API, data model, or global CSS changes are needed.

## Verification

- Run the frontend build.
- Open the dashboard at desktop width and confirm the saved Branch table has no horizontal scrollbar.
- Open the dashboard below the `md` breakpoint and confirm the table remains horizontally scrollable when its columns exceed the viewport.
