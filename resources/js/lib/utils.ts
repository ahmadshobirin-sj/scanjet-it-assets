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
export function camelCaseToWords(str:string, separator = ' ') {
    return str
        // Insert separator before uppercase letters that follow lowercase letters
        .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
        // Insert separator before uppercase letters that are followed by lowercase letters (for acronyms)
        .replace(/([A-Z])([A-Z][a-z])/g, `$1${separator}$2`)
        // Convert to lowercase
        .toLowerCase();
}
