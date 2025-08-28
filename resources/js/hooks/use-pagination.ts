import { useCallback, useMemo } from 'react';

type UsePaginationOpts = {
    total: number; // total item
    value: number; // current page (1-based, controlled)
    onChange: (nextPage: number) => void;
    pageSize?: number; // default 20
    disabled?: boolean; // block navigation if true
    siblingCount?: number; // pages window around current (default 1)
};

export function usePagination({ total, value, onChange, pageSize = 20, disabled = false, siblingCount = 1 }: UsePaginationOpts) {
    const pageCount = useMemo(() => Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize))), [total, pageSize]);

    // ⟵ Tidak memanggil onChange di sini.
    // Kita pakai 'page' hasil clamp untuk logic internal & UI.
    const page = clamp(value, 1, pageCount);

    const canPrev = page > 1 && !disabled;
    const canNext = page < pageCount && !disabled;

    const setPage = useCallback(
        (next: number) => {
            if (disabled) return;
            const clamped = clamp(next, 1, pageCount);
            if (clamped !== value) onChange(clamped);
        },
        [disabled, pageCount, value, onChange],
    );

    const next = useCallback(() => {
        if (canNext) setPage(page + 1);
    }, [canNext, page, setPage]);
    const prev = useCallback(() => {
        if (canPrev) setPage(page - 1);
    }, [canPrev, page, setPage]);
    const goStart = useCallback(() => {
        if (canPrev) setPage(1);
    }, [canPrev, setPage]);
    const goEnd = useCallback(() => {
        if (canNext) setPage(pageCount);
    }, [canNext, setPage, pageCount]);

    const range = useMemo(() => {
        if (total === 0) return { from: 0, to: 0 };
        const from = (page - 1) * pageSize + 1;
        const to = Math.min(page * pageSize, total);
        return { from, to };
    }, [page, pageSize, total]);

    // Pages array (angka + "...")
    const pages = useMemo<(number | '...')[]>(() => {
        if (pageCount <= 7 + siblingCount * 2) {
            return rangeArray(1, pageCount);
        }
        const left = Math.max(page - siblingCount, 1);
        const right = Math.min(page + siblingCount, pageCount);
        const showLeftDots = left > 2;
        const showRightDots = right < pageCount - 1;

        if (!showLeftDots && showRightDots) {
            const leftRange = rangeArray(1, 3 + siblingCount * 2);
            return [...leftRange, '...', pageCount];
        } else if (showLeftDots && !showRightDots) {
            const rightRange = rangeArray(pageCount - (2 + siblingCount * 2), pageCount);
            return [1, '...', ...rightRange];
        } else {
            const middle = rangeArray(left, right);
            return [1, '...', ...middle, '...', pageCount];
        }
    }, [page, pageCount, siblingCount]);

    // Info opsional untuk parent: apakah value sekarang out-of-range
    const isOutOfRange = value !== page;

    // Opsional helper: parent boleh panggil kalau ingin “membetulkan” value ke clamp tanpa auto-effect
    const sync = useCallback(() => {
        if (isOutOfRange) onChange(page);
    }, [isOutOfRange, onChange, page]);

    return {
        page,
        pageCount,
        pageSize,
        canPrev,
        canNext,
        range,
        pages,
        setPage,
        next,
        prev,
        goStart,
        goEnd,
        // optional diagnostics
        isOutOfRange,
        sync,
    };
}

/* utils */
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n || min));
}
function rangeArray(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
