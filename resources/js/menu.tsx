import { NavGroup } from '@/types';
import { LayoutGrid, ShieldUser, SquareUser } from 'lucide-react';

export const mainNavItemsRaw: NavGroup[] = [
    {
        title: 'General',
        items: [
            {
                title: 'Dashboard',
                href: route('dashboard', undefined, false),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Manage',
        items: [
            {
                title: 'User',
                href: route('user.index', undefined, false),
                icon: SquareUser,
                meta: {
                    permission: 'user.viewAny',
                }
            },
            {
                title: 'Roles',
                href: route('role.index', undefined, false),
                icon: ShieldUser,
                meta: {
                    permission: 'role.viewAny',
                }
            }

        ],
    },
];

export const footerNavItemsRaw: NavGroup[] = [
];
