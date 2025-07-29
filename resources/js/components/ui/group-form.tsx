import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

// Grid column utility dengan cva (1–8) - sama seperti InfoList
const gridColumns = cva("grid gap-5", {
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

export type GroupFormProps = {
    columns?: GridColumnsProps["columns"];
    hasGroups?: boolean;
} & React.HTMLAttributes<HTMLDivElement>

const GroupForm = React.forwardRef<HTMLDivElement, GroupFormProps>(({
    className,
    columns = 1,
    hasGroups = false,
    ...props
}, ref) => {
    const clamped = Math.min(Math.max(columns || 1, 1), 8) as NonNullable<GridColumnsProps["columns"]>;
    const spacing = hasGroups ? "gap-6" : "gap-5";

    return (
        <div
            ref={ref}
            className={cn(
                `grid flex-1 auto-rows-min ${spacing}`,
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
    )
})

GroupForm.displayName = "GroupForm"

export type GroupFormItemProps = {} & React.HTMLAttributes<HTMLDivElement>

const GroupFormItem = React.forwardRef<HTMLDivElement, GroupFormItemProps>(({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
})

GroupFormItem.displayName = "GroupFormItem"

export type GroupFormFieldProps = {
    direction?: 'row' | 'column'
} & React.HTMLAttributes<HTMLDivElement>

const GroupFormField = React.forwardRef<HTMLDivElement, GroupFormFieldProps>(({ className, direction = "column", ...props }, ref) => {
    return <div ref={ref} className={cn('flex gap-2', {
        'flex-col': direction === 'column',
        'flex-row items-center': direction === 'row',
    }, className)} {...props} />
})

GroupFormField.displayName = "GroupFormField"

// Komponen baru untuk grouping form fields (seperti InfoListGroup)
export type GroupFormGroupProps = {
    title?: string;
    columns?: number;
} & React.HTMLAttributes<HTMLDivElement>

const GroupFormGroup = React.forwardRef<HTMLDivElement, GroupFormGroupProps>(({
    className,
    title,
    children,
    columns = 1,
    ...props
}, ref) => {
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
            <div className={cn(gridColumns({ columns: clamped }), "gap-5")}>
                {children}
            </div>
        </div>
    );
})

GroupFormGroup.displayName = "GroupFormGroup"

export {
    GroupForm,
    GroupFormItem,
    GroupFormField,
    GroupFormGroup
}
