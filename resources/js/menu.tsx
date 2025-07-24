import { NavGroup } from '@/types';
import { Boxes, Building2, LayoutGrid, Logs, NotebookPen, ShieldUser, SquareUser, Tags } from 'lucide-react';

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
        title: 'Manage assets',
        items: [
            {
                title: 'Assignment',
                icon: NotebookPen,
                href: route('asset-assignment.index', undefined, false),
                meta: {
                    permission: ['asset_assignment.viewAny'],
                },
            },
            {
                title: 'Assets',
                icon: Boxes,
                href: route('asset.index', undefined, false),
                meta: {
                    permission: ['asset.viewAny'],
                },
            },
            {
                title: 'Categories',
                href: route('asset_category.index', undefined, false),
                icon: Tags,
                meta: {
                    permission: ['asset_category.viewAny'],
                },
            },
            {
                title: 'Manufactures',
                href: route('manufacture.index', undefined, false),
                icon: Building2,
                meta: {
                    permission: ['manufacture.viewAny'],
                },
            },
            {
                title: 'Logs',
                icon: Logs,
                meta: {
                    permission: ['asset_category.viewAny'],
                },
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
                    permission: ['user.viewAny'],
                },
            },
            {
                title: 'Roles',
                href: route('role.index', undefined, false),
                icon: ShieldUser,
                meta: {
                    permission: ['role.viewAny'],
                },
            },
        ],
    },
];

export const footerNavItemsRaw: NavGroup[] = [];
