import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const switchVariants = cva(
    "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            intent: {
                primary: "data-[state=checked]:bg-[var(--color-primary)]",
                secondary: "data-[state=checked]:bg-[var(--color-secondary)]",
                warning: "data-[state=checked]:bg-[var(--color-warning)]",
                info: "data-[state=checked]:bg-[var(--color-info)]",
                destructive: "data-[state=checked]:bg-[var(--color-destructive)]",
                success: "data-[state=checked]:bg-[var(--color-success)]",
            },
            size: {
                sm: "h-4 w-7",
                md: "h-[1.15rem] w-8",
                lg: "h-6 w-10",
                xl: "h-7 w-12"
            },
        },
        defaultVariants: {
            intent: "primary",
            size: "md",
        },
    }
)

interface SwitchProps
    extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> { }

function Switch({ className, intent, size, ...props }: SwitchProps) {
    const thumbSize = {
        sm: "size-3 data-[state=checked]:translate-x-[calc(100%-1px)]",
        md: "size-4 data-[state=checked]:translate-x-[calc(100%-2px)]",
        lg: "size-5 data-[state=checked]:translate-x-[calc(100%-2px)]",
        xl: "size-6 data-[state=checked]:translate-x-[calc(100%-2px)]"
    }

    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                switchVariants({ intent, size }),
                "data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "pointer-events-none block rounded-full ring-0 transition-transform bg-background",
                    "dark:data-[state=unchecked]:bg-foreground",
                    intent && `dark:data-[state=checked]:bg-[var(--color-${intent}-foreground)]`,
                    "data-[state=unchecked]:translate-x-0",
                    thumbSize[size || "md"]
                )}
            />
        </SwitchPrimitive.Root>
    )
}

export { Switch }
