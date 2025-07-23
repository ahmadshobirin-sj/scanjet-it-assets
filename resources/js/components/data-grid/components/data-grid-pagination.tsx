import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDataGrid } from '../data-grid-provider';
import { useIsMobile } from '@/hooks/use-mobile';

export const DataGridPagination = () => {
    const { table, pageSizeOptions, isTableEmpty, serverSide } = useDataGrid();
    const isMobile = useIsMobile();

    const { pageIndex, pageSize } = table.getState().pagination;
    const start = pageIndex * pageSize + 1;
    const total = serverSide ? table.getRowCount() : table.getFilteredRowModel().rows.length;
    const end = Math.min((pageIndex + 1) * pageSize, total || 0);

    if (isMobile) {
        // Simple pagination for mobile: only next/prev buttons
        return (
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm">
                        Showing {start} to {end} of {total} results
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        size="icon"
                        variant="outline"
                        intent="secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Full pagination for desktop: numbered buttons + first/last + page size selector
    const pageCount = table.getPageCount();
    const pageNumbers = [];

    // Generate page numbers with max 5 pages visible, with current page centered if possible
    const maxPagesToShow = 5;
    let startPage = Math.max(0, pageIndex - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage >= pageCount) {
        endPage = pageCount - 1;
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
                <span className="text-sm">
                    Showing {start} to {end} of {total} results
                </span>
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
                <Select value={pageSize.toString()} onValueChange={(value) => table.setPageSize(Number(value))}>
                    <SelectTrigger className="w-[80px]" disabled={isTableEmpty}>
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((size, index) => (
                            <SelectItem key={index} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center space-x-1 flex-wrap">
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

                    {pageNumbers.map((page) => (
                        <Button
                            key={page}
                            size="icon"
                            variant={page === pageIndex ? 'fill' : 'outline'}
                            intent={page === pageIndex ? 'primary' : 'secondary'}
                            onClick={() => table.setPageIndex(page)}
                        >
                            {page + 1}
                        </Button>
                    ))}

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
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
