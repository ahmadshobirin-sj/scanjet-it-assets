import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Columns3Icon, FilterIcon, PrinterIcon, RocketIcon, SearchIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useDataTable } from './data-table-provider';

const DataTableToolbar = () => {
    const {
        globalSearch,
        handleGlobalSearch,
        table,
        toggleOpenFilters,
        totalSelectedRows,
        resource,
        bulkActions,
        exportActions,
        activeFiltersCount,
        filters,
    } = useDataTable();
    const isMobile = useIsMobile();

    return (
        <div className={`flex items-center justify-between gap-2 space-x-2 py-3 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
            <div className={isMobile ? 'flex flex-grow items-center space-x-2' : 'flex items-center space-x-2'}>
                <Input
                    leading={<SearchIcon />}
                    type="text"
                    placeholder="Search all columns..."
                    value={globalSearch as string}
                    className={isMobile ? 'w-full' : 'w-[250px]'}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                {exportActions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" intent="secondary" title="Bulk Actions">
                                <PrinterIcon />
                                Exports
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Exports</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {exportActions.map((action, index) => (
                                    <DropdownMenuItem key={index} variant={action.color as any} onClick={action.event}>
                                        {action.icon}
                                        <span>{action.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {resource.enableRowSelection && bulkActions.length > 0 && totalSelectedRows > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" intent="secondary" title="Bulk Actions">
                                <RocketIcon /> Bulk Actions <Badge intent="secondary">{totalSelectedRows}</Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {bulkActions.map((action, index) => (
                                    <DropdownMenuItem key={index} variant={action.color as any} onClick={action.event}>
                                        {action.icon}
                                        <span>{action.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {filters && filters.length > 0 && (
                    <Button variant="outline" intent="secondary" title="Filters" onClick={toggleOpenFilters}>
                        <FilterIcon className="size-4" /> Filters <Badge intent="secondary">{activeFiltersCount}</Badge>
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" intent="secondary" title="Columns">
                            <Columns3Icon className="size-4" /> Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-60 overflow-auto">
                        <DropdownMenuLabel>Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
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
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default DataTableToolbar;
