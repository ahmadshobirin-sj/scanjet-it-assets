import { useCallback, useMemo, useState } from 'react';

export type RowId = string | number;
export type SelectionState = Set<RowId>;

export const isRowSelected = (selected: SelectionState, rowId: RowId) => selected.has(rowId);

export const areAllSelectedOnPage = (selected: SelectionState, pageRowIds: RowId[]) =>
    pageRowIds.length > 0 && pageRowIds.every((id) => selected.has(id));

export const isIndeterminateOnPage = (selected: SelectionState, pageRowIds: RowId[]) => {
    if (pageRowIds.length === 0) return false;
    const count = pageRowIds.reduce((acc, id) => Number(acc) + (selected.has(id) ? 1 : 0), 0);
    return Number(count) > 0 && Number(count) < pageRowIds.length;
};

export const toggleRow = (selected: SelectionState, rowId: RowId): SelectionState => {
    const next = new Set(selected);
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    return next;
};

export const selectPage = (selected: SelectionState, pageRowIds: RowId[]) => {
    const next = new Set(selected);
    pageRowIds.forEach((id) => next.add(id));
    return next;
};

export const unselectPage = (selected: SelectionState, pageRowIds: RowId[]) => {
    const next = new Set(selected);
    pageRowIds.forEach((id) => next.delete(id));
    return next;
};

export const togglePage = (selected: SelectionState, pageRowIds: RowId[]) =>
    areAllSelectedOnPage(selected, pageRowIds) ? unselectPage(selected, pageRowIds) : selectPage(selected, pageRowIds);

export function useRowSelection<T extends RowId = RowId>(initial?: T[]) {
    const [selected, setSelected] = useState<SelectionState>(() => new Set(initial));

    // define callbacks OUTSIDE useMemo
    const toggleRowCb = useCallback((rowId: T) => {
        setSelected((prev) => toggleRow(prev, rowId));
    }, []);

    const togglePageCb = useCallback((pageRowIds: T[]) => {
        setSelected((prev) => togglePage(prev, pageRowIds));
    }, []);

    const clearAllCb = useCallback(() => setSelected(new Set()), []);

    // wrap return object in useMemo for stable reference
    return useMemo(
        () => ({
            // readers
            isRowSelected: (rowId: T) => isRowSelected(selected, rowId),
            areAllSelectedOnPage: (pageRowIds: T[]) => areAllSelectedOnPage(selected, pageRowIds),
            isIndeterminateOnPage: (pageRowIds: T[]) => isIndeterminateOnPage(selected, pageRowIds),

            // writers
            toggleRow: toggleRowCb,
            togglePage: togglePageCb,
            clearAll: clearAllCb,

            // raw
            selected,
            setSelected,
        }),
        [selected, toggleRowCb, togglePageCb, clearAllCb],
    );
}
