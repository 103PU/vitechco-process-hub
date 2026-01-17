# Database Scalability & Modular Architecture Report

**Date:** 2026-01-18  
**Status:** Implemented  
**Project:** Vintechco Hub

## 1. Context & Problem Statement
The original database schema utilized a "God Object" pattern for the `Document` table. This structure centralized all fields (Technical, Sales, Administrative) into a single table.

**Issues identified:**
- **Rigidity:** Adding fields for a new department (e.g., Sales) required modifying the core `Document` table, risking regressions in existing features.
- **Sparse Data:** A single table led to many null columns (e.g., `machineModels` and `steps` are irrelevant for HR documents), wasting storage and confusing data dictionaries.
- **Coupling:** Technical logic was tightly coupled with Core document management, making it hard to isolate features.

## 2. Implemented Solution: Modular Core Architecture
We have transitioned to a **Core + Extension** pattern.

### 2.1 Schema Design
- **`Document` (Core)**: Contains only universal fields applicable to *all* documents (ID, Title, Content, Author, Timestamps, Departments).
- **`TechnicalMetadata` (Extension)**: specific to the Technical Department. Contains indexes, relationships, and fields relevant only to technical workflows (`machineModels`, `steps`, `topic`, `documentType`).

### 2.2 Benefits
1.  **Scalability**: New departments (e.g., Sales) can be added by creating a `SalesMetadata` table without touching the existing `TechnicalMetadata` or breaking Core `Document` logic.
2.  **Performance**: Core queries for lists (e.g., "Latest Documents") are faster as they don't need to join unused metadata tables unless requested.
3.  **Type Safety (TypeScript)**: The codebase now explicitly distinguishes between a generic `Document` and a `TechnicalDocument` (via the presence of `technicalMetadata`), reducing runtime errors.

## 3. Migration & Backwards Compatibility
A "Safe Migration" strategy was used:
1.  **Zero Data Loss**: Existing data in `Document` was migrated to `TechnicalMetadata` via a custom SQL migration script.
2.  **Facade Pattern**: The `DocumentService` and UI layers were updated to "flatten" the data structure. API consumers still receive a unified object (e.g., `doc.tags`), masking the underlying complexity of the join (`doc.technicalMetadata.tags`).

## 4. Technical Details
- **Transactions**: All mutations (Create/Update) use `prisma.$transaction`. This ensures atomicity: a Document is never created without its required Metadata, and vice-versa.
- **Relations**: 
    - `Document` 1:1 `TechnicalMetadata` (Optional)
    - `TechnicalMetadata` 1:N `DocumentOnMachineModel`
    - `TechnicalMetadata` 1:N `Step`

## 5. Future Roadmap
- **Sales Module**: Create `SalesMetadata` for managing customer contracts and quotes.
- **HR Module**: Create `HRMetadata` for internal policies.
- **Polymorphic search**: Enhance `search/route.ts` to factory-delegate search requirements based on the `department` filter.
