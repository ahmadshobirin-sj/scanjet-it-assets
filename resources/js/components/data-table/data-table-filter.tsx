import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import DataTableFilterItem from './data-table-filter-item';
import { useDataTable } from './data-table-provider';

const DataTableFilter = () => {
    const { filterStates, filters, openFilters, handleClearFilters } = useDataTable();

    if (!openFilters) {
        return null;
    }

    return (
        <>
            <div className="flex flex-row items-center gap-4 px-4 py-3">
                <div className="border-r pr-3 leading-none">
                    <Button variant="light" intent="destructive" size="icon" onClick={handleClearFilters}>
                        <TrashIcon className="size-4" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                        <DataTableFilterItem key={index} {...filter} state={filterStates[filter.attribute]} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default DataTableFilter;
