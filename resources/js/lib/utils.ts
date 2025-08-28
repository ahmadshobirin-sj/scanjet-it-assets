import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Convert camelCase string to separated words
 * @param {string} str - The camelCase string to convert
 * @param {string} separator - The separator to use (default: space)
 * @returns {string} - The converted string with separated words
 */
export function camelCaseToWords(str: string, separator = ' ') {
    return (
        str
            // Insert separator before uppercase letters that follow lowercase letters
            .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
            // Insert separator before uppercase letters that are followed by lowercase letters (for acronyms)
            .replace(/([A-Z])([A-Z][a-z])/g, `$1${separator}$2`)
            // Convert to lowercase
            .toLowerCase()
    );
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${value} ${sizes[i]}`;
}

export function progressPercent(loaded?: number, total?: number) {
    if (!loaded || !total || total === 0) return 0; // total bisa undefined di beberapa server
    return Math.min(100, Math.round((loaded / total) * 100));
}
