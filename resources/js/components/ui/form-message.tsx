import { cn } from "@/lib/utils";
import React from "react";

export type FormMessageProps = {
    error?: boolean,
    success?: boolean,
} & React.HTMLAttributes<HTMLParagraphElement>

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    FormMessageProps
>(({ className, error, success, ...props }, ref) => {

    return (
        <span
            ref={ref}
            className={cn(
                "text-muted-foreground",
                "text-sm",
                "leading-none",
                {
                    "text-destructive": error,
                    "text-success": success,
                },
                className
            )}
            {...props}
        />
    )
})
FormMessage.displayName = "FormMessage"

export {
    FormMessage
}
