import * as React from "react"

import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot";

export interface InputProps extends React.ComponentProps<"input"> {
    wrapperClass?: string;

    leading?: React.ReactNode;
    leadingClass?: string;
    leadingContainerClass?: string;

    trailing?: React.ReactNode;
    trailingClass?: string;
    trailingContainerClass?: string;
}

function Input({
    className,
    wrapperClass,
    leading,
    leadingContainerClass,
    leadingClass,
    trailing,
    trailingClass,
    trailingContainerClass,
    type,
    ...props
}: InputProps) {

    return (
        <div className={cn("relative", wrapperClass)}>
            {!!leading && (
                <Slot
                    className={cn(
                        'absolute top-1/2 left-3 -translate-y-1/2 size-4',
                        leadingContainerClass,
                    )}
                >
                    {leading}
                </Slot>
            )}
            <input
                type={type}
                data-slot="input"
                className={cn(
                    !!leading && cn('!pl-9', leadingClass),
                    !!trailing && cn('!pr-9', trailingClass),
                    "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    className
                )}
                {...props}
            />
            {!!trailing && (
                <Slot
                    className={cn(
                        'absolute top-1/2 right-3 -translate-y-1/2 size-4',
                        trailingContainerClass,
                    )}
                >
                    {trailing}
                </Slot>
            )}
        </div>
    )
}

export { Input }
