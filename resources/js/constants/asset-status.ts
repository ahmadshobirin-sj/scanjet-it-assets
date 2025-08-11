export const AssetStatusList = ['available', 'assigned', 'maintenance', 'lost', 'stolen', 'damaged', 'malfunctioning'] as const;

export type AssetStatus = (typeof AssetStatusList)[number];

const AssetStatusMeta: Record<AssetStatus, { label: string; intent: string }> = {
    available: { label: 'Available', intent: 'primary' },
    assigned: { label: 'Assigned', intent: 'success' },
    maintenance: { label: 'Maintenance', intent: 'info' },
    lost: { label: 'Lost', intent: 'destructive' },
    stolen: { label: 'Stolen', intent: 'destructive' },
    damaged: { label: 'Damaged', intent: 'destructive' },
    malfunctioning: { label: 'Malfunctioning', intent: 'destructive' },
};

export class AssetStatusHelper {
    static getLabel(status: AssetStatus): string {
        return AssetStatusMeta[status].label;
    }

    static getIntent(status: AssetStatus): string {
        return AssetStatusMeta[status].intent;
    }

    static getOptions(): { value: AssetStatus; label: string }[] {
        return AssetStatusList.map((status) => ({
            value: status,
            label: AssetStatusMeta[status].label,
        }));
    }
}
