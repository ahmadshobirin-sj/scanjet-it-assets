import { AssetCategory } from "@/types/model";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<AssetCategory>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
            return row.original.f_created_at
        }
    }
];
