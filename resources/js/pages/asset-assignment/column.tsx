import { TransformersTableResolver } from '@/components/data-grid';
import { formatWithBrowserTimezone } from '@/lib/date';
import { AssetAssignment } from '@/types/model';

export const columns: TransformersTableResolver<AssetAssignment> = {
    confirmed_at: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.confirmed_at);
        },
    }),
    assigned_at: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.assigned_at);
        },
    }),
    returned_at: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.returned_at);
        },
    }),
};
