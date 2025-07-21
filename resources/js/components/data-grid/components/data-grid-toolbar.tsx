import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table as TableType } from '@tanstack/react-table';
import { ChevronsUpDown, Search } from 'lucide-react';

interface DataGridToolbarProps<TData> {
    table: TableType<TData>;
    inputValue: string;
    onGlobalFilterChange: (value: string) => void;
}

export const DataGridToolbar = <TData,>({ table, inputValue, onGlobalFilterChange }: DataGridToolbarProps<TData>) => {
    return (
        <div className="mb-4 flex items-center space-x-2">
            <Input
                leading={<Search />}
                type="text"
                placeholder="Search all columns..."
                value={inputValue}
                className="w-[250px]"
                onChange={(e) => onGlobalFilterChange(e.target.value)}
            />
            <div className="ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" intent="secondary" className="ml-auto">
                            Views <ChevronsUpDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        <>{column.columnDef.header}</>
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
