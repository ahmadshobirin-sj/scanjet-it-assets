import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ActionsRow } from '../data-grid.types';

export const useTableColumns = <TData extends Record<string, any>>(
    columns: ColumnDef<TData>[],
    enableRowSelection: boolean,
    actionsRow?: (row: TData) => ActionsRow<TData>[]
) => {
    return useMemo<ColumnDef<TData>[]>(() => {
        const baseColumns = [...columns];

        const selectionColumn: ColumnDef<TData> = {
            id: 'select-rows',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    disabled={!row.getCanSelect()}
                    checked={row.getIsSelected()}
                    onCheckedChange={row.getToggleSelectedHandler()}
                />
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
                            <Button size="icon" intent="primary">
                                <EllipsisVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {actions.map((action, index) => (
                                <DropdownMenuItem variant={action.color as any} key={index} onClick={() => action.event?.(row.original)}>
                                    {action.name}
                                </DropdownMenuItem>
                            ))}
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

        if (enableRowSelection) final.push(selectionColumn);
        final.push(...baseColumns);
        if (typeof actionsRow === 'function') final.push(actionsColumn);

        return final;
    }, [columns, enableRowSelection, actionsRow]);
};
