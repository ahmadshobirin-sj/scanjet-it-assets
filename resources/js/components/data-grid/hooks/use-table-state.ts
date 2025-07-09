import { useState, useCallback, useRef, useEffect } from 'react';
import { PaginationState, SortingState, ColumnFiltersState, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { DataGridState } from '../data-grid.types';

export const useTableState = (
    initialTableState: DataGridState = {},
    tableState?: DataGridState,
    pageSizeOptions: number[] = [5, 10, 25, 50],
    onPaginationChange?: (pagination: PaginationState) => void,
    onSortingChange?: (sorting: SortingState) => void,
    onSelectionChange?: (rowSelection: RowSelectionState) => void,
    onGlobalFilterChange?: (globalFilter: string) => void,
    onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void,
    onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void,
    debounceDelay: number = 300
) => {
    // Internal state
    const [internalSorting, setInternalSorting] = useState<SortingState>(initialTableState.sorting || []);
    const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>(initialTableState.columnFilters || []);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>(initialTableState.globalFilter || '');
    const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>(initialTableState.rowSelection || {});
    const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(initialTableState.columnVisibility || {});
    const [internalPagination, setInternalPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: pageSizeOptions[0],
        ...initialTableState.pagination,
    });

    const [inputValue, setInputValue] = useState<string>(initialTableState.globalFilter || '');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce function
    const debouncedCallback = useCallback((callback: () => void, delay: number) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (delay === 0) {
            callback();
            return;
        }

        debounceRef.current = setTimeout(callback, delay);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Use external state if provided, otherwise use internal state
    const sorting = tableState?.sorting ?? internalSorting;
    const columnFilters = tableState?.columnFilters ?? internalColumnFilters;
    const globalFilter = tableState?.globalFilter ?? internalGlobalFilter;
    const rowSelection = tableState?.rowSelection ?? internalRowSelection;
    const columnVisibility = tableState?.columnVisibility ?? internalColumnVisibility;
    const pagination = tableState?.pagination ?? internalPagination;

    // State setters
    const setSorting = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
        const newValue = typeof updater === 'function' ? updater(sorting) : updater;
        if (tableState?.sorting !== undefined) {
            onSortingChange?.(newValue);
        } else {
            setInternalSorting(newValue);
        }
    };

    const setColumnFilters = (updater: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
        const newValue = typeof updater === 'function' ? updater(columnFilters) : updater;
        if (tableState?.columnFilters !== undefined) {
            onColumnFiltersChange?.(newValue);
        } else {
            setInternalColumnFilters(newValue);
        }
    };

    const setGlobalFilter = (updater: string | ((prev: string) => string)) => {
        const newValue = typeof updater === 'function' ? updater(globalFilter) : updater;
        if (tableState?.globalFilter !== undefined) {
            onGlobalFilterChange?.(newValue);
        } else {
            setInternalGlobalFilter(newValue);
        }
    };

    const handleGlobalFilterChange = useCallback((value: string) => {
        setInputValue(value);
        debouncedCallback(() => {
            setGlobalFilter(value);
        }, debounceDelay);
    }, [debouncedCallback, debounceDelay, setGlobalFilter]);

    const setRowSelection = (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
        const newValue = typeof updater === 'function' ? updater(rowSelection) : updater;
        if (tableState?.rowSelection !== undefined) {
            onSelectionChange?.(newValue);
        } else {
            setInternalRowSelection(newValue);
        }
    };

    const setColumnVisibility = (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
        const newValue = typeof updater === 'function' ? updater(columnVisibility) : updater;
        if (tableState?.columnVisibility !== undefined) {
            onColumnVisibilityChange?.(newValue);
        } else {
            setInternalColumnVisibility(newValue);
        }
    };

    const setPagination = (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
        const newValue = typeof updater === 'function' ? updater(pagination) : updater;
        if (tableState?.pagination !== undefined) {
            onPaginationChange?.(newValue);
        } else {
            setInternalPagination(newValue);
        }
    };

    return {
        // State values
        sorting,
        columnFilters,
        globalFilter,
        rowSelection,
        columnVisibility,
        pagination,
        inputValue,

        // State setters
        setSorting,
        setColumnFilters,
        setGlobalFilter,
        setRowSelection,
        setColumnVisibility,
        setPagination,
        handleGlobalFilterChange,

        // Additional state
        tableState,
        onPaginationChange,
        onSortingChange,
        onSelectionChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onColumnVisibilityChange,
    };
};
