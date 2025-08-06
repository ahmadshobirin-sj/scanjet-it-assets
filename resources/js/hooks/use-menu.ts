import { filterItems } from '@/lib/menu';
import { footerNavItemsRaw, mainNavItemsRaw } from '@/menu';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const useMenu = () => {
    const page = usePage<SharedData>();

    const mainNavItems = filterItems(mainNavItemsRaw, page.props.auth.user.permissions);
    const footerNavItems = filterItems(footerNavItemsRaw, page.props.auth.user.permissions);

    const allNavItems = [...mainNavItems, ...footerNavItems];

    return {
        mainNavItems,
        footerNavItems,
        allNavItems,
    };
};
