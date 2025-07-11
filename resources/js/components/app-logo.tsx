import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { SharedData } from '@/types';

export default function AppLogo({ name, logo }: { name?: string; logo?: string }) {
    return (
        <>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{name}</span>
            </div>
        </>
    );
}
