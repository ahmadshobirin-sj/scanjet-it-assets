import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"

const size = {
    sm: "size-3.5",
    md: "size-4.5",
    lg: "size-5.5",
    xl: "size-6.5",
}

const defaultSize = "md"

const checkboxVariants = cva(
    "peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            intent: {
                primary: "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
                secondary: "data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:border-secondary",
                destructive: "data-[state=checked]:bg-destructive data-[state=checked]:text-white data-[state=checked]:border-destructive",
                warning: "data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground data-[state=checked]:border-warning",
                success: "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground data-[state=checked]:border-success",
                info: "data-[state=checked]:bg-info data-[state=checked]:text-info-foreground data-[state=checked]:border-info",
            },
            size: size
        },
        defaultVariants: {
            intent: "primary",
            size: defaultSize,
        },
    }
)

const checkboxIconVariants = cva(
    "",
    {
        variants: {
            size: size,
        },
        defaultVariants: {
            size: defaultSize,
        },
    }
)

function Checkbox({
    className,
    intent,
    size,
    ...props
}: VariantProps<typeof checkboxVariants> & React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(checkboxVariants({ intent, size }), className)}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className={cn(checkboxIconVariants({ size }))} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
}

export { Checkbox }
