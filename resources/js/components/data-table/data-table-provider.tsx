import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useDidUpdate from '@/hooks/use-did-update';
import { router } from '@inertiajs/react';
import { DropdownMenuGroup } from '@radix-ui/react-dropdown-menu';
import { ColumnDef, getCoreRowModel, PaginationState, RowSelectionState, SortingState, useReactTable } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { EllipsisVerticalIcon } from 'lucide-react';
import qs from 'qs';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
    DataTableClientQuery,
    DataTableFilterState,
    DataTableFilterStateItem,
    DataTableProviderContext,
    DataTableProviderProps,
} from './data-table.types';
import { transformQueryToState, transformStateToQuery } from './helpers/transformState';

export const DataTableContext = createContext<DataTableProviderContext<any> | null>(null);

export const DataTableProvider = <TData,>({
    resource,
    bulkActions,
    actionsRow,
    children,
    transformerColumns,
    exportActions,
}: DataTableProviderProps<TData>) => {
    const defaultState = useMemo(() => {
        return transformQueryToState({
            page: resource.state.page,
            per_page: resource.state.perPage,
            sort: resource.state.sort.join(','),
            search: resource.state.search || '',
        });
    }, [resource]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: defaultState.pagination.pageIndex,
        pageSize: defaultState.pagination.pageSize,
    });
    const [sorting, setSorting] = useState<SortingState>(defaultState.sorting);
    const [globalSearch, setGlobalSearch] = useState<string>(defaultState.globalSearch);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [openFilters, setOpenFilters] = useState(false);
    const [filterStates, setFilterStates] = useState<DataTableFilterState>(resource.state.filters);
    const filters = useMemo(() => resource.filters, [resource.filters]);

    const defaultColumns = useMemo<ColumnDef<TData>[]>(() => {
        const baseColumns = [...resource.columns];
        const hasActions = actionsRow && typeof actionsRow === 'function';

        const selectionColumn: ColumnDef<TData> = {
            id: 'select-rows',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox disabled={!row.getCanSelect()} checked={row.getIsSelected()} onCheckedChange={row.getToggleSelectedHandler()} />
            ),
            enableSorting: false,
            enableColumnFilter: false,
            size: 40,
            enableHiding: false,
        };

        const actionsColumn: ColumnDef<TData> = {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const actions = actionsRow?.(row.original) ?? [];
                if (actions.length === 0) return null;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" intent="primary" variant="ghost">
                                <EllipsisVerticalIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {actions.map((action, index) => (
                                    <DropdownMenuItem variant={action.color as any} key={index} onClick={() => action.event?.(row.original)}>
                                        {action.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
            size: 60,
            enableHiding: false,
        };

        const final: ColumnDef<TData>[] = [];

        if (resource.enableRowSelection) final.push(selectionColumn);
        final.push(...baseColumns);
        if (hasActions) final.push(actionsColumn);

        return final;
    }, [resource.columns, resource.enableRowSelection, actionsRow]);

    function getColumnId(column: ColumnDef<any>): string | undefined {
        return (column as any).id ?? (column as any).accessorKey;
    }

    const injectedColumns = useMemo<ColumnDef<TData>[]>(() => {
        if (!transformerColumns || Object.keys(transformerColumns).length === 0) return defaultColumns;

        return defaultColumns.map((column) => {
            const columnId = getColumnId(column);
            if (columnId && transformerColumns[columnId]) {
                return transformerColumns[columnId](column);
            }
            return column;
        });
    }, [defaultColumns, transformerColumns]);

    const handleGlobalSearch = useCallback(
        (value: string) => {
            setGlobalSearch(value);
            const resetPagination = {
                pageIndex: 0,
                pageSize: pagination.pageSize,
            };
            setPagination(resetPagination);
        },
        [pagination],
    );

    const table = useReactTable({
        data: resource.results.data,
        columns: injectedColumns,
        rowCount: resource.results.total,
        state: {
            pagination,
            sorting,
            rowSelection,
        },
        enableRowSelection: resource.enableRowSelection,

        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,

        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,

        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => (row as any)[resource.rowId],
    });

    const fetchData = useCallback(
        debounce((params: DataTableClientQuery) => {
            const queryObj = {
                [resource.name]: transformStateToQuery(params),
            };
            const queryString = qs.stringify(queryObj);
            const url = `${window.location.pathname}?${queryString}`;
            router.get(
                url,
                {},
                {
                    only: [resource.name],
                    async: true,
                    showProgress: false,
                    preserveState: true,
                    preserveScroll: true,
                    onBefore: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 300),
        [resource.name],
    );

    useDidUpdate(() => {
        fetchData({
            pagination,
            sorting,
            globalSearch,
            filter: filterStates,
        });
    }, [pagination, sorting, globalSearch, filterStates]);

    const toggleOpenFilters = useCallback(() => {
        setOpenFilters((prev) => !prev);
    }, []);

    const handleOnChangeFilter = useCallback(
        (attribute: string, state: Partial<DataTableFilterStateItem>) => {
            const getFilterState = filterStates[attribute];
            const updateValue = {
                ...getFilterState,
                ...state,
            };
            setFilterStates((old) => ({
                ...old,
                [attribute]: {
                    ...updateValue,
                },
            }));
        },
        [filterStates, setFilterStates],
    );

    const handleResetAllFilters = () => {
        setFilterStates(resource.state.filters);
    };

    const handleClearFilters = () => {
        const state = Object.fromEntries(
            Object.entries(filterStates).map(([key, item]) => [key, { ...item, enabled: false, value: null }]),
        ) as DataTableFilterState;

        setFilterStates(state);
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(filterStates).reduce((total, filter) => total + (filter.enabled ? 1 : 0), 0);
    }, [filterStates]);

    const totalSelectedRows = useMemo(() => {
        return Object.keys(rowSelection).length;
    }, [rowSelection]);

    return (
        <DataTableContext.Provider
            value={{
                table,
                bulkActions,
                exportActions,
                actionsRow,
                resource,
                isLoading,
                isTableEmpty: resource.results.total === 0,
                globalSearch,
                handleGlobalSearch,
                openFilters,
                toggleOpenFilters,
                filters,
                filterStates,
                handleOnChangeFilter,
                handleResetAllFilters,
                activeFiltersCount,
                handleClearFilters,
                rowSelection,
                totalSelectedRows,
            }}
        >
            {children}
        </DataTableContext.Provider>
    );
};

export const useDataTable = <TData,>(): DataTableProviderContext<TData> => {
    const context = useContext(DataTableContext);
    if (!context) {
        throw new Error('useDataTable must be used within a DataTableProvider');
    }
    return context;
};
