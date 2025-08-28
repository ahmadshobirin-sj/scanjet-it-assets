import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import AssetList, { AssetListSelector } from '@/components/asset-asignment/asset-list';
import AssignmentConfirmation from '@/components/asset-asignment/assignment-confirmation';
import MemberPill from '@/components/member-pill';
import { MultipleSelector, Option } from '@/components/multiple-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GroupForm } from '@/components/ui/group-form';
import { InfoList, InfoListContainer, InfoListContent, InfoListLabel } from '@/components/ui/info-list';
import { Textarea } from '@/components/ui/textarea';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { formatWithBrowserTimezone } from '@/lib/date';
import { SharedData } from '@/types';
import { AssetAssignment } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useForm as useFormInertia, usePage } from '@inertiajs/react';
import { Boxes, Check, Notebook, ViewIcon, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ReturnFormFields, returnFormSchema } from './form.schema';

const AssetAssignmentReturn = () => {
    const {
        component,
        props: { assetAssignment },
    } = usePage<SharedData & { assetAssignment: AssetAssignment }>();
    const breadcrumbs = useBreadcrumb(component);
    const [assetsSelected, setAssetsSelected] = useState<Option[]>([]);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const form = useForm<ReturnFormFields>({
        resolver: zodResolver(returnFormSchema),
        defaultValues: {
            assets: [],
            returned_at: new Date(),
            notes: '',
        },
    });

    const { processing, post, transform } = useFormInertia<ReturnFormFields>();

    const assetField = useFieldArray({
        control: form.control,
        name: 'assets',
    });

    useBeforeUnloadPrompt(form.formState.isDirty);

    const fetchAssets = (search: string): Promise<any[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset-assignment.return', {
                    reference_code: assetAssignment.reference_code,
                    asset: {
                        filter: {
                            search: search,
                        },
                    },
                }),
                {},
                {
                    only: ['assets'],
                    async: true,
                    preserveState: true,
                    preserveUrl: true,
                    preserveScroll: true,
                    onSuccess: (response) => {
                        resolve(response.props.assets as any[]);
                    },
                },
            );
        });
    };

    const handleAssetConditionChange = useCallback(
        (id: string) => {
            const isExist = assetField.fields.some((field) => field.asset_id === id);
            if (!isExist) {
                assetField.append({
                    asset_id: id,
                    condition: 'ok',
                });
            }
        },
        [assetField],
    );

    const handleOnChangeAssets = useCallback(
        (value: Option[]) => {
            setAssetsSelected((prev) => {
                const newValues = value.filter((item) => !prev.some((p) => p.value === item.value));

                newValues.forEach((item) => handleAssetConditionChange(item.value));

                return [...prev, ...newValues];
            });
        },
        [handleAssetConditionChange],
    );

    const handleDeleteAsset = useCallback(
        (assetValueToDelete: string) => {
            const indexToRemove = assetField.fields.findIndex((field) => field.asset_id === assetValueToDelete);

            if (indexToRemove !== -1) {
                assetField.remove(indexToRemove);
            }
            setAssetsSelected((prev) => prev.filter((item) => item.value !== assetValueToDelete));
        },
        [assetField, setAssetsSelected],
    );

    const onSubmit = (value: ReturnFormFields) => {
        transform(() => value);
        setConfirmationOpen(true);
    };

    const onConfirm = () => {
        post(route('asset-assignment.storeReturn', { reference_code: assetAssignment.reference_code }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title={`Asset Return Form | ${assetAssignment.reference_code}`}
                    subtitle="Return assets assigned to IT department."
                    actions={
                        <>
                            <Button
                                leading={<ViewIcon />}
                                intent="info"
                                onClick={() => {
                                    router.visit(
                                        route('asset-assignment.show', {
                                            reference_code: assetAssignment.reference_code,
                                        }),
                                    );
                                }}
                            >
                                View
                            </Button>
                        </>
                    }
                />
                <div className="flex flex-col gap-4 xl:flex-row">
                    <Card className="xl:h-fit xl:w-sm xl:max-w-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge size="md" className="p-1.5" intent="success" variant="light">
                                    <Notebook className="!size-5" />
                                </Badge>
                                Detail Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InfoListContainer className="sm:!grid-cols-2 xl:!grid-cols-1">
                                <InfoList direction="column">
                                    <InfoListLabel>Assigned to</InfoListLabel>
                                    <InfoListContent>
                                        <MemberPill
                                            user={[
                                                {
                                                    label: 'Name',
                                                    value: assetAssignment.assigned_user?.name || assetAssignment.assigned_user?.email || '?',
                                                },
                                                {
                                                    label: 'Email',
                                                    value: assetAssignment.assigned_user?.email || '-',
                                                },
                                                {
                                                    label: 'Job Title',
                                                    value: (
                                                        <Badge intent="info" variant="light">
                                                            {assetAssignment.assigned_user?.job_title || 'N/A'}
                                                        </Badge>
                                                    ),
                                                },
                                                {
                                                    label: 'Office Location',
                                                    value: assetAssignment.assigned_user?.office_location || '-',
                                                },
                                            ]}
                                            text={assetAssignment.assigned_user?.name || assetAssignment.assigned_user?.email || '?'}
                                            intent="info"
                                            variant="light"
                                            size="sm"
                                        />
                                    </InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Assigned by</InfoListLabel>
                                    <InfoListContent>
                                        <MemberPill
                                            user={[
                                                {
                                                    label: 'Name',
                                                    value: assetAssignment.assigned_by?.name || assetAssignment.assigned_by?.email || '?',
                                                },
                                                {
                                                    label: 'Email',
                                                    value: assetAssignment.assigned_by?.email || '-',
                                                },
                                                {
                                                    label: 'Job Title',
                                                    value: (
                                                        <Badge intent="info" variant="light">
                                                            {assetAssignment.assigned_by?.job_title}
                                                        </Badge>
                                                    ),
                                                },
                                                {
                                                    label: 'Office Location',
                                                    value: assetAssignment.assigned_by?.office_location || '-',
                                                },
                                            ]}
                                            text={assetAssignment.assigned_by?.name || assetAssignment.assigned_by?.email || '?'}
                                            intent="info"
                                            variant="light"
                                            size="sm"
                                        />
                                    </InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Assigned At</InfoListLabel>
                                    <InfoListContent>{formatWithBrowserTimezone(assetAssignment.assigned_at)}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Notes</InfoListLabel>
                                    <InfoListContent>{assetAssignment.notes || '-'}</InfoListContent>
                                </InfoList>
                            </InfoListContainer>
                        </CardContent>
                    </Card>

                    <div className="h-auto flex-1 space-y-4">
                        <Form {...form}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge size="md" className="p-1.5" intent="info" variant="light">
                                            <Boxes className="!size-5" />
                                        </Badge>
                                        Select Assets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="assets"
                                        render={({
                                            field: {
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                onChange,
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                value,
                                                ...field
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MultipleSelector
                                                        single
                                                        triggerSearchOnFocus
                                                        placeholder="Search for assets..."
                                                        emptyIndicator="No assets found"
                                                        className="md:w-[500px]"
                                                        value={[]}
                                                        onSearch={async (item) => fetchAssets(item)}
                                                        onChange={handleOnChangeAssets}
                                                        optionTransformer={(item) => ({
                                                            ...item,
                                                            label: item.name + ' - ' + item.serial_number,
                                                            value: item.id,
                                                            optionContent: () => (
                                                                <AssetList
                                                                    name={item.name}
                                                                    manufactureName={item.manufacture?.name}
                                                                    serialNumber={item.serial_number}
                                                                    assetTag={item.asset_tag}
                                                                    categoryName={item.category?.name}
                                                                />
                                                            ),
                                                        })}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {assetField.fields.length > 0 && (
                                        <div className="mt-6">
                                            <p className="mb-3 text-sm font-semibold">Selected Assets</p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {assetField.fields.map((field, index) => (
                                                    <FormField
                                                        key={field.asset_id}
                                                        control={form.control}
                                                        name={`assets.${index}.condition`}
                                                        render={({ field: { value, onChange } }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <AssetListSelector
                                                                        value={value}
                                                                        assetList={{
                                                                            bordered: true,
                                                                            name: assetsSelected[index]?.label || '',
                                                                            manufactureName: assetsSelected[index]?.manufacture.name || '',
                                                                            serialNumber: assetsSelected[index]?.serial_number || '',
                                                                            assetTag: assetsSelected[index]?.asset_tag || '',
                                                                            categoryName: assetsSelected[index]?.category.name || '',
                                                                        }}
                                                                        onValueChange={onChange}
                                                                        onDelete={() => handleDeleteAsset(field.asset_id)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge size="md" className="p-1.5" intent="warning" variant="light">
                                            <Notebook className="!size-5" />
                                        </Badge>
                                        Return Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <GroupForm>
                                        <FormField
                                            control={form.control}
                                            name="returned_at"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Return Date</FormLabel>
                                                    <FormControl>
                                                        <CalendarDatePicker
                                                            date={{
                                                                from: value,
                                                                to: value,
                                                            }}
                                                            intent="secondary"
                                                            variant="outline"
                                                            onDateSelect={(date) => onChange(date.from)}
                                                            className="md:w-fit"
                                                            numberOfMonths={1}
                                                            withTime
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Add any special instructions or notes regarding the asset assignment..."
                                                            value={value}
                                                            onChange={(e) => onChange(e.target.value)}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </GroupForm>

                                    <div className="mt-4 flex gap-2">
                                        <Button leading={<Check />} onClick={form.handleSubmit(onSubmit)} loading={processing}>
                                            Return Assets
                                        </Button>
                                        <Button
                                            leading={<X />}
                                            intent="secondary"
                                            type="button"
                                            disabled={processing}
                                            onClick={() => {
                                                router.visit(route('asset-assignment.index'));
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Form>
                    </div>
                </div>

                {assetsSelected.length > 0 && (
                    <AssignmentConfirmation
                        type="return"
                        data={form.getValues()}
                        employeeSelected={{
                            id: assetAssignment.assigned_user?.id,
                            name: assetAssignment.assigned_user?.name,
                            email: assetAssignment.assigned_user?.email,
                            job_title: assetAssignment.assigned_user?.job_title,
                            office_location: assetAssignment.assigned_user?.office_location,
                        }}
                        assetsSelected={assetsSelected}
                        open={confirmationOpen}
                        onOpenChange={(open) => {
                            setConfirmationOpen(open);
                        }}
                        loading={processing}
                        onConfirm={onConfirm}
                    />
                )}
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentReturn;
