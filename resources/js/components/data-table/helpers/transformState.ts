import { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTableClientQuery, DataTableServerQuery, DataTableServerQueryFilters } from '../data-table.types';

export const transformStateToQuery = ({ pagination, sorting, globalSearch, filter }: DataTableClientQuery): DataTableServerQuery => {
    const query: DataTableServerQuery = {};

    if (pagination) {
        query.page = pagination.pageIndex + 1;
        query.per_page = pagination.pageSize;
    }

    if (sorting && sorting.length > 0) {
        query.sort = sorting.map((s) => (s.desc ? `-${s.id}` : s.id)).join(',');
    }

    if (globalSearch) {
        query.search = globalSearch;
    }

    if (filter) {
        const output = Object.fromEntries(
            Object.entries(filter)
                .filter(([, { enabled }]) => enabled)
                .map(([key, { clause, value }]) => {
                    const obj: Record<string, unknown> = { op: clause };
                    if (value !== null) obj.value = value;
                    return [key, obj];
                }),
        ) as DataTableServerQueryFilters;
        query.filter = output;
    }

    return query;
};

export const transformQueryToState = (query: DataTableServerQuery): Required<Omit<DataTableClientQuery, 'filter'>> => {
    const pagination: PaginationState = {
        pageIndex: query.page ? query.page - 1 : 0,
        pageSize: query.per_page || 10,
    };

    const sorting: SortingState = [];

    if (query.sort) {
        query.sort.split(',').forEach((sort) => {
            const isDesc = sort.startsWith('-');
            const id = isDesc ? sort.slice(1) : sort;
            sorting.push({ id, desc: isDesc });
        });
    }

    const search = query.search || '';

    return { pagination, sorting, globalSearch: search };
};
