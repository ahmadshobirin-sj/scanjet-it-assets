import { cn } from '@/lib/utils'
import React from 'react'

function AppContainer({ children, className, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('p-4', className)} {...props}>
            {children}
        </div>
    )
}

export default AppContainer
