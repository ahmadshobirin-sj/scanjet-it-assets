// convertCarbonToDateFns.ts
// Konversi format string Carbon/Laravel -> date-fns v2

const TOKEN_MAP: Record<string, string> = {
    // Tahun
    Y: 'yyyy', // 4 digit
    y: 'yy', // 2 digit

    // Bulan
    m: 'MM', // 01-12
    n: 'M', // 1-12
    M: 'MMM', // Jan
    F: 'MMMM', // January

    // Hari dalam bulan & nama hari
    d: 'dd', // 01-31
    j: 'd', // 1-31
    D: 'EEE', // Mon
    l: 'EEEE', // Monday

    // Jam/menit/detik
    H: 'HH', // 00-23
    G: 'H', // 0-23
    h: 'hh', // 01-12
    g: 'h', // 1-12
    i: 'mm', // 00-59
    s: 'ss', // 00-59

    // AM/PM (catatan: output tergantung locale date-fns)
    A: 'aa',
    a: 'aa',

    // Hari dalam tahun / minggu (opsional; pakai kalau perlu)
    // z: 'D',     // (!) Carbon: 0-365; date-fns tidak punya padanan langsung
    // W: 'I',     // (!) ISO week number di date-fns adalah 'I' (v3). Jika v2, gunakan 'II'.
};

/**
 * Mengonversi format Carbon ke date-fns.
 * - Menghormati escape backslash `\` dari PHP (huruf selanjutnya literal).
 * - Karakter yang bukan token akan diperlakukan sebagai literal & di-quote sesuai aturan date-fns.
 * - Token yang belum dipetakan akan diperlakukan sebagai literal (aman-by-default).
 */
export function convertCarbonToDateFns(format: string): string {
    let out = '';
    let i = 0;
    let inLiteral = false;

    const openLiteral = () => {
        if (!inLiteral) {
            out += "'";
            inLiteral = true;
        }
    };

    const closeLiteral = () => {
        if (inLiteral) {
            out += "'";
            inLiteral = false;
        }
    };

    while (i < format.length) {
        const ch = format[i];

        // PHP/Carbon escaping: backslash membuat karakter berikutnya literal
        if (ch === '\\') {
            i++;
            const next = format[i];
            if (next === undefined) break;
            openLiteral();
            // Dalam date-fns, untuk menulis single quote literal, gandakan ''
            if (next === "'") out += "''";
            else out += next;
            i++;
            continue;
        }

        // Jika ch adalah token Carbon yang kita kenal, gunakan mapping
        if (TOKEN_MAP[ch]) {
            // tutup literal run sebelum memasukkan token date-fns
            closeLiteral();
            out += TOKEN_MAP[ch];
            i++;
            continue;
        }

        // Jika ch adalah huruf [A-Za-z] tapi tidak ada di mapping,
        // anggap sebagai literal supaya aman (daripada salah token di date-fns).
        if (/[A-Za-z]/.test(ch)) {
            openLiteral();
            if (ch === "'")
                out += "''"; // escape single quote untuk date-fns
            else out += ch;
            i++;
            continue;
        }

        // Non-huruf (spasi, tanda baca) bisa ditulis sebagai literal juga
        openLiteral();
        if (ch === "'") out += "''";
        else out += ch;
        i++;
    }

    // pastikan menutup literal jika masih terbuka
    closeLiteral();
    return out;
}

/**
 * Helper pemakaian langsung dengan date-fns/format
 */
import { format as formatDate } from 'date-fns';

export function formatWithCarbonPattern(date: Date | number, carbonPattern: string): string {
    const dfnsPattern = convertCarbonToDateFns(carbonPattern);
    return formatDate(date, dfnsPattern);
}
