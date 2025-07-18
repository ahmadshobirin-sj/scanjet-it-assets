import { TransformersTableResolver } from "@/components/data-grid";
import { formatWithBrowserTimezone } from "@/lib/date";
import { Asset } from "@/types/model";

export const columns: TransformersTableResolver<Asset> = {
    'category.name': (column) => ({
        ...column,
        header: 'Category',
    }),
    'manufacture.name': (column) => ({
        ...column,
        header: 'Manufacture',
    }),
    'warranty_expired': (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.warranty_expired)
        }
    }),
    'last_maintenance': (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.last_maintenance)
        }
    }),
    'created_at': (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.created_at)
        }
    }),
    'updated_at': (column) => ({
        ...column,
        cell: ({ row }) => {
            return formatWithBrowserTimezone(row.original.updated_at)
        }
    }),
};
