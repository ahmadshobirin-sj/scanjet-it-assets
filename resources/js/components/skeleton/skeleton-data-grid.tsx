import { Skeleton } from '@/components/ui/skeleton';
import { FC } from 'react';

type SkeletonDataGridProps = {
    rows?: number;
    columns?: number;
};

const SkeletonDataGrid: FC<SkeletonDataGridProps> = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="w-full space-y-4 rounded-md p-4">
            {/* Global Filter */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-[240px] rounded-sm" />
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden rounded-md border">
                {/* Header */}
                <div className="flex items-center border-b px-4 py-2">
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={index} className="mx-2 h-4 w-full" />
                    ))}
                </div>

                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex items-center border-b px-4 py-3 last:border-none">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton key={colIndex} className="mx-2 h-4 w-full" />
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-6 rounded-sm" />
                ))}
            </div>
        </div>
    );
};

export default SkeletonDataGrid;
