# Core Mandates for VITECHCO Process Hub Development

This file serves as the single source of truth for development standards and rules. Any AI agent or developer working on this project MUST adhere to these mandates.

## 1. Architecture & Structure (Kiến trúc & Cấu trúc)
- **Feature-based Architecture**: Code MUST be organized by feature (e.g., `src/features/documents`), NOT by technical type (e.g., NOT `src/components`, `src/services` at root).
- **Separation of Concerns**:
    - **UI Layer (`components`, `page.tsx`)**: Only handles rendering and user interaction. NEVER calls Prisma directly. MUST use Services or Server Actions.
    - **Service Layer (`services`)**: Contains business logic and database interactions.
    - **Data Layer (`prisma`)**: Schema definition only.
- **Client vs. Server**:
    - Use `use client` strictly only when necessary (interactivity, hooks).
    - Prefer Server Components for data fetching.
    - Use `next/dynamic` with `ssr: false` for client-only libraries (like Tiptap) to avoid hydration errors.

## 2. Coding Standards (Tiêu chuẩn Code)
- **TypeScript**: Strict typing is mandatory. No `any` unless absolutely unavoidable.
- **Naming**:
    - Files: `PascalCase.tsx` for components, `camelCase.ts` for logic.
    - Functions: `camelCase`.
    - Components: `PascalCase`.
- **Imports**: Use absolute imports with `@/` alias (e.g., `@/features/documents/...`).

## 3. Data Management (Quản lý Dữ liệu)
- **Prisma**: Always use the singleton Prisma client instance (`@/lib/prisma/client`).
- **Migrations**: Database schema changes MUST be accompanied by a migration (`npx prisma migrate dev`).
- **Validation**: Use `Zod` for all form validations and API input validation.

## 4. UI/UX Standards
- **Library**: Use `shadcn/ui` components for consistency.
- **Styling**: Use `Tailwind CSS`.
- **Responsive**: All UIs must be mobile-friendly.
- **Feedback**: Every action (Save, Delete) MUST have user feedback (Toast notification, Loading state).

## 5. Security (Bảo mật)
- **Authorization**: Admin routes (`/admin`) MUST be protected. Check user role in every Server Action and Page.
- **Authentication**: Use `NextAuth` session for user identification.

## 6. Testing (Kiểm thử)
- Write tests for critical business logic.
- Verify hydration consistency.
