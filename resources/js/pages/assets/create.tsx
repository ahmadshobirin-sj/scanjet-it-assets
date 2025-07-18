import AppContainer from '@/components/app-container'
import AppTitle from '@/components/app-title'
import { CalendarDatePicker } from '@/components/ui/calendar-date-picker'
import { Card, CardContent } from '@/components/ui/card'
import { FormMessage } from '@/components/ui/form-message'
import { GroupForm, GroupFormField, GroupFormGroup, GroupFormItem } from '@/components/ui/group-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import AppLayout from '@/layouts/app-layout'
import { AssetCategory, AssetStatus, Manufacture, ResponseCollection } from '@/types/model'
import { router, useForm, usePage } from '@inertiajs/react'
import { Globe } from 'lucide-react'
import { FormField } from './type'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { toast } from 'sonner'


const AssetsCreatePage = () => {
    const { component } = usePage()
    const breadcrumbs = useBreadcrumb(component)

    const { data, setData, processing, errors, reset, transform, post } = useForm<FormField>({
        name: '',
        category_id: [],
        manufacture_id: [],
        serial_number: '',
        location: '',
        reference_link: '',
        note: '',
    })

    const onSearchCategory = (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset.create', {
                    'filter': {
                        'search': value
                    }
                }),
                {},
                {
                    async: true,
                    only: ['categories'],
                    preserveUrl: true,
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (data) => {
                        const categories = data.props.categories as ResponseCollection<AssetCategory> || []
                        const formatted = categories.data.map((category: any) => ({
                            label: category.name,
                            value: category.id,
                        }))
                        resolve(formatted)
                    },
                }
            )
        })
    }

    const onSearchManufacture = (value: string): Promise<Option[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset.create', {
                    'filter': {
                        'search': value
                    }
                }),
                {},
                {
                    async: true,
                    only: ['manufactures'],
                    preserveUrl: true,
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (data) => {
                        const manufactures = data.props.manufactures as ResponseCollection<Manufacture> || []
                        const formatted = manufactures.data.map((manufacture: any) => ({
                            label: manufacture.name,
                            value: manufacture.id,
                        }))
                        resolve(formatted)
                    },
                }
            )
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        postAsset()
    }

    const postAsset = () => {
        transform((data) => ({
            ...data,
            category_id: data.category_id[0]?.value,
            manufacture_id: data.manufacture_id[0]?.value,
        }))

        post(route('asset.store'), {
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message, {
                        ...(errors.error ? { description: errors.error } : {}),
                    })
                }
            },
            preserveState: true,
            preserveScroll: true,
        })
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Create Asset"
                    subtitle="Add a new asset to your inventory"
                    actions={
                        <>
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
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && <FormMessage error>{errors.name}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="category">Category</Label>
                                        <MultipleSelector
                                            single
                                            triggerSearchOnFocus
                                            value={data.category_id}
                                            onSearch={async (value) => await onSearchCategory(value)}
                                            onChange={(value) => setData('category_id', value)}
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
                                            value={data.manufacture_id}
                                            onSearch={async (value) => await onSearchManufacture(value)}
                                            onChange={(value) => setData('manufacture_id', value)}
                                        />
                                        {errors.manufacture_id && <FormMessage error>{errors.manufacture_id}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                        />
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
                                        <Textarea
                                            id="reference-link"
                                            value={data.note}
                                            onChange={(e) => setData('note', e.target.value)}
                                        />
                                        {errors.note && <FormMessage error>{errors.note}</FormMessage>}
                                    </GroupFormField>
                                </GroupFormItem>
                            </GroupFormGroup>
                            <input type="submit" hidden />
                        </GroupForm>
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    )
}

export default AssetsCreatePage
