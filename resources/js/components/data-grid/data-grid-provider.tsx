import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { DataGridFilterField, DataGridProps } from './data-grid.types';
import { Table } from '@tanstack/react-table';

interface DataGridContextProps<TData> {
    // Core table instance
    table: Table<TData>;

    // Filter related
    isFilterOpen: boolean;
    setFilterOpen: (open: boolean) => void;
    toggleFilterOpen: () => void;
    filterFields: DataGridFilterField<TData>[];
    clearAllFilters: () => void;

    // UI state
    isLoading: boolean;
    isTableEmpty: boolean;
    emptyText: string;

    // Configuration
    serverSide: boolean;
    enableRowSelection: boolean;
    pageSizeOptions: number[];

    // Actions
    actionsToolbar?: DataGridProps<TData>['actionsToolbar'];

    // Global filter
    inputValue: string;
    onGlobalFilterChange: (value: string) => void;

    // Row selection state
    rowSelection: Record<string, boolean>;

    // Clear all sorts
    clearAllSorts: () => void;
}

type DataGridProviderProps<TData> = {
    children: React.ReactNode;
    table: Table<TData>;
    isFilterOpen: boolean;
    setFilterOpen: (open: boolean) => void;
    toggleFilterOpen: () => void;
    filterFields: DataGridFilterField<TData>[];
    isLoading: boolean;
    isTableEmpty: boolean;
    emptyText: string;
    serverSide: boolean;
    enableRowSelection: boolean;
    pageSizeOptions: number[];
    actionsToolbar?: DataGridProps<TData>['actionsToolbar'];
    inputValue: string;
    onGlobalFilterChange: (value: string) => void;
    rowSelection: Record<string, boolean>;
    rowCount?: number;
}

const DataGridContext = createContext<DataGridContextProps<any> | null>(null);

export const DataGridProvider = <TData,>({
    children,
    table,
    isFilterOpen,
    setFilterOpen,
    toggleFilterOpen,
    filterFields,
    isLoading,
    isTableEmpty,
    emptyText,
    serverSide,
    enableRowSelection,
    pageSizeOptions,
    actionsToolbar,
    inputValue,
    onGlobalFilterChange,
    rowSelection,
}: DataGridProviderProps<TData>) => {

    // Memoized callbacks
    const clearAllFilters = useCallback(() => {
        table.resetColumnFilters();
        table.setGlobalFilter('');
    }, [table]);

    const clearAllSorts = useCallback(() => {
        table.resetSorting();
    }, [table]);

    const contextValue = useMemo<DataGridContextProps<TData>>(() => ({
        // Core table instance
        table,

        // Filter related
        isFilterOpen,
        setFilterOpen,
        toggleFilterOpen,
        filterFields,
        clearAllFilters,

        // UI state
        isLoading,
        isTableEmpty,
        emptyText,

        // Configuration
        serverSide,
        enableRowSelection,
        pageSizeOptions,

        // Actions
        actionsToolbar,

        // Global filter
        inputValue,
        onGlobalFilterChange,

        // Row selection state
        rowSelection,

        // Clear all sorts
        clearAllSorts,
    }), [
        table,
        isFilterOpen,
        setFilterOpen,
        toggleFilterOpen,
        filterFields,
        clearAllFilters,
        clearAllSorts,
        isLoading,
        isTableEmpty,
        emptyText,
        serverSide,
        enableRowSelection,
        pageSizeOptions,
        actionsToolbar,
        inputValue,
        onGlobalFilterChange,
        rowSelection,
    ]);

    return (
        <DataGridContext.Provider value={contextValue}>
            {children}
        </DataGridContext.Provider>
    );
};

export const useDataGrid = <TData = any,>(): DataGridContextProps<TData> => {
    const context = useContext(DataGridContext);
    if (!context) {
        throw new Error('useDataGrid must be used within a DataGridProvider');
    }
    return context;
};
