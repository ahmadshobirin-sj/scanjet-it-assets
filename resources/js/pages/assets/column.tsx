import { TransformersTableResolver } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { AssetStatusHelper } from '@/constants/asset-status';
import { formatWithBrowserTimezone } from '@/lib/date';
import { Asset } from '@/types/model';

export const columns: TransformersTableResolver<Asset> = {
    'category.name': (column) => ({
        ...column,
        header: 'Category',
    }),
    'manufacture.name': (column) => ({
        ...column,
        header: 'Manufacture',
    }),
    warranty_expired: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.warranty_expired);
        },
    }),
    last_maintenance: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.last_maintenance);
        },
    }),
    created_at: (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.created_at);
        },
    }),
    status: (column) => ({
        ...column,
        cell: ({ row }) => {
            return (
                <Badge intent={AssetStatusHelper.getIntent(row.original.status) as any} size="md">
                    {AssetStatusHelper.getLabel(row.original.status)}
                </Badge>
            );
        },
    }),
};
