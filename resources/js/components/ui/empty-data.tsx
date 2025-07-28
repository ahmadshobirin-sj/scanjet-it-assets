import { cn } from '@/lib/utils'
import React, { ReactElement, ReactNode } from 'react'

interface EmptyDataProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: ReactElement
    message?: ReactNode
    children?: ReactNode
}

const EmptyData: React.FC<EmptyDataProps> = ({ icon, message = 'No data available', children, className, ...props }) => {
    return (
        <div
            className={cn("flex flex-col items-center justify-center h-full p-4 text-center bg-secondary rounded-md", className)}
            {...props}
        >
            {icon && <div className="mb-2">{icon}</div>}
            <p className="text-sm text-muted-foreground">{message}</p>
            {children}
        </div>
    )
}

export default EmptyData
