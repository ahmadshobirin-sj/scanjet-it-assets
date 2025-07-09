import { Table as TableType } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface DataGridPaginationProps<TData> {
    table: TableType<TData>;
    pageSizeOptions: number[];
    isTableEmpty: boolean;
    serverSide: boolean;
    rowCount?: number;
}

export const DataGridPagination = <TData,>({
    table,
    pageSizeOptions,
    isTableEmpty,
    serverSide,
    rowCount
}: DataGridPaginationProps<TData>) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const start = pageIndex * pageSize + 1;
    const total = serverSide ? rowCount : table.getFilteredRowModel().rows.length;
    const end = Math.min((pageIndex + 1) * pageSize, total || 0);

    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-sm">
                    Showing {start} to {end} of {total} results
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                >
                    <SelectTrigger className="w-[80px]" disabled={isTableEmpty}>
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((size) => (
                            <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="px-3 py-1 text-sm text-foreground">
                        Page {pageIndex + 1} of {table.getPageCount()}
                    </span>

                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
