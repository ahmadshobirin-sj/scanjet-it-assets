import { Option } from '@/components/ui/multiple-selector';

export type FormField = {
    name: string;
    category_id: Option[];
    manufacture_id: Option[];
    serial_number?: string;
    location: string;
    warranty_expired?: Date;
    purchase_date?: Date;
    note?: string;
    reference_link?: string;
};
