import { NavGroup, NavItem } from '@/types';
import {
    Boxes,
    Building2,
    ClipboardList,
    Cpu,
    LayoutGrid,
    NotebookPen,
    PackagePlus,
    ShieldUser,
    SquareLibraryIcon,
    SquareUser,
    Table,
    Tags,
    UserCogIcon,
} from 'lucide-react';

export const mainNavItemsRaw: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard', undefined, false),
        icon: LayoutGrid,
    },
    {
        title: 'Assignment',
        icon: NotebookPen,
        meta: {
            permission: ['asset_assignment.viewAny', 'asset_assignment.create'],
        },
        items: [
            {
                title: 'View Assignments',
                icon: Table,
                href: route('asset-assignment.index', undefined, false),
                meta: {
                    permission: ['asset_assignment.create'],
                },
            },
            {
                title: 'Assign assets',
                icon: PackagePlus,
                href: route('asset-assignment.assign', undefined, false),
                meta: {
                    permission: ['asset_assignment.create'],
                },
            },
        ],
    },
    {
        title: 'Manage Assets',
        icon: ClipboardList,
        items: [
            {
                title: 'Assets',
                href: route('asset.index', undefined, false),
                icon: Boxes,
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
        ],
    },
    {
        title: 'User Manage',
        icon: UserCogIcon,
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
    {
        title: 'System',
        icon: Cpu,
        items: [
            {
                title: 'Media Library',
                href: route('media-library.index'),
                icon: SquareLibraryIcon,
                meta: {
                    permission: ['media_library.viewAny', 'media_library.create'],
                },
            },
        ],
    },
];

export const footerNavItemsRaw: NavGroup[] = [];
