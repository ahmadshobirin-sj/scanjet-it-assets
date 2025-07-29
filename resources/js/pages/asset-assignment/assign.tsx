import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import AssetList from '@/components/asset-asignment/asset-list';
import AssignmentConfirmation from '@/components/asset-asignment/assignment-confirmation';
import EmployeeInfo from '@/components/asset-asignment/employee-info';
import UserList from '@/components/asset-asignment/user-list';
import { MultipleSelector, Option } from '@/components/multiple-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GroupForm, GroupFormField, GroupFormItem } from '@/components/ui/group-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useForm as useFormInertia, usePage } from '@inertiajs/react';
import { Boxes, Check, User, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AssignFormFields, assignFormSchema } from './form.schema';

const AssetAssignmentAssignPage = () => {
    const { component } = usePage<SharedData>();
    const breadcrumbs = useBreadcrumb(component);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const form = useForm<AssignFormFields>({
        resolver: zodResolver(assignFormSchema),
        defaultValues: {
            assigned_user_id: '',
            asset_ids: [],
            assigned_at: new Date(),
            notes: '',
        },
    });
    const { processing, post, transform } = useFormInertia<AssignFormFields>();

    const [employeeSelected, setEmployeeSelected] = useState<Option | null>(null);
    const [assetsSelected, setAssetsSelected] = useState<Option[]>([]);

    useBeforeUnloadPrompt(form.formState.isDirty);

    const fetchEmployees = (search: string): Promise<any[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset-assignment.create', {
                    employee: {
                        filter: {
                            search: search,
                        },
                    },
                }),
                {},
                {
                    only: ['employees'],
                    async: true,
                    preserveState: true,
                    preserveUrl: true,
                    preserveScroll: true,
                    onSuccess: (response) => {
                        resolve(response.props.employees as any[]);
                    },
                },
            );
        });
    };

    const fetchAssets = (search: string): Promise<any[]> => {
        return new Promise((resolve) => {
            router.get(
                route('asset-assignment.create', {
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

    const onSubmit = (value: AssignFormFields) => {
        transform(() => value);
        setConfirmationOpen(true);
    };

    const onConfirm = () => {
        post(route('asset-assignment.assign'), {
            onSuccess: () => {
                console.log('Assets assigned successfully');
            },
            onError: (errors) => {
                console.error('Assignment errors:', errors);
                // form.setError('assigned_user_id', { message: errors.assigned_user_id });
                // form.setError('asset_ids', { message: errors.asset_ids });
                // form.setError('assign_at', { message: errors.assign_at });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle title="Assign Assets" subtitle="Assign assets to users or departments within the organization." />

                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Badge size="md" className="p-1.5" intent="success" variant="light">
                                        <User className="!size-5" />
                                    </Badge>
                                    Select User
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="assigned_user_id"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Choose User</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    single
                                                    triggerSearchOnFocus
                                                    placeholder="Search for an employee..."
                                                    emptyIndicator="No employee found"
                                                    value={value ? [{ label: value, value: value }] : []}
                                                    onChange={(value) => {
                                                        onChange(value?.[0]?.value || '');
                                                        setEmployeeSelected(value?.[0] || null);
                                                    }}
                                                    onSearch={async (value) => fetchEmployees(value)}
                                                    className="md:w-[500px]"
                                                    optionTransformer={(item) => ({
                                                        ...item,
                                                        label: item.email,
                                                        value: item.id,
                                                        optionContent: () => (
                                                            <UserList name={item.name} email={item.email} job_title={item.job_title} />
                                                        ),
                                                    })}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {employeeSelected && (
                                    <EmployeeInfo
                                        className="mt-4"
                                        name={employeeSelected.name}
                                        job_title={employeeSelected.job_title}
                                        email={employeeSelected.email}
                                    />
                                )}
                            </CardContent>
                        </Card>

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
                                    name="asset_ids"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Choose Assets</FormLabel>
                                            <FormControl>
                                                <MultipleSelector
                                                    triggerSearchOnFocus
                                                    placeholder="Search for assets..."
                                                    emptyIndicator="No assets found"
                                                    className="md:w-[500px]"
                                                    onSearch={async (value) => fetchAssets(value)}
                                                    onChange={(value) => {
                                                        onChange(value.map((item) => item.value));
                                                        setAssetsSelected(value);
                                                    }}
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

                                {assetsSelected.length > 0 && (
                                    <div className="mt-4">
                                        <GroupFormItem>
                                            <GroupFormField>
                                                <Label>Selected Assets</Label>
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    {assetsSelected.map((asset) => (
                                                        <AssetList
                                                            bordered
                                                            key={asset.value}
                                                            name={asset.label}
                                                            manufactureName={asset.manufacture.name}
                                                            serialNumber={asset.serial_number}
                                                            assetTag={asset.asset_tag}
                                                            categoryName={asset.category.name}
                                                        />
                                                    ))}
                                                </div>
                                            </GroupFormField>
                                        </GroupFormItem>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Badge size="md" className="p-1.5" intent="success" variant="light">
                                        <User className="!size-5" />
                                    </Badge>
                                    Assignment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GroupForm>
                                    <FormField
                                        control={form.control}
                                        name="assigned_at"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormLabel>Assignment Date</FormLabel>
                                                <FormControl>
                                                    <CalendarDatePicker
                                                        date={{
                                                            from: value,
                                                            to: value,
                                                        }}
                                                        intent="secondary"
                                                        variant="outline"
                                                        onDateSelect={(date) => onChange(date.from)}
                                                        className="md:w-[200px]"
                                                        numberOfMonths={1}
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
                                    <Button leading={<Check />} loading={processing}>
                                        Assign Assets
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
                    </form>
                </Form>
                {employeeSelected && assetsSelected.length > 0 && (
                    <AssignmentConfirmation
                        data={form.getValues()}
                        employeeSelected={employeeSelected}
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

export default AssetAssignmentAssignPage;
