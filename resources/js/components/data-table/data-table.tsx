import { PropsWithChildren } from 'react';
import DataTableActiveFilters from './data-table-active-filters';
import DataTableFilter from './data-table-filter';
import DataTableFooter from './data-table-footer';
import { DataTableProvider } from './data-table-provider';
import DataTableTable from './data-table-table';
import DataTableToolbar from './data-table-toolbar';
import { DataTableProps } from './data-table.types';

const DataTable = <TData,>(props: DataTableProps<TData>) => {
    return (
        <DataTableProvider {...props}>
            <div className="w-full">
                <DataTableToolbar />
                <DataTableFilterWrapper>
                    <DataTableFilter />
                    <DataTableActiveFilters />
                </DataTableFilterWrapper>
                <div className="py-3">
                    <DataTableTable />
                </div>
                <DataTableFooter />
            </div>
        </DataTableProvider>
    );
};

const DataTableFilterWrapper = ({ children }: PropsWithChildren) => {
    return <div className="overflow-hidde divide-y rounded-md bg-gray-50 dark:divide-white/10 dark:bg-secondary">{children}</div>;
};

export default DataTable;
