# System Architecture

## 1. 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router).
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode).
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/).
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Google OAuth + Session).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/).
- **State**: Server Actions (Mutations) + React Server Components (Fetching).

## 2. 🏗️ Feature-Based Design
Code is organized by business domain features, not technical layers.

```
src/features/
├── documents/          # Content Management
├── users/              # Identity & Roles
├── reports/            # Analytics
└── ...
```
Each feature module contains its own:
- `actions.ts` (Public API)
- `components/` (UI)
- `services/` (Domain Logic)

## 3. 🔐 Security Model (RBAC)
- **Authentication**: JWT Strategies encrypted with `NEXTAUTH_SECRET`.
- **Authorization**:
    - **Role**: `ADMIN`, `TECHNICIAN`.
    - **Scope**:
        - `ADMIN`: Full access (User mgmt, Config).
        - `TECHNICIAN`: Read/Write Documents, Execute Processes.
- **Protection Layer**:
    - Middleware: Protects `/admin` routes.
    - Server Actions: Explicit `session` checks required.

## 4. 📊 Data Architecture (Modular Core)

We utilize a **Modular Core + Extension** pattern to ensure scalability across departments.

### 4.1 Core Model (`Document`)
Manages universal attributes for *every* file in the system:
- **Identity**: ID, Title, Content.
- **Traceability**: Author, CreatedAt, UpdatedAt.
- **Organization**: Departments (Many-to-Many).

### 4.2 Extension Models (`Metadata`)
Department-specific fields are stored in separate 1:1 extension tables.
- **`TechnicalMetadata`**: Stores `machineModels`, `steps`, `documentType`, `tags`.
  - *Must exist for all Technical documents.*
- **Future Extensions**: `SalesMetadata`, `HRMetadata`.

### 4.3 The 4-Level Taxonomy
Strict OOP implementation of the Vintechco process structure (managed via Metadata):
1.  **Department** (Bộ phận): Top level organization (Core).
2.  **Category** (Phân Mục): Type of content (Extension - e.g., "Quy Trình").
3.  **Topic** (Loại): Specific subject matter (Extension - e.g., "Cài đặt").
4.  **Document** (Tài liệu): The content record (Core).

**Attributes**:
- **MachineModel**: High-level series groupings (RICOH MP, MPC).
- **Tags**: Specific model identifiers.

## 5. 🔄 API & Data Flow
- **Fetch**: Direct DB access in Server Components (No API route overhead).
- **Mutate**: Server Actions with `revalidatePath`.
- **Validation**: Zod schemas for all inputs.
