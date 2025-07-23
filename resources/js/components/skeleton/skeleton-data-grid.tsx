import { Skeleton } from '@/components/ui/skeleton';
import { FC } from 'react';

type SkeletonDataGridProps = {
    rows?: number;
    columns?: number;
};

const SkeletonDataGrid: FC<SkeletonDataGridProps> = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="space-y-4 w-full rounded-md p-4">
            {/* Global Filter */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-[240px] rounded-sm" />
            </div>

            {/* Table */}
            <div className="w-full border rounded-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center px-4 py-2 border-b">
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-full mx-2" />
                    ))}
                </div>

                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex items-center px-4 py-3 border-b last:border-none"
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-4 w-full mx-2" />
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2">
                {
                    Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-6 w-6 rounded-sm" />
                    ))
                }
            </div>
        </div>
    );
};

export default SkeletonDataGrid;
