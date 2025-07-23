import { AssetStatus } from '@/types/model';

export class AssetStatusPresenter {
    static getIntent(status: AssetStatus): string {
        switch (status) {
            case 'available':
                return 'primary';
            case 'assigned':
                return 'success';
            case 'maintenance':
                return 'info';
            case 'lost':
                return 'destructive';
            case 'scrapped':
                return 'destructive';
            case 'returned':
                return 'info';
            default:
                return 'secondary';
        }
    }

    static getLabel(status: AssetStatus): string {
        switch (status) {
            case 'available':
                return 'Available';
            case 'assigned':
                return 'Assigned';
            case 'maintenance':
                return 'Maintenance';
            case 'lost':
                return 'Lost';
            case 'scrapped':
                return 'Scrapped';
            case 'returned':
                return 'Returned';
            default:
                return 'Unknown';
        }
    }

    static getValue(status: AssetStatus): string {
        return status;
    }
}
