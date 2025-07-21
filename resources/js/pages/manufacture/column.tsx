import { formatWithBrowserTimezone } from '@/lib/date';
import { Manufacture } from '@/types/model';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Manufacture>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.created_at);
        },
    },
];
