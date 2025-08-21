import AppFlashMessage from '@/components/app-flash-message';
import AppToast from '@/components/toast';
import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { ConfirmDialog } from '@/lib/confirmDialog';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <AppFlashMessage
                notify={({ intent, message }) => {
                    AppToast({ message, intent });
                }}
            />

            {children}
            <Toaster richColors position="top-right" />
            <ConfirmDialog />
        </AppLayoutTemplate>
    );
};
