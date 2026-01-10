# Test Verification & Quality Assurance Plan
**Target Module:** `vitechco-process-hub` (Focus: Documents & Auth)
**Date:** January 3, 2026
**Status:** DRAFT (Pending Execution)

## 1. Executive Summary
This plan addresses the critical lack of automated verification in the current codebase. It moves beyond static analysis to define **behavioral assertions** that verify the system's correctness, security, and stability.

**Quality Goals:**
*   **Logic Correctness:** 100% of defined "Happy Paths" pass.
*   **Error Handling:** 100% of defined "Edge Cases" return controlled error states (no crashes).
*   **Security:** 0 actions executable without valid authorization.

## 2. Risk Analysis (FMEA - Failure Mode and Effects Analysis)

| Component | Potential Failure Mode | Root Cause | Impact | Verification Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Create Document** | Invalid Data Injection | Weak Zod schema or bypass | Corrupt DB state | Test boundary values (empty strings, huge payloads). |
| **Delete Document** | Orphaned Data | Missing Cascade Delete | Ghost records (Steps/Tags) | Verify DB state of related tables after deletion. |
| **Update Tags** | Race Condition | Concurrent updates | Data loss (Tag overwrite) | Test transactional integrity (mock failures inside transaction). |
| **Any Action** | **Unauthorized Access** | **Missing Session Check** | **Data Leak / Data Loss** | **CRITICAL: Test actions with null/invalid session context.** |

## 3. Test Specification: Statistics & Scenarios

### A. Unit Verification Points (Logic Isolation)
*Target: `src/features/documents/actions.ts` & `src/features/users/actions.ts`*

| ID | Test Case | Input Data | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Create Document (Valid) | `{ title: "valid", ... }` | `success: true` | High | ✅ PASS |
| **TC-002** | Create Document (Invalid) | `{ title: "ab", ... }` | `success: false` | Medium | ✅ PASS |
| **TC-004** | Update Tags (Transaction) | `ids: ["1"], tags: [...]` | DB updated | High | ✅ PASS |
| **TC-U01** | Update Role (Non-Admin) | `role: "ADMIN"` | `success: false` | High | ✅ PASS |
| **TC-U02** | Self-Demotion (Admin) | `userId: "me"` | `success: false` | Medium | ✅ PASS |

### B. Integration Verification Points (End-to-End Flow)
*Target: API Routes & Database Interaction*

| ID | Test Case | Action | Expected Result | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-101** | **Auth Enforcement** | Call Actions without Login | **BLOCKED (401/Error)** | **CRITICAL** | ✅ **FIXED** |
| **TC-102** | Database Constraint | Create Document with non-existent `typeId` | Error handled | High | Pending |
| **TC-103** | Cascade Delete | Delete Document with 5 Steps | Steps GONE | High | Pending |

## 4. Implementation Plan
1.  **Scaffold Test Environment:** Configure Jest to mock `next/cache` and `@/lib/prisma/client`.
2.  **Implement Critical Tests:** Write `actions.test.ts` covering TC-001, TC-002, and TC-004.
3.  **Remediate Code:** Refactor `actions.ts` to include Auth checks (fixing TC-101).

## 5. Metrics for Success
*   **Statement Coverage:** > 80% for `src/features`.
*   **Branch Coverage:** > 75% (Ensuring error paths are tested).
*   **Test Execution Time:** < 5s for Unit Suite.
