import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react';
import { BorderBeam } from '../ui/border-beam';
import { useDataTable } from './data-table-provider';

const DataTableTable = () => {
    const { table, isTableEmpty, resource, isLoading } = useDataTable();
    return (
        <div className="overflow-x-auto rounded-lg border border-secondary">
            <div className="relative overflow-hidden rounded-lg">
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
                                                            <ChevronUpIcon className="h-4 w-4" />
                                                        ) : header.column.getIsSorted() === 'desc' ? (
                                                            <ChevronDownIcon className="h-4 w-4" />
                                                        ) : (
                                                            <div className="h-4 w-4">
                                                                <ChevronsUpDownIcon className="h-4 w-4" />
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
                                    <div className="py-4 text-center text-muted-foreground">{resource.emptyText}</div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {isLoading && (
                    <>
                        <BorderBeam duration={4} size={400} borderWidth={2} colorFrom="#004165" colorTo="#B0D4E7" />
                        <BorderBeam duration={4} delay={6} size={400} borderWidth={2} colorFrom="#004165" colorTo="#B0D4E7" />
                    </>
                )}
            </div>
        </div>
    );
};

export default DataTableTable;
