import { cn } from '@/lib/utils'
import React from 'react'

function AppContainer({ children, className, withPadding = true, ...props }: { children: React.ReactNode, withPadding?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('w-full mx-auto',
            withPadding ? 'p-4 sm:p-6 md:p-8 lg:p-10' : '', className)} {...props}>
            {children}
        </div>
    )
}

export default AppContainer
