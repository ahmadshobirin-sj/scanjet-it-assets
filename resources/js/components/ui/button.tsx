import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
                ghost: "",
            },
            size: {
                sm: "h-8 rounded-md px-2 text-xs",
                md: "h-9 px-4 py-2 text-sm", // default
                lg: "h-10 px-6 text-base",
                xl: "h-12 px-8 text-lg",
                icon: "size-8 p-0",
            },
        },
        compoundVariants: [
            // Fill styles
            {
                intent: "primary",
                variant: "fill",
                className: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "fill",
                className: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "fill",
                className: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "fill",
                className: "bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "fill",
                className: "bg-success text-white hover:bg-success/90 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "fill",
                className: "bg-info text-white hover:bg-info/90 focus-visible:ring-info",
            },

            // Outline styles
            {
                intent: "primary",
                variant: "outline",
                className: "border border-primary text-primary bg-transparent hover:bg-primary/10 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "outline",
                className: "border border-secondary text-secondary-foreground bg-transparent hover:bg-secondary/10 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "outline",
                className: "border border-destructive text-destructive bg-transparent hover:bg-destructive/10 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "outline",
                className: "border border-warning text-warning hover:bg-warning/5 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "outline",
                className: "border border-success text-success hover:bg-success/5 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "outline",
                className: "border border-info text-info hover:bg-info/5 focus-visible:ring-info",
            },

            // Light styles
            {
                intent: "primary",
                variant: "light",
                className: "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "light",
                className: "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "light",
                className: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "light",
                className: "bg-warning/10 text-warning hover:bg-warning/20 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "light",
                className: "bg-success/10 text-success hover:bg-success/20 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "light",
                className: "bg-info/10 text-info hover:bg-info/20 focus-visible:ring-info",
            },

            // Ghost styles
            {
                intent: "primary",
                variant: "ghost",
                className: "text-primary hover:bg-primary/10 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "ghost",
                className: "text-secondary-foreground hover:bg-secondary/10 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "ghost",
                className: "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "ghost",
                className: "text-warning hover:bg-warning/10 focus-visible:ring-warning",
            },
            {
                intent: "success",
                variant: "ghost",
                className: "text-success hover:bg-success/10 focus-visible:ring-success",
            },
            {
                intent: "info",
                variant: "ghost",
                className: "text-info hover:bg-info/10 focus-visible:ring-info",
            },
        ],
        defaultVariants: {
            intent: "primary",
            variant: "fill",
            size: "md",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leading?: React.ReactNode;
    leadingClassName?: string;
    trailingClassName?: string;
    trailing?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        loading,
        disabled,
        leading,
        leadingClassName,
        trailing,
        trailingClassName,
        children,
        intent,
        variant,
        size,
        asChild = false,
        ...props },
        ref) => {
        const Comp = asChild ? Slot : "button"

        if (Comp !== 'button') {
            return <Comp
                className={cn(buttonVariants({ intent, variant, size, className }))}
                ref={ref}
                children={children}
                {...props}
            />
        }
        return (
            <Comp
                className={cn(buttonVariants({ intent, variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        {children}
                    </>
                ) : (
                    <>
                        {leading && <Slot className={cn(leadingClassName, 'size-4')}>{leading}</Slot>}
                        {children}
                        {trailing && <Slot className={cn(trailingClassName, 'size-4')}>{trailing}</Slot>}
                    </>
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
