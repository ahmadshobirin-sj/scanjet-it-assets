import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

// Grid column utility with clamping via cva (1–8)
const gridColumns = cva("grid gap-4", {
    variants: {
        columns: {
            1: "sm:grid-cols-1",
            2: "sm:grid-cols-2",
            3: "sm:grid-cols-3",
            4: "sm:grid-cols-4",
            5: "sm:grid-cols-5",
            6: "sm:grid-cols-6",
            7: "sm:grid-cols-7",
            8: "sm:grid-cols-8",
        },
    },
    defaultVariants: {
        columns: 1,
    },
});

type GridColumnsProps = VariantProps<typeof gridColumns>;

/**
 * InfoListContainer is a component that displays a container for a list of information items.
 */
interface InfoListContainerProps extends React.ComponentProps<"div"> {
    columns?: GridColumnsProps["columns"];
    hasGroups?: boolean;
}

const InfoListContainer = React.forwardRef<HTMLDivElement, InfoListContainerProps>(
    ({ className, columns = 1, hasGroups = false, ...props }, ref) => {
        const clamped = Math.min(Math.max(columns || 1, 1), 8) as NonNullable<GridColumnsProps["columns"]>;
        const spacing = hasGroups ? "gap-6" : "gap-4";

        return (
            <div
                ref={ref}
                className={cn(
                    `grid ${spacing}`,
                    clamped === 1 ? "sm:grid-cols-1" :
                        clamped === 2 ? "sm:grid-cols-2" :
                            clamped === 3 ? "sm:grid-cols-3" :
                                clamped === 4 ? "sm:grid-cols-4" :
                                    clamped === 5 ? "sm:grid-cols-5" :
                                        clamped === 6 ? "sm:grid-cols-6" :
                                            clamped === 7 ? "sm:grid-cols-7" :
                                                "sm:grid-cols-8",
                    className
                )}
                {...props}
            />
        );
    }
);
InfoListContainer.displayName = "InfoListContainer";

/**
 * InfoListGroup is a component that groups a list of information items.
 */
interface InfoListGroupProps extends React.ComponentProps<"div"> {
    title?: string;
    columns?: number;
}

const InfoListGroup = React.forwardRef<HTMLDivElement, InfoListGroupProps>(
    ({ className, title, children, columns = 1, ...props }, ref) => {
        const clamped = Math.min(Math.max(columns, 1), 8) as NonNullable<GridColumnsProps["columns"]>;
        return (
            <div
                ref={ref}
                className={cn("flex flex-col gap-3", className)}
                {...props}
            >
                {title && (
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {title}
                    </h3>
                )}
                <div className={cn(gridColumns({ columns: clamped }), "gap-3")}>
                    {children}
                </div>
            </div>
        );
    }
);
InfoListGroup.displayName = "InfoListGroup";

/**
 * InfoList is a component that displays a list of information items.
 */
interface InfoListProps extends React.ComponentProps<"div"> {
    direction?: "row" | "column";
}

const InfoList = React.forwardRef<HTMLDivElement, InfoListProps>(
    ({ className, direction = "row", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "gap-1",
                    direction === "row" ? "flex items-center" : "flex flex-col",
                    className
                )}
                {...props}
            />
        );
    }
);
InfoList.displayName = "InfoList";

/**
 * InfoListLabel is a component that displays the label of an information item.
 */
const InfoListLabel = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
    ({ className, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn("text-sm font-medium leading-none text-muted-foreground", className)}
                {...props}
            />
        );
    }
);
InfoListLabel.displayName = "InfoListLabel";

/**
 * InfoListContent is a component that displays the content of an information item.
 */
const InfoListContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-sm font-normal", className)}
                {...props}
            />
        );
    }
);
InfoListContent.displayName = "InfoListContent";

export {
    InfoListContainer,
    InfoListGroup,
    InfoList,
    InfoListLabel,
    InfoListContent,
};
