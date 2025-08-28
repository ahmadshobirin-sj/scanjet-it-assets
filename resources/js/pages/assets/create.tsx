import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { MediaLibraryInput } from '@/components/media-library';
import { MediaItem } from '@/components/media-library/helpers/mediaLibraryApi';
import { MultipleSelector, Option } from '@/components/multiple-selector';
import { Button } from '@/components/ui/button';
import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormField, GroupFormGroup, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { mediaLibraryApi } from '@/lib/api';
import { AssetCategory, Manufacture, ResponseCollection } from '@/types/model';
import { router, useForm, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormField } from './type';

const AssetsCreatePage = () => {
    const { component } = usePage();
    const breadcrumbs = useBreadcrumb(component);
    const [rawPoAttachments, setRawPoAttachments] = useState<MediaItem[]>([]);
    const { data, setData, processing, errors, reset, post } = useForm<FormField>({
        name: '',
        category_id: '',
        manufacture_id: '',
        serial_number: '',
        location: '',
        reference_link: '',
        note: '',
    });

    const handleChangePoAttachments = (value: MediaItem[]) => {
        const ids = value.map((item) => item.id);
        setRawPoAttachments(value);
        setData('po_attachments', ids);
    };

    const handleDeletePoAttachments = (value: MediaItem['id']) => {
        const ids = data.po_attachments?.filter((item) => item !== value);
        const picked = rawPoAttachments.filter((item) => item.id !== value);
        setRawPoAttachments(picked);
        setData('po_attachments', ids);
    };

    const handleReset = () => {
        reset();
        setRawPoAttachments([]);
    };

    const onSearchCategory = (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset.create', {
                    filter: {
                        search: value,
                    },
                }),
                {},
                {
                    async: true,
                    only: ['categories'],
                    preserveUrl: true,
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (data) => {
                        const categories = (data.props.categories as ResponseCollection<AssetCategory>) || [];
                        const formatted = categories.data.map((category: any) => ({
                            label: category.name,
                            value: category.id,
                        }));
                        resolve(formatted);
                    },
                },
            );
        });
    };

    const onSearchManufacture = (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset.create', {
                    filter: {
                        search: value,
                    },
                }),
                {},
                {
                    async: true,
                    only: ['manufactures'],
                    preserveUrl: true,
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (data) => {
                        const manufactures = (data.props.manufactures as ResponseCollection<Manufacture>) || [];
                        const formatted = manufactures.data.map((manufacture: any) => ({
                            label: manufacture.name,
                            value: manufacture.id,
                        }));
                        resolve(formatted);
                    },
                },
            );
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAsset();
    };

    const postAsset = () => {
        post(route('asset.store'), {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message, {
                        ...(errors.error ? { description: errors.error } : {}),
                    });
                }
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Create Asset"
                    subtitle="Add a new asset to your inventory"
                    actions={
                        <>
                            <Button intent="warning" onClick={handleReset}>
                                Reset
                            </Button>
                            <Button onClick={postAsset} loading={processing}>
                                Save
                            </Button>
                        </>
                    }
                />

                <Card>
                    <CardContent>
                        <GroupForm hasGroups onSubmit={handleSubmit}>
                            <GroupFormGroup title="Asset informations" columns={2}>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                        {errors.name && <FormMessage error>{errors.name}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="category">Category</Label>
                                        <MultipleSelector
                                            single
                                            triggerSearchOnFocus
                                            value={data.category_id ? [{ label: '', value: data.category_id }] : []}
                                            onSearch={async (value) => await onSearchCategory(value)}
                                            onChange={(value) => setData('category_id', value[0]?.value || '')}
                                        />
                                        {errors.category_id && <FormMessage error>{errors.category_id}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="manufacture">Manufacture</Label>
                                        <MultipleSelector
                                            single
                                            triggerSearchOnFocus
                                            value={data.manufacture_id ? [{ label: '', value: data.manufacture_id }] : []}
                                            onSearch={async (value) => await onSearchManufacture(value)}
                                            onChange={(value) => setData('manufacture_id', value[0]?.value || '')}
                                        />
                                        {errors.manufacture_id && <FormMessage error>{errors.manufacture_id}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                                        {errors.location && <FormMessage error>{errors.location}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="serial-number">Serial number</Label>
                                        <Input
                                            id="serial-number"
                                            value={data.serial_number}
                                            onChange={(e) => setData('serial_number', e.target.value)}
                                        />
                                        {errors.serial_number && <FormMessage error>{errors.serial_number}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="warranty-expired">Warranty expired</Label>
                                        <CalendarDatePicker
                                            id="warranty-expired"
                                            variant="outline"
                                            intent="secondary"
                                            numberOfMonths={1}
                                            date={{
                                                from: data.warranty_expired,
                                                to: data.warranty_expired,
                                            }}
                                            onDateSelect={(value) => setData('warranty_expired', value.to)}
                                        />
                                        {errors.warranty_expired && <FormMessage error>{errors.warranty_expired}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="purchase-date">Purchase date</Label>
                                        <CalendarDatePicker
                                            id="purchase-date"
                                            variant="outline"
                                            intent="secondary"
                                            numberOfMonths={1}
                                            date={{
                                                from: data.purchase_date,
                                                to: data.purchase_date,
                                            }}
                                            onDateSelect={(value) => setData('purchase_date', value.to)}
                                        />
                                        {errors.purchase_date && <FormMessage error>{errors.purchase_date}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="reference-link">Reference link</Label>
                                        <Input
                                            id="reference-link"
                                            leading={<Globe />}
                                            value={data.reference_link}
                                            onChange={(e) => setData('reference_link', e.target.value)}
                                        />
                                        {errors.reference_link && <FormMessage error>{errors.reference_link}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>

                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="reference-link">Note</Label>
                                        <Textarea id="reference-link" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                                        {errors.note && <FormMessage error>{errors.note}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>

                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label>Pre Order Attachments</Label>
                                        <MediaLibraryInput
                                            api={mediaLibraryApi}
                                            value={rawPoAttachments}
                                            onChange={handleChangePoAttachments}
                                            onDelete={handleDeletePoAttachments}
                                        />
                                        {errors.po_attachments && <FormMessage error>{errors.po_attachments}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                            </GroupFormGroup>
                            <input type="submit" hidden />
                        </GroupForm>
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetsCreatePage;
