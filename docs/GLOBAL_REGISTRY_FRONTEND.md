# Global Registry Foundation frontend

## What was added
- New authenticated registry route at `/registry`
- Registry overview page with hero header, operational cards, search, filters, table, form and empty/error states
- Reusable frontend components for forms, tables, filters and loading skeletons
- Validation layer for registry identity payloads using Zod and React Hook Form
- API integration layer that consumes the approved REST contract via TanStack Query
- Navigation entry for the Registry module in the existing app shell

## Key files
- [src/routes/_authenticated/registry/index.tsx](src/routes/_authenticated/registry/index.tsx)
- [src/components/registry/registry-page.tsx](src/components/registry/registry-page.tsx)
- [src/components/registry/registry-form.tsx](src/components/registry/registry-form.tsx)
- [src/components/registry/registry-filters.tsx](src/components/registry/registry-filters.tsx)
- [src/components/registry/registry-table.tsx](src/components/registry/registry-table.tsx)
- [src/lib/api/registry.ts](src/lib/api/registry.ts)
- [src/lib/validation/registry.ts](src/lib/validation/registry.ts)

## Verification
- `npm test` → 4 test files passed, 10 tests passed
- `npm run build` → production build completed successfully
