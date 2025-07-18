export interface TableServer<TData> {
    columns: ColumnDef<TData>[];
    state: {
        sort: string[];
        filters: Record<string, any>;
        per_page: number;
        page: number;
    };
}
