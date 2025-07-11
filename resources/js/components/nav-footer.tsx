import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';
import { NavMain } from './nav-main';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavGroup[];
}) {
    return (
        <div className={className} {...props}>
            <NavMain items={items} />
        </div>
    );
}
