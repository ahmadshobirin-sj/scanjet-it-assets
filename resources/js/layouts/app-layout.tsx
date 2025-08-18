import AppToast from '@/components/toast';
import { Toaster } from '@/components/ui/sonner';
import { useInertiaFlashToastOnce } from '@/hooks/useFlash';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { ConfirmDialog } from '@/lib/confirmDialog';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    useInertiaFlashToastOnce(
        ({ message, intent }) => {
            AppToast({ message, intent });
        },
        {
            scope: 'global',
        },
    );

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster richColors position="top-right" />
            <ConfirmDialog />
        </AppLayoutTemplate>
    );
};
