import { filterNavGroups } from '@/lib/menu';
import { footerNavItemsRaw, mainNavItemsRaw } from '@/menu';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const useMenu = () => {
    const page = usePage<SharedData>();
    const mainNavItems = filterNavGroups(mainNavItemsRaw, page.props.auth.user.permissions);
    const footerNavItems = filterNavGroups(footerNavItemsRaw, page.props.auth.user.permissions);

    const allNavItems = [...mainNavItems, ...footerNavItems];
    const allNavItemsWithoutGroups = [...mainNavItems, ...footerNavItems].flatMap((group) => group.items);
    return {
        mainNavItems,
        footerNavItems,
        allNavItems,
        allNavItemsWithoutGroups,
    };
};
