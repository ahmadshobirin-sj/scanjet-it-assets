import { NavGroup, NavItem } from '@/types';

export function filterItems(items: NavItem[], permissions?: string[]): NavItem[] {
    return items
        .map((item) => {
            if (item.items) {
                const filteredChildren = filterItems(item.items, permissions);
                return {
                    ...item,
                    items: filteredChildren.length ? filteredChildren : undefined,
                };
            }
            return item;
        })
        .filter((item) => {
            if (!permissions) return true;
            const itemPermission = item.meta?.permission;

            const hasPermission = !itemPermission || itemPermission.some((p: string) => permissions?.includes(p));

            return !item.hidden && (!item.items || item.items.length > 0) && hasPermission;
        });
}

export function filterNavGroups(groups: NavGroup[], permissions?: string[]): NavGroup[] {
    return groups
        .map((group) => {
            const filteredItems = filterItems(group.items, permissions);
            return { ...group, items: filteredItems };
        })
        .filter((group) => group.items.length > 0);
}

export function isActivePath(current: string, target?: string): boolean {
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
}
