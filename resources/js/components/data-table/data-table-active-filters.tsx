import { isArray } from 'lodash';
import { XCircleIcon, XIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useDataTable } from './data-table-provider';

const DataTableActiveFilters = () => {
    const { activeFiltersCount, filterStates, handleOnChangeFilter, filters, resource, handleClearFilters, isLoading } = useDataTable();

    if (activeFiltersCount < 1) return <></>;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-1">
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter, index) => {
                    if (filterStates[filter.attribute].enabled) {
                        const value = filterStates[filter.attribute].value;
                        return (
                            <Badge variant="light" intent="info" key={index}>
                                {filter.label}: {isArray(value) ? (filter.type === 'date' ? value.join(' - ') : value.join(', ')) : value}
                                <button className="cursor-pointer rounded-full bg-white" disabled={isLoading}>
                                    <XCircleIcon
                                        className="size-4 hover:-scale-95"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleOnChangeFilter(filter.attribute, {
                                                enabled: false,
                                                clause: resource.state.filters[filter.attribute].clause,
                                                value: null,
                                            });
                                        }}
                                    />
                                </button>
                            </Badge>
                        );
                    }
                })}
            </div>
            <div>
                <Button size="icon" variant="light" intent="destructive" onClick={handleClearFilters} disabled={isLoading}>
                    <XIcon />
                </Button>
            </div>
        </div>
    );
};

export default DataTableActiveFilters;
