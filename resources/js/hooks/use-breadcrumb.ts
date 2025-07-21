import { BreadcrumbItem } from '@/types';

export function useBreadcrumb(component: string): BreadcrumbItem[] {
    switch (component) {
        case 'dashboard':
            return [{ title: 'Dashboard', href: '/' }];
        case 'user/list':
            return [{ title: 'Users', href: route('user.index') }];
        case 'role/list':
            return [{ title: 'Roles', href: route('role.index') }];
        case 'role/detail':
            return [{ title: 'Roles', href: route('role.index') }, { title: 'Detail' }];
        case 'role/create':
            return [{ title: 'Roles', href: route('role.index') }, { title: 'Create' }];
        case 'role/edit':
            return [{ title: 'Roles', href: route('role.index') }, { title: 'Update' }];
        case 'manufacture/list':
            return [{ title: 'Manufactures', href: route('manufacture.index') }];
        case 'manufacture/create':
            return [{ title: 'Manufactures', href: route('manufacture.index') }, { title: 'Create' }];
        case 'manufacture/detail':
            return [{ title: 'Manufactures', href: route('manufacture.index') }, { title: 'Detail' }];
        default:
            return [];
    }
}
