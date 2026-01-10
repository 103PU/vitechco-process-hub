import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/features/auth/config/authOptions"

export async function logAudit({
    action,
    entity,
    entityId,
    actorId,
    payload,
}: {
    action: string
    entity: string
    entityId: string
    actorId?: string
    payload?: any
}) {
    try {
        let effectiveActorId = actorId
        if (!effectiveActorId) {
            // Try to get session if not provided
            const session = await getServerSession(authOptions)
            effectiveActorId = (session?.user as any)?.id
        }

        if (!effectiveActorId) {
            console.warn("[Audit] No actor provided for audit log")
            return
        }

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                actorId: effectiveActorId,
                payload: payload ? payload : undefined,
            },
        })
    } catch (error) {
        console.error("[Audit] Failed to log audit:", error)
        // Don't throw, audit failure shouldn't block main action? Depends on strictness.
    }
}
