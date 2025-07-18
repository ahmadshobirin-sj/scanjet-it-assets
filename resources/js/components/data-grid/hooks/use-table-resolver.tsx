import { spatieToTanstackState, tanstackToSpatieParams } from "@/lib/normalize-table-state";
import { TableServer } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export type TransformColumnFn<TData> = (column: ColumnDef<TData>) => ColumnDef<TData>;

export type TransformersTableResolver<TData> = Record<string, TransformColumnFn<TData>>;

export const useTableResolver = <TData extends Record<string, any>>(
    table: TableServer<TData>,
    transformers: TransformersTableResolver<TData> = {}
) => {

    const [tableState, setTableState] = useState(() => spatieToTanstackState(table.state));

    const injectedColumns = useMemo<ColumnDef<TData>[]>(() => {
        return table.columns.map((column) => {
            const columnId = getColumnId(column);
            if (columnId && transformers[columnId]) {
                return transformers[columnId](column);
            }

            return column;
        });
    }, [table.columns, transformers]);

    function getColumnId(column: ColumnDef<any>): string | undefined {
        return (column as any).id ?? (column as any).accessorKey;
    }

    const tableStateServer = useMemo(() => tanstackToSpatieParams(tableState), [tableState]);

    return {
        columns: injectedColumns,
        tableState,
        setTableState,
        tableStateServer,
    };
};
