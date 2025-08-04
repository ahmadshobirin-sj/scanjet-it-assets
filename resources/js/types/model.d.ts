export interface TableServerState {
    sort: string[];
    filters: Record<string, any>;
    per_page: number;
    page: number;
}

export interface MetaResponseCollection {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    path: string;
    links: LinksMetaResponseCollection[];
}

export interface LinksMetaResponseCollection {
    active: boolean;
    label: string;
    url: string | null;
}

export interface LinksResponseCollection {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface ResponseCollection<T> {
    data: T[];
    links: LinksResponseCollection;
    meta: MetaResponseCollection;
}

export interface ResponseResource<T> {
    data: T;
}

export interface User {
    id: string;
    name: string;
    email: string;
    given_name: string;
    surname: string;
    user_principal_name: string;
    business_phones: string[] | null;
    mobile_phone: string;
    job_title: string;
    office_location: string;
    roles: Role[];
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: string;
    name: UserRole;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
    f_created_at: string;
    f_updated_at: string;
}

export interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export enum UserRole {
    ADMIN = 'Admin',
    SUPER_ADMIN = 'Super Admin',
    INACTIVE = 'Inactive',
}

export interface Manufacture {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contact_person_name: string;
    contact_person_phone: string;
    contact_person_email: string;
    created_at: string;
    updated_at: string;
}

export interface AssetCategory {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    f_created_at: string;
    f_updated_at: string;
}

export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'lost' | 'scrapped' | 'returned';

export interface Asset {
    id: string;
    name: string;
    location: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    warranty_expired: string | null;
    last_maintenance: string | null;
    status: AssetStatus;
    assigned_at: string | null;
    category: AssetCategory;
    manufacture: Manufacture;
    assigned_user: AssetAssignedUser | null;
    note: string | null;
    reference_link: string | null;
    created_at: string;
    updated_at: string;
}

export type AssetColumn = Omit<Asset, 'category' | 'manufacture' | 'assignedUser'> & {
    'category.name': string | null;
    'manufacture.name': string | null;
};

export interface AssetAssignedUser {
    id: string;
    name: string;
    email: string;
    job_title: string;
    office_location: string;
}

export interface AssetAssignment {
    id: string;
    asset_id: string;
    assigned_user_id: string;
    user_id: string;
    notes: string | null;
    status: string;
    condition: string;
    assigned_at: string | null;
    returned_at: string | null;
    asset: Asset;
    assignedUser: AssetAssignedUser | null;
    assignedBy: User | null;
}

export interface AppNotification {
    id: string;
    message: string;
    description: string;
    status: any;
    url: string | null;
    ui_type: string;
    created_at: string;
}
