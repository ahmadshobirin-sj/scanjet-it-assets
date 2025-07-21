import { ColumnDef, ColumnFiltersState, PaginationState, RowSelectionState, SortingState, VisibilityState } from '@tanstack/react-table';

export interface DataGridState {
    pagination?: PaginationState;
    sorting?: SortingState;
    globalFilter?: string;
    columnFilters?: ColumnFiltersState;
    rowSelection?: RowSelectionState;
    columnVisibility?: VisibilityState;
}

export interface ActionsRow<TData> {
    name: string;
    event?: (row: TData) => void;
    color?: string;
}

export interface DataGridProps<TData> {
    rows: TData[];
    columns: ColumnDef<TData>[];
    initialTableState?: DataGridState;
    tableState?: DataGridState;
    pageSizeOptions?: number[];
    enableRowSelection?: boolean;
    onPaginationChange?: (pagination: PaginationState) => void;
    onSortingChange?: (sorting: SortingState) => void;
    onSelectionChange?: (rowSelection: RowSelectionState) => void;
    onGlobalFilterChange?: (globalFilter: string) => void;
    onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void;
    onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void;
    className?: string;
    serverSide?: boolean;
    actionsToolbar?: {
        icon: React.ReactNode;
        name: string;
        event?: () => void;
        color?: string;
    }[];
    rowCount?: number;
    rowId?: (row: TData) => string;
    actionsRow?: (row: TData) => ActionsRow<TData>[];
    emptyText?: string;
    debounceDelay?: number;
}
