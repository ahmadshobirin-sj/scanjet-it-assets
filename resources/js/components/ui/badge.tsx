import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-auto",
    {
        variants: {
            intent: {
                primary: "",
                secondary: "",
                destructive: "",
                warning: "",
                success: "",
                info: "",
            },
            variant: {
                fill: "",
                outline: "",
                light: "",
                ghost: ""
            },
            size: {
                sm: "text-xs py-0.5 px-1.5",
                md: "text-sm py-1 px-2",
                lg: "text-base py-1.5 px-3",
                xl: "text-lg py-2 px-4",
            },
        },
        compoundVariants: [
            // Fill styles
            {
                intent: "primary",
                variant: "fill",
                className:
                    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "fill",
                className:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "fill",
                className:
                    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "fill",
                className:
                    "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "fill",
                className:
                    "bg-success text-white hover:bg-success/90 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "fill",
                className:
                    "bg-info text-white hover:bg-info/90 focus-visible:ring-info",
            },

            // Outline styles
            {
                intent: "primary",
                variant: "outline",
                className:
                    "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "outline",
                className:
                    "border border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "outline",
                className:
                    "border border-destructive text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "outline",
                className:
                    "border border-warning text-warning hover:bg-warning/10 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "outline",
                className:
                    "border border-success text-success hover:bg-success/5 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "outline",
                className:
                    "border border-info text-info hover:bg-info/5 focus-visible:ring-info",
            },

            // Light styles
            {
                intent: "primary",
                variant: "light",
                className:
                    "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "light",
                className:
                    "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "light",
                className:
                    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "light",
                className:
                    "bg-warning/10 text-warning hover:bg-warning/20 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "light",
                className:
                    "bg-success/10 text-success hover:bg-success/20 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "light",
                className:
                    "bg-info/10 text-info hover:bg-info/20 focus-visible:ring-info",
            },

            // Ghost styles
            {
                intent: "primary",
                variant: "ghost",
                className:
                    "text-primary hover:bg-primary/10 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "ghost",
                className:
                    "text-secondary hover:bg-secondary/10 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "ghost",
                className:
                    "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "ghost",
                className:
                    "text-warning hover:bg-warning/10 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "ghost",
                className:
                    "text-success hover:bg-success/10 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "ghost",
                className:
                    "text-info hover:bg-info/10 focus-visible:ring-info",
            },
        ],
        defaultVariants: {
            variant: "fill",
            intent: "primary",
            size: "sm",
        },
    }
)

function Badge({
    className,
    variant,
    intent,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant, intent, size }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
