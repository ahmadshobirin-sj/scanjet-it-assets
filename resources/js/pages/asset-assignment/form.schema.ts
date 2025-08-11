import { AssetConditionList } from '@/constants/asset-condition';
import { z } from 'zod';

export const assignFormSchema = z.object({
    assigned_user_id: z.string().min(1, 'Please select an employee.'),
    asset_ids: z.array(z.string()).min(1, 'Please select at least one asset.'),
    assigned_at: z.date({
        error: 'Please select a valid date.',
    }),
    notes: z.string().optional(),
});

export type AssignFormFields = z.infer<typeof assignFormSchema>;

export const returnFormSchema = z.object({
    assets: z
        .array(
            z.object({
                asset_id: z.string().min(1, 'Asset ID is required.'),
                condition: z.enum(AssetConditionList).refine((val) => !!val, {
                    message: 'Condition is required.',
                }),
            }),
        )
        .min(1, 'Please select at least one asset.'),
    returned_at: z.date({
        error: 'Please select a valid return date.',
    }),
    notes: z.string().optional(),
});

export type ReturnFormFields = z.infer<typeof returnFormSchema>;
