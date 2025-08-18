// src/hooks/useFlashOnce.ts
import { useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';

type Intent = 'success' | 'destructive';
type Notify = (args: { message: string; intent: Intent }) => void;

type PickResult = {
    success?: string | string[];
    errors?: string | string[];
};

type Options = {
    notify: Notify;
    /** ambil pesan dari props; default fleksibel utk { success?.message, errors?.message, flash } */
    pick?: (props: any) => PickResult;
    /** 'path' (default) = dedup per URL; 'global' = per-tab di seluruh app */
    scope?: 'path' | 'global';
    /** default: sessionStorage (per-tab) */
    storage?: Storage;
    /** key untuk daftar pesan yang sudah ditampilkan */
    storageKey?: string;
};

const SEEN_KEY = '__flash_once_seen_v2__';
const VISIT_KEY = '__inertia_visit_counter_v1__';

// Pastikan listener success terpasang sekali saja per module
let listenerInstalled = false;

function initVisitCounter(storage?: Storage) {
    if (!storage) return;
    if (!storage.getItem(VISIT_KEY)) storage.setItem(VISIT_KEY, '1');
    if (listenerInstalled) return;

    // Naikkan counter SETIAP visit sukses dari server
    router.on('success', () => {
        try {
            const curr = parseInt(storage.getItem(VISIT_KEY) || '1', 10) || 1;
            storage.setItem(VISIT_KEY, String(curr + 1));
        } catch { }
    });

    listenerInstalled = true;
}

function getVisitNo(storage?: Storage) {
    if (!storage) return '1';
    return storage.getItem(VISIT_KEY) ?? '1';
}

function hash(str: string) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return (h >>> 0).toString(36);
}

function toArr(x?: string | string[]) {
    if (!x) return [] as string[];
    return Array.isArray(x) ? x.filter(Boolean) : [x].filter(Boolean);
}

/** Tampilkan flash sekali per-visit (tanpa ID server) */
export function useFlashOnce({
    notify,
    pick,
    scope = 'path',
    storage = typeof window !== 'undefined' ? window.sessionStorage : undefined,
    storageKey = SEEN_KEY,
}: Options) {
    const { props } = usePage<any>();

    useEffect(() => {
        initVisitCounter(storage);
    }, [storage]);

    const visitNo = getVisitNo(storage);

    // extractor default yang “tahan banting”
    const data = useMemo<PickResult>(() => {
        if (pick) return pick(props);
        const s =
            props?.success?.message ??
            props?.success ??
            props?.flash?.success ??
            props?.flash?.message ??
            '';
        const e =
            props?.errors?.message ??
            props?.error?.message ??
            props?.error ??
            props?.flash?.error ??
            '';
        return { success: s, errors: e };
    }, [props, pick]);

    const path =
        scope === 'global' || typeof window === 'undefined'
            ? ''
            : window.location.pathname + window.location.search;

    const entries = useMemo(
        () => [
            ...toArr(data.success).map((t) => ({ text: String(t), intent: 'success' as Intent })),
            ...toArr(data.errors).map((t) => ({ text: String(t), intent: 'destructive' as Intent })),
        ],
        [data.success, data.errors]
    );

    useEffect(() => {
        if (!storage || !storageKey || entries.length === 0) return;

        let seen: Set<string>;
        try {
            seen = new Set<string>(JSON.parse(storage.getItem(storageKey) || '[]'));
        } catch {
            seen = new Set();
        }

        let dirty = false;
        for (const m of entries) {
            if (!m.text) continue;
            // kunci dedup: (opsional) path + visitNo + intent + hash(teks)
            // -> tampil **sekali** untuk setiap response server, walau teksnya sama
            const key = [path, `v${visitNo}`, m.intent, hash(m.text)].join('|');
            if (seen.has(key)) continue;

            notify({ message: m.text, intent: m.intent });
            seen.add(key);
            dirty = true;
        }

        if (dirty) storage.setItem(storageKey, JSON.stringify(Array.from(seen)));
    }, [entries, path, visitNo, notify, storage, storageKey]);
}

/** Wrapper khusus props Inertia umum */
export function useInertiaFlashToastOnce(
    notify: Notify,
    opts?: Omit<Options, 'notify' | 'pick'>
) {
    return useFlashOnce({
        notify,
        scope: opts?.scope ?? 'path',
        storage: opts?.storage,
        storageKey: opts?.storageKey,
        pick: (props) => ({
            success:
                props?.success?.message ??
                props?.flash?.success ??
                props?.success ??
                '',
            errors:
                props?.errors?.message ??
                props?.flash?.error ??
                props?.error ??
                '',
        }),
    });
}
