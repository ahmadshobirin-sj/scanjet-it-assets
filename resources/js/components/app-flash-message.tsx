import { SharedData, SharedFlashData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export type Notify = (args: { message: string; intent: any }) => void;

// ====== Utils ======
const SEEN_IDS_KEY = '__flash_seen_ids_v1__';

function safeGet(key: string): string | null {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}
function safeSet(key: string, val: string) {
    try {
        sessionStorage.setItem(key, val);
    } catch {
        // ignore
    }
}
function getSeen(): Set<string> {
    try {
        return new Set(JSON.parse(safeGet(SEEN_IDS_KEY) || '[]'));
    } catch {
        return new Set();
    }
}
function saveSeen(set: Set<string>) {
    safeSet(SEEN_IDS_KEY, JSON.stringify([...set]));
}
function toArr(x?: string | string[]) {
    if (!x) return [] as string[];
    return Array.isArray(x) ? x.filter(Boolean) : [x].filter(Boolean);
}
function hash(str: string) {
    // djb2 xor variant
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return (h >>> 0).toString(36);
}

// ====== Komponen ======
/**
 * Komponen ini cukup dipasang SEKALI, mis. di AppLayout.
 * Ia akan memunculkan toast untuk setiap batch flash (sekali per `flash.id`).
 */
export default function AppFlashMessage({
    notify,
}: {
    notify: Notify; // contoh: (p) => toast({ description: p.message, variant: p.intent === 'destructive' ? 'destructive' : 'default' })
}) {
    const { props } = usePage<SharedData>();

    // Sumber utama: props.flash
    const flash = props?.flash;

    // Fallback legacy:
    // Jika belum migrate penuh dan masih ada props.success (string atau record),
    // kita convert ke bentuk FlashData sekali pakai dengan "id" sintetis agar tetap dedup.
    const legacyFlash: SharedFlashData | undefined = (() => {
        const legacy = (props as any)?.success;
        if (!legacy || flash) return undefined;

        let messages: string[] = [];
        if (typeof legacy === 'string') {
            messages = [legacy];
        } else if (typeof legacy === 'object' && legacy !== null) {
            messages = Object.values(legacy).filter((v): v is string => typeof v === 'string');
        }
        if (messages.length === 0) return undefined;

        const url =
            typeof window !== 'undefined'
                ? window.location.pathname // sengaja abaikan query agar tidak spam
                : '';
        const syntheticId = `legacy:${hash(JSON.stringify({ messages, url }))}`;

        return { id: syntheticId, success: messages };
    })();

    const effective = flash?.id ? flash : legacyFlash;

    useEffect(() => {
        if (!effective?.id) return;

        const seen = getSeen();
        if (seen.has(effective.id)) return;

        // Tampilkan semua success/errors dari batch ini
        toArr(effective.success).forEach((m) => notify({ message: m, intent: 'success' }));
        toArr(effective.errors).forEach((m) => notify({ message: m, intent: 'destructive' }));

        // Tandai sudah tampil
        seen.add(effective.id);
        saveSeen(seen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effective?.id]); // kunci: bereaksi hanya saat ID berubah

    return null;
}
