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
                <div className="divide-y">
                    <DataTableFilter />
                    <DataTableActiveFilters />
                </div>
                <div className="py-3">
                    <DataTableTable />
                </div>
                <DataTableFooter />
            </div>
        </DataTableProvider>
    );
};

export default DataTable;
