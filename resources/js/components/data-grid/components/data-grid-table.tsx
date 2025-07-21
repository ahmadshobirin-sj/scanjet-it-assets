import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender, Table as TableType } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';

interface DataGridTableProps<TData> {
    table: TableType<TData>;
    isTableEmpty: boolean;
    emptyText: string;
}

export const DataGridTable = <TData,>({ table, isTableEmpty, emptyText }: DataGridTableProps<TData>) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-secondary">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup, index) => (
                        <TableRow key={`${headerGroup.id}-${index}`}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} style={{ width: header.getSize() }}>
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className={`flex items-center space-x-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                            onClick={!isTableEmpty ? header.column.getToggleSortingHandler() : undefined}
                                        >
                                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                            {header.column.getCanSort() && (
                                                <span className="flex flex-col">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <div className="h-4 w-4">
                                                            <ChevronsUpDown className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row, index) => (
                            <TableRow key={`${row.id}-${index}`}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={table.getVisibleLeafColumns().length}>
                                <div className="py-4 text-center text-muted-foreground">{emptyText}</div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
