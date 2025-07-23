import { spatieToTanstackState, tanstackToSpatieParams } from '@/lib/normalize-table-state';
import { TableServer } from '@/types/table';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { DataGridState } from '../data-grid.types';

export type TransformColumnFn<TData> = (column: ColumnDef<TData>) => ColumnDef<TData>;
export type TransformersTableResolver<TData> = Record<string, TransformColumnFn<TData>>;
type TableStateUpdater = (prev: DataGridState | undefined) => DataGridState | undefined;

function getColumnId(column: ColumnDef<any>): string | undefined {
    return (column as any).id ?? (column as any).accessorKey;
}

export const useTableResolver = <TData extends Record<string, any>>(
    tableKey: string,
    transformers: TransformersTableResolver<TData> = {}
) => {
    const LOCAL_STORAGE_KEY = `tableState:${tableKey}`;

    const [table, setTable] = useState<TableServer<TData> | undefined>(undefined);
    const [tableState, setTableStateRaw] = useState<DataGridState | undefined>(() => {
        try {
            const json = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!json) return undefined;
            return JSON.parse(json) as DataGridState;
        } catch {
            return undefined;
        }
    });



    const setTableState = (newState: DataGridState | TableStateUpdater) => {
        setTableStateRaw((prev) => {
            const resolvedState = typeof newState === 'function'
                ? (newState as TableStateUpdater)(prev)
                : newState;

            if (resolvedState) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resolvedState));
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }

            return resolvedState;
        });
    };

    useEffect(() => {
        if (table?.state) {
            const state = spatieToTanstackState(table.state);
            setTableState(state);
        }
    }, [table]);

    const injectedColumns = useMemo<ColumnDef<TData>[]>(() => {
        if (!table?.columns) return [];

        return table.columns.map((column) => {
            const columnId = getColumnId(column);
            if (columnId && transformers[columnId]) {
                return transformers[columnId](column);
            }
            return column;
        });
    }, [table, transformers]);

    const tableStateServer = useMemo(() => {
        return tableState ? tanstackToSpatieParams(tableState) : undefined;
    }, [tableState]);

    return {
        setTable,
        columns: injectedColumns,
        tableState,
        setTableState,
        tableStateServer,
    };
};
