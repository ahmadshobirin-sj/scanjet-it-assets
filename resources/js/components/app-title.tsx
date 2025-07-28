import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import React, { FC } from 'react';
import { Card, CardContent } from './ui/card';

export type AppTitleProps = {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    head?: {
        title?: string;
        description?: string;
    };
    containerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const AppTitle: FC<AppTitleProps> = ({
    title = 'AppTitle',
    subtitle = 'Subtitle goes here',
    actions,
    className,
    containerClassName,
    head,
    ...props
}) => {
    return (
        <Card className={cn(containerClassName)}>
            <CardContent>
                <div className={cn('flex items-center justify-between gap-4', className)} {...props}>
                    <Head>
                        <title>{head?.title || title}</title>
                        <meta name="description" content={head?.description || subtitle} />
                    </Head>

                    <div>
                        {title && <h1 className="text-2xl font-semibold">{title}</h1>}
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </CardContent>
        </Card>
    );
};

export default AppTitle;
