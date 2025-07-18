import { format, toZonedTime } from 'date-fns-tz';

/**
 * Format UTC/ISO date ke waktu lokal browser menggunakan date-fns
 *
 * @param dateStr - ISO string atau Date object dari server (UTC)
 * @param formatStr - Format output (default: 'dd MMM yyyy HH:mm')
 * @returns String waktu yang diformat sesuai timezone browser
 */
export function formatWithBrowserTimezone(
    dateStr: string | Date | null,
    formatStr: string = 'dd MMM yyyy HH:mm'
): string {
    if (!dateStr) {
        return '-';
    }
    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const zonedDate = toZonedTime(date, browserTimezone);
        return format(zonedDate, formatStr, { timeZone: browserTimezone });
    } catch (error) {
        return '-';
    }
}
