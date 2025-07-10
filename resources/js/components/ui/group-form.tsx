import { cn } from "@/lib/utils"
import React from "react"


export type GroupFormProps = {} & React.HTMLAttributes<HTMLFormElement>

const GroupForm = React.forwardRef<HTMLFormElement, GroupFormProps>(({ className, ...props }, ref) => {
    return <form ref={ref} className={cn('grid flex-1 auto-rows-min gap-5', className)} {...props} />
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

export {
    GroupForm,
    GroupFormItem,
    GroupFormField
}
