// useAxiosProgress.ts
import type { AxiosProgressEvent } from 'axios';
import { useCallback, useRef, useState } from 'react';

type ProgressState = {
    percent: number; // 0-100
    loaded: number; // bytes
    total?: number; // bytes | undefined
};

export function useAxiosProgress() {
    const [progress, setProgress] = useState<ProgressState>({ percent: 0, loaded: 0, total: undefined });
    const startTs = useRef<number | null>(null);

    const onProgress = useCallback((e: AxiosProgressEvent) => {
        if (!startTs.current) startTs.current = Date.now();
        const loaded = e.loaded ?? 0;
        const total = e.total;
        const percent = total && total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        setProgress({ percent, loaded, total });
    }, []);

    const reset = useCallback(() => {
        startTs.current = null;
        setProgress({ percent: 0, loaded: 0, total: undefined });
    }, []);

    return { progress, onProgress, reset };
}
