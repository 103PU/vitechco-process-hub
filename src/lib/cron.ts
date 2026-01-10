import { prisma } from "@/lib/prisma/client"

/**
 * Deletes audit logs older than the specified retention days.
 * Default is 60 days.
 */
export async function cleanupAuditLogs(retentionDays = 60) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    try {
        const output = await prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        })
        console.log(`[Cron] Deleted ${output.count} audit logs older than ${retentionDays} days.`)
        return output.count
    } catch (error) {
        console.error("[Cron] Failed to cleanup audit logs:", error)
        throw error
    }
}
