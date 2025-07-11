import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const usePermission = () => {
    const page = usePage<SharedData>();

    const permissions = page.props.auth?.user.permissions ?? []

    const can = (keys: string | string[]): boolean => {
        const set = permissions;

        if (Array.isArray(keys)) {
            return keys.some((key) => set.includes(key));
        }

        return set.includes(keys);
    };

    return {
        can,
    };
};
