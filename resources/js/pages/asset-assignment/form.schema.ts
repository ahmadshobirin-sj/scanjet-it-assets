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
