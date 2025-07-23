import { ColumnDef, ColumnFiltersState, PaginationState, RowSelectionState, SortingState, VisibilityState } from '@tanstack/react-table';
import type { JSX } from 'react';

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
    filterFields?: DataGridFilterField<TData>[];
    isLoading?: boolean;
}

export type DataGridFilterOption = {
    label: string;
    value: string | boolean | number | undefined;
    [key: string]: any; // Allow additional properties
};

export type DataGridSearchResult = {
    label: string;
    value: string | number | boolean;
    [key: string]: any; // Allow all additional properties to be preserved
};

export type DataGridFilterInput = {
    type: 'input';
    options?: DataGridFilterOption[];
};

export type DataGridFilterSelect = {
    type: 'select';
    options?: DataGridFilterOption[];
    component?: (props: DataGridFilterOption) => JSX.Element | null;
    multiple?: boolean;
    onSearch?: (value: string) => Promise<DataGridSearchResult[]>;
};

export type DataGridFilterCheckbox = {
    type: 'checkbox';
    component?: (props: DataGridFilterOption) => JSX.Element | null;
    options?: DataGridFilterOption[];
};

export type DataGridFilterSlider = {
    type: 'slider';
    min: number;
    max: number;
    // if options is undefined, we will provide all the steps between min and max
    options?: DataGridFilterOption[];
};

export type DataGridFilterTimerange = {
    type: 'timerange';
    options?: DataGridFilterOption[]; // required for TS
};

export type DataGridFilterRadio = {
    type: 'radio';
    options?: DataGridFilterOption[];
    component?: (props: DataGridFilterOption) => JSX.Element | null;
};

export type DataGridFilterBase<TData> = {
    label: string;
    value: keyof TData;
    /**
     * Defines if the accordion in the filter bar is open by default
     */
    defaultOpen?: boolean;
    /**
     * Defines if the command input is disabled for this field
     */
    commandDisabled?: boolean;
};

export type DataGridCheckboxFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterCheckbox;
export type DataGridSliderFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterSlider;
export type DataGridInputFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterInput;
export type DataGridTimerangeFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterTimerange;
export type DataGridSelectFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterSelect;
export type DataGridRadioFilterField<TData> = DataGridFilterBase<TData> & DataGridFilterRadio;

export type DataGridFilterField<TData> =
    | DataGridCheckboxFilterField<TData>
    | DataGridSliderFilterField<TData>
    | DataGridInputFilterField<TData>
    | DataGridTimerangeFilterField<TData>
    | DataGridSelectFilterField<TData>
    | DataGridRadioFilterField<TData>;
