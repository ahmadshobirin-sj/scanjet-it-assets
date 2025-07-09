import { DataGridState } from "@/components/data-grid";
import { DEFAULT_PAGINATION } from "@/constants/table";
import { TableServerState } from "@/types/model";
import { SortingState } from "@tanstack/react-table";

export function spatieToTanstackState(state: TableServerState) {
    const pageIndex = Math.max(Number(state?.page || 1) - 1, DEFAULT_PAGINATION.pageIndex);
    const pageSize = Number(state?.per_page || DEFAULT_PAGINATION.pageSize);

    const sortParam: string[] = state?.sort || [];
    const sorting: SortingState = sortParam.map((key) => ({
        id: key.replace(/^-/, ''),
        desc: key.startsWith('-'),
    }));

    const globalFilter: string = state?.filters['search'] || '';

    return {
        pagination: {
            pageIndex,
            pageSize,
        },
        sorting,
        globalFilter,
    };
}

export function tanstackToSpatieParams({ pagination, sorting, columnFilters, globalFilter } : DataGridState): Record<string, string> {
    const params: Record<string, string> = {};

    if (pagination) {
        params['page'] = String(pagination.pageIndex + 1);
        params['per_page'] = String(pagination.pageSize);
    }

    if (sorting && sorting.length > 0) {
        params.sort = sorting.map((s) => (s.desc ? `-${s.id}` : s.id)).join(',');
    }

    if (globalFilter) {
        params['filter[search]'] = globalFilter;
    }

    if (columnFilters && columnFilters.length > 0) {
        columnFilters.forEach((filter) => {
            if (filter.id && filter.value) {
                params[`filter[${filter.id}]`] = filter.value as string;
            }
        });
    }

    return params;
}

