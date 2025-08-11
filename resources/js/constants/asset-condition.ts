export const AssetConditionList = ['ok', 'lost', 'stolen', 'damaged', 'malfunctioning'] as const;

export type AssetCondition = (typeof AssetConditionList)[number];

const AssetConditionMeta: Record<AssetCondition, { label: string; intent: string }> = {
    ok: { label: 'Ok', intent: 'success' },
    lost: { label: 'Lost', intent: 'destructive' },
    stolen: { label: 'Stolen', intent: 'destructive' },
    damaged: { label: 'Damaged', intent: 'destructive' },
    malfunctioning: { label: 'Malfunctioning', intent: 'warning' },
};

export class AssetConditionHelper {
    static getLabel(status: AssetCondition): string {
        return AssetConditionMeta[status].label;
    }

    static getIntent(status: AssetCondition): string {
        return AssetConditionMeta[status].intent;
    }

    static getOptions(): { value: AssetCondition; label: string }[] {
        return AssetConditionList.map((status) => ({
            value: status,
            label: AssetConditionMeta[status].label,
        }));
    }
}
