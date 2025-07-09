import { cn } from '@/lib/utils';
import React, { FC } from 'react'

export type AppTitleProps = {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>

const AppTitle: FC<AppTitleProps> = ({ title = "AppTitle", subtitle = "Subtitle goes here", actions, className, ...props }) => {
    return (
        <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
            <div>
                {title && <h1 className="text-2xl font-semibold">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {
                actions && <div className="flex items-center gap-2">
                    {actions}
                </div>
            }
        </div>
    )
}

export default AppTitle
