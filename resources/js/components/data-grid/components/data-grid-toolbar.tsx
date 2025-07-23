import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChevronsUpDown, FunnelIcon, Search, X } from 'lucide-react';
import { useDataGrid } from '../data-grid-provider';

import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export const DataGridToolbar = () => {
    const { table, inputValue, onGlobalFilterChange, toggleFilterOpen, filterFields, actionsToolbar, rowSelection, enableRowSelection, isLoading } =
        useDataGrid();

    const isMobile = useIsMobile();

    return (
        <div className={`flex items-center space-x-2 py-3 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
            <div className={isMobile ? 'flex flex-grow items-center space-x-2' : 'flex items-center space-x-2'}>
                <Input
                    leading={<Search />}
                    type="text"
                    placeholder="Search all columns..."
                    value={inputValue}
                    className={isMobile ? 'w-full' : 'w-[250px]'}
                    onChange={(e) => onGlobalFilterChange(e.target.value)}
                />
                {isLoading && <Spinner className="size-5 bg-primary dark:bg-white" />}
            </div>
            <div className={`ml-auto flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
                {filterFields && filterFields.length > 0 && (
                    <Button size="icon" variant="outline" intent="secondary" title="show/hide filters" onClick={toggleFilterOpen}>
                        <FunnelIcon />
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" intent="secondary" className="ml-auto">
                            Views <ChevronsUpDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-60 overflow-auto">
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

                {enableRowSelection && rowSelection && Object.keys(rowSelection).length > 0 && actionsToolbar && actionsToolbar.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" intent="secondary" className="ml-auto">
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <div className="mb-2 flex items-center rounded-md border bg-background px-2 py-1 text-sm">
                                <span>{Object.keys(rowSelection).length} selected</span>
                                <Tooltip>
                                    <TooltipTrigger asChild onClick={() => table.resetRowSelection()}>
                                        <div className="ml-auto cursor-pointer">
                                            <X className="size-4" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Clear selection</TooltipContent>
                                </Tooltip>
                            </div>
                            {actionsToolbar.map((action, index) => (
                                <DropdownMenuItem key={index} onClick={action.event} variant={(action.color as any) || 'default'}>
                                    {action.icon} {action.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
