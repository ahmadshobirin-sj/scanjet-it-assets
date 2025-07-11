import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import useDidUpdate from '@/hooks/use-did-update';
import type { DataGridProps } from './data-grid.types';
import { useTableState } from './hooks/use-table-state';
import { useTableColumns } from './hooks/use-table-columns';
import { DataGridToolbar } from './components/data-grid-toolbar';
import { DataGridTable } from './components/data-grid-table';
import { DataGridPagination } from './components/data-grid-pagination';
import { DataGridActionsToolbar } from './components/data-grid-actions-toolbar';

const DataGrid = <TData extends Record<string, any>>({
    rows = [],
    columns = [],
    initialTableState = {},
    tableState,
    pageSizeOptions = [10, 25, 50],
    enableRowSelection = false,
    onPaginationChange,
    onSortingChange,
    onSelectionChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    className = '',
    serverSide = false,
    actionsToolbar,
    rowCount,
    rowId,
    actionsRow,
    emptyText = 'No data available',
    debounceDelay = 300,
}: DataGridProps<TData>) => {
    const {
        sorting,
        columnFilters,
        globalFilter,
        rowSelection,
        columnVisibility,
        pagination,
        inputValue,
        setSorting,
        setColumnFilters,
        setGlobalFilter,
        setRowSelection,
        setColumnVisibility,
        setPagination,
        handleGlobalFilterChange,
    } = useTableState(
        initialTableState,
        tableState,
        pageSizeOptions,
        onPaginationChange,
        onSortingChange,
        onSelectionChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onColumnVisibilityChange,
        debounceDelay
    );

    const finalColumns = useTableColumns(columns, enableRowSelection, actionsRow);

    const table = useReactTable({
        data: rows,
        columns: finalColumns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
            pagination,
            columnVisibility
        },
        ...(rowCount ? { rowCount } : {}),
        ...(rowId ? { getRowId: rowId } : {}),
        enableRowSelection: enableRowSelection,

        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,

        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),

        manualFiltering: serverSide,
        manualPagination: serverSide,
        manualSorting: serverSide,
    });

    const isTableEmpty = useMemo(() => {
        if (serverSide) {
            return rowCount === 0;
        }
        return table.getFilteredRowModel().rows.length === 0;
    }, [serverSide, rowCount, table]);

    // Effect hooks for callbacks
    useDidUpdate(() => {
        if (tableState?.pagination === undefined) {
            onPaginationChange?.(pagination);
        }
    }, [pagination, onPaginationChange, tableState?.pagination]);

    useDidUpdate(() => {
        if (tableState?.sorting === undefined) {
            onSortingChange?.(sorting);
        }
    }, [sorting, onSortingChange, tableState?.sorting]);

    useDidUpdate(() => {
        if (tableState?.rowSelection === undefined && onSelectionChange) {
            onSelectionChange(rowSelection);
        }
    }, [rowSelection, onSelectionChange, table, tableState?.rowSelection]);

    useDidUpdate(() => {
        if (tableState?.globalFilter === undefined) {
            onGlobalFilterChange?.(globalFilter);
        }
    }, [globalFilter, onGlobalFilterChange, tableState?.globalFilter]);

    useDidUpdate(() => {
        if (tableState?.columnFilters === undefined) {
            onColumnFiltersChange?.(columnFilters);
        }
    }, [columnFilters, onColumnFiltersChange, tableState?.columnFilters]);

    useDidUpdate(() => {
        if (tableState?.columnVisibility === undefined) {
            onColumnVisibilityChange?.(columnVisibility);
        }
    }, [columnVisibility, onColumnVisibilityChange, tableState?.columnVisibility]);

    return (
        <>
            <div className={`w-full ${className}`}>
                <DataGridToolbar
                    table={table}
                    inputValue={inputValue}
                    onGlobalFilterChange={handleGlobalFilterChange}
                />

                <DataGridTable
                    table={table}
                    isTableEmpty={isTableEmpty}
                    emptyText={emptyText}
                />

                <DataGridPagination
                    table={table}
                    pageSizeOptions={pageSizeOptions}
                    isTableEmpty={isTableEmpty}
                    serverSide={serverSide}
                    rowCount={rowCount}
                />
            </div>

            <DataGridActionsToolbar
                table={table}
                enableRowSelection={enableRowSelection}
                serverSide={serverSide}
                rowSelection={rowSelection}
                actionsToolbar={actionsToolbar}
            />
        </>
    );
};

export default DataGrid;
