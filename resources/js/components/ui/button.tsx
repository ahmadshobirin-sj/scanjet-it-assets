import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
                sm: "h-8 rounded-md px-3 text-sm",
                md: "h-9 px-4 py-2 text-sm", // default
                lg: "h-10 px-6 text-base",
                xl: "h-12 px-8 text-lg",
                icon: "size-9 p-0",
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
                className: "bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500",
            },
            {
                intent: "success",
                variant: "fill",
                className: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
            },
            {
                intent: "info",
                variant: "fill",
                className: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500",
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
                className: "border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus-visible:ring-yellow-500",
            },
            {
                intent: "success",
                variant: "outline",
                className: "border border-green-600 text-green-700 hover:bg-green-50 focus-visible:ring-green-600",
            },
            {
                intent: "info",
                variant: "outline",
                className: "border border-blue-500 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500",
            },

            // Light styles
            {
                intent: "primary",
                variant: "light",
                className: "border border-primary bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary",
            },
            {
                intent: "secondary",
                variant: "light",
                className: "border border-secondary bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 focus-visible:ring-secondary",
            },
            {
                intent: "destructive",
                variant: "light",
                className: "border border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive",
            },
            {
                intent: "warning",
                variant: "light",
                className: "border border-yellow-500 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus-visible:ring-yellow-500",
            },
            {
                intent: "success",
                variant: "light",
                className: "border border-green-600 bg-green-100 text-green-800 hover:bg-green-200 focus-visible:ring-green-600",
            },
            {
                intent: "info",
                variant: "light",
                className: "border border-blue-500 bg-blue-100 text-blue-800 hover:bg-blue-200 focus-visible:ring-blue-500",
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
                className: "text-yellow-600 hover:bg-yellow-100 focus-visible:ring-yellow-500",
            },
            {
                intent: "success",
                variant: "ghost",
                className: "text-green-700 hover:bg-green-100 focus-visible:ring-green-600",
            },
            {
                intent: "info",
                variant: "ghost",
                className: "text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500",
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
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, intent, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                className={cn(buttonVariants({ intent, variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
