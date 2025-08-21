import { ColumnDef, PaginationState, RowSelectionState, SortingState, Table } from '@tanstack/react-table';

export interface DataTableResource<TData> {
    name: string;
    rowId: string;
    emptyText: string;
    enableRowSelection: boolean;
    columns: DataTableColumn[];
    filters: DataTableFilter[];
    state: DataTableState;
    results: DataTableResourceResults<TData>;
    meta: DataTableResourceMeta;
}

export interface DataTableColumn {
    id: string;
    accessorKey: string;
    header: string;
    enableSorting: boolean;
    enableGlobalFilter: boolean;
    enableHiding: boolean;
}

export interface DataTableFilter {
    type: 'text' | 'date' | 'select';
    attribute: string;
    label: string;
    clauses: DataTableFilterClause[];
    meta: DataTableFilterMeta | null;
    hasDefaultValue: boolean;
}

export interface DataTableFilterClause {
    label: string;
    value: string;
}

export interface DataTableFilterMeta {
    format?: string;
    picker?: string;
    options?: DataTableFilterOption[];
    multiple?: boolean;
    searchable?: boolean;
    placeholder?: string;
}

export interface DataTableFilterOption {
    value: string;
    label: string;
}

export interface DataTableFilterState {
    [key: string]: DataTableFilterStateItem;
}

export interface DataTableFilterStateItem {
    enabled: boolean;
    value: any;
    clause: string;
}

export interface DataTableResourceResults<TData> {
    data: TData[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: DataTableResourceResultsLink[];
    next_page_url: any;
    path: string;
    per_page: number;
    prev_page_url: any;
    to: number;
    total: number;
}

export interface DataTableResourceResultsLink {
    url?: string;
    label: string;
    active: boolean;
}

export interface DataTableResourceMeta {
    has_filters: boolean;
    filter_summary: DataTableResourceMetaFilterSummary[];
    filter_count: number;
    sortable_columns: string[];
    toggleable_columns: string[];
    default_sort: string[];
    searchable_columns: string[];
    per_page_options: {
        value: number;
        label: string;
    }[];
}

export interface DataTableResourceMetaFilterSummary {
    attribute: string;
    label: string;
    value: string;
    clause: string;
    clause_label: string;
}

// TABLE
export type DataTableBulkActions = {
    icon?: React.ReactNode;
    name: string;
    event?: () => void;
    color?: string;
};

export type DataTableExportActions = {
    icon?: React.ReactNode;
    name: string;
    event?: () => void;
    color?: string;
};

export interface DataTableActionsRow<TData> {
    icon?: React.ReactNode;
    name: string;
    event?: (row: TData) => void;
    color?: string;
}

export interface DataTableState {
    filters: DataTableFilterState;
    perPage: number;
    page: number;
    search: string;
    sort: string[];
}

export interface DataTableProviderProps<TData> {
    bulkActions: DataTableBulkActions[];
    exportActions: DataTableExportActions[];
    actionsRow?: (row: TData) => DataTableActionsRow<TData>[];
    resource: DataTableResource<TData>;
    children: React.ReactNode;
    transformerColumns?: DataTableTransformersTableResolver<TData>;
}

export type DataTableTransformColumnFn<TData> = (column: ColumnDef<TData>) => ColumnDef<TData>;
export type DataTableTransformersTableResolver<TData> = Record<string, DataTableTransformColumnFn<TData>>;

export interface DataTableProviderContext<TData>
    extends Pick<DataTableProviderProps<TData>, 'resource' | 'actionsRow' | 'bulkActions' | 'exportActions'> {
    table: Table<TData>;
    isTableEmpty: boolean;
    isLoading: boolean;
    globalSearch: string | null;
    handleGlobalSearch: (value: string) => void;
    openFilters: boolean;
    toggleOpenFilters: () => void;
    filters: DataTableFilter[];
    filterStates: DataTableFilterState;
    handleOnChangeFilter: (attribute: string, state: Partial<DataTableFilterStateItem>) => void;
    handleResetAllFilters: () => void;
    activeFiltersCount: number;
    handleClearFilters: () => void;
    rowSelection: RowSelectionState;
    totalSelectedRows: number;
}

export type DataTableProps<TData> = Pick<
    DataTableProviderProps<TData>,
    'resource' | 'actionsRow' | 'bulkActions' | 'transformerColumns' | 'exportActions'
>;

export interface DataTableClientQuery {
    pagination?: PaginationState;
    sorting?: SortingState;
    globalSearch?: string;
    filter?: DataTableFilterState;
}

export interface DataTableServerQuery {
    page?: number;
    per_page?: number;
    sort?: string;
    search?: string;
    filter?: DataTableServerQueryFilters;
}

export interface DataTableServerQueryFilters {
    [key: string]: {
        op: string;
        value?: string;
    };
}
