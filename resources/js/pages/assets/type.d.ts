export type FormField = {
    name: string;
    category_id: string;
    manufacture_id: string;
    serial_number?: string;
    location: string;
    warranty_expired?: Date;
    purchase_date?: Date;
    note?: string;
    reference_link?: string;
};
