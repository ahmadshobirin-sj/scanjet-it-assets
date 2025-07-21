import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: AuthUser;
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: NavItem[];
    hidden?: boolean;
    external?: boolean;
    badge?: string;
    meta?: {
        permission?: string[];
    };
}

export interface MetaNav {
    pageTitle?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    success?: string;
    [key: string]: unknown;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    msgraph_user_id: string;
    preferred_language: string;
    user_principal_name: string;
    business_phones: string[];
    given_name: string;
    surname: string;
    office_location: string;
    job_title: string;
    mobile_phone: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    permissions: string[];
}
