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
