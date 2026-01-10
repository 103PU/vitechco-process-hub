import { cn } from "@/lib/utils"
// Use Lucide icons or similar if available, or just text
import { FileQuestion } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
}

export function EmptyState({
    title = "No data available",
    description = "There is nothing here yet.",
    icon: Icon = FileQuestion,
    className,
    children,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
                className
            )}
            {...props}
        >
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
                {children}
            </div>
        </div>
    )
}
