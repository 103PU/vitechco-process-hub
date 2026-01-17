import { describe, expect, test } from "vitest"

// Mock definitions
const Role = {
    ADMIN: "ADMIN",
    TECHNICIAN: "TECHNICIAN",
    IT: "IT",
}

function isAuthorized(path: string, role?: string) {
    if (path.startsWith("/admin") && role !== Role.ADMIN && role !== Role.IT) {
        return false
    }
    return true
}

describe("RBAC Logic", () => {
    test("allows admin to access /admin", () => {
        expect(isAuthorized("/admin/dashboard", Role.ADMIN)).toBe(true)
    })

    test("allows admin to access /admin", () => {
        expect(isAuthorized("/admin/dashboard", Role.IT)).toBe(true)
    })

    test("denies technician to access /admin", () => {
        expect(isAuthorized("/admin/users", Role.TECHNICIAN)).toBe(false)
    })

    test("denies user without role to access /admin", () => {
        expect(isAuthorized("/admin/settings", undefined)).toBe(false)
    })

    test("allows technician to access /home", () => {
        expect(isAuthorized("/home", Role.TECHNICIAN)).toBe(true)
    })

    test("allows user to access /home", () => {
        expect(isAuthorized("/home", Role.IT)).toBe(true)
    })
})
