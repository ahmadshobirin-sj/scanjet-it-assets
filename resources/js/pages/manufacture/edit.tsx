import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormField, GroupFormGroup, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Manufacture, ResponseResource } from '@/types/model';
import { router, useForm, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

const ManufactureUpdatePage = () => {
    const {
        component,
        props: { manufacture },
    } = usePage<SharedData & { manufacture: ResponseResource<Manufacture> }>();
    const breadcrumbs = useBreadcrumb(component);

    const { data, setData, processing, put, isDirty, errors, reset, setDefaults } = useForm<{
        name: string;
        phone?: string;
        email?: string;
        website?: string;
        address?: string;
        contact_person_name?: string;
        contact_person_phone?: string;
        contact_person_email?: string;
    }>({
        name: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
    });

    useBeforeUnloadPrompt(isDirty);

    useEffect(() => {
        const value: typeof data = {
            name: manufacture.data.name || '',
            phone: manufacture.data.phone || '',
            email: manufacture.data.email || '',
            website: manufacture.data.website || '',
            address: manufacture.data.address || '',
            contact_person_name: manufacture.data.contact_person_name || '',
            contact_person_phone: manufacture.data.contact_person_phone || '',
            contact_person_email: manufacture.data.contact_person_email || '',
        };

        setDefaults(value);
        setData(value);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manufacture]);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('name', e.target.value);
    };

    const handleChangePhone = (value: string) => {
        setData('phone', value);
    };

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('email', e.target.value);
    };

    const handleChangeWebsite = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('website', e.target.value);
    };

    const handleChangeAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('address', e.target.value);
    };

    const handleChangeContactPersonName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('contact_person_name', e.target.value);
    };

    const handleChangeContactPersonPhone = (value: string) => {
        setData('contact_person_phone', value);
    };

    const handleChangeContactPersonEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('contact_person_email', e.target.value);
    };

    const handleSubmit = () => {
        put(route('manufacture.update', { manufacture: manufacture.data.id }), {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Update manufacture"
                    subtitle="Update the details of the selected manufacture"
                    actions={
                        <>
                            <Button variant="outline" onClick={() => router.visit(route('manufacture.index'))}>
                                Cancel
                            </Button>
                            <Button intent="warning" onClick={() => reset()}>
                                Reset
                            </Button>
                            <Button loading={processing} onClick={handleSubmit}>
                                Save
                            </Button>
                        </>
                    }
                />

                <Card>
                    <CardContent>
                        <GroupForm hasGroups onSubmit={handleSubmit}>
                            <GroupFormGroup title="Manufacture" columns={2}>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" type="text" value={data.name} placeholder="ex: Scanjet" onChange={handleChangeName} />
                                    </GroupFormField>
                                    {errors.name && <FormMessage error>{errors.name}</FormMessage>}
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="phone">Phone</Label>
                                        <PhoneInput id="phone" placeholder="ex: +46 123" value={data.phone} onChange={handleChangePhone} />
                                    </GroupFormField>
                                    {errors.phone && <FormMessage>{errors.phone}</FormMessage>}
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="ex: scanjet@example.com"
                                            value={data.email}
                                            onChange={handleChangeEmail}
                                        />
                                    </GroupFormField>
                                    {errors.email && <FormMessage>{errors.email}</FormMessage>}
                                </GroupFormItem>

                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            type="text"
                                            leading={<Globe />}
                                            placeholder="ex: https://scanjet.net"
                                            value={data.website}
                                            onChange={handleChangeWebsite}
                                        />
                                    </GroupFormField>
                                    {errors.website && <FormMessage>{errors.website}</FormMessage>}
                                </GroupFormItem>

                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea id="address" value={data.address} onChange={handleChangeAddress} />
                                    </GroupFormField>
                                    {errors.website && <FormMessage>{errors.website}</FormMessage>}
                                </GroupFormItem>
                            </GroupFormGroup>

                            <GroupFormGroup title="Contact person" columns={2}>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="contact-person-name">Name</Label>
                                        <Input
                                            id="contact-person-name"
                                            placeholder="ex: John Doe"
                                            value={data.contact_person_name}
                                            onChange={handleChangeContactPersonName}
                                        />
                                    </GroupFormField>
                                    {errors.contact_person_name && <FormMessage>{errors.contact_person_name}</FormMessage>}
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="contact-person-phone">Phone</Label>
                                        <PhoneInput
                                            id="contact-person-phone"
                                            placeholder="ex: +1 123 123"
                                            value={data.contact_person_phone}
                                            onChange={handleChangeContactPersonPhone}
                                        />
                                    </GroupFormField>
                                    {errors.contact_person_phone && <FormMessage>{errors.contact_person_phone}</FormMessage>}
                                </GroupFormItem>
                                <GroupFormItem>
                                    <GroupFormField>
                                        <Label htmlFor="contact-person-email">Email</Label>
                                        <Input
                                            id="contact-person-email"
                                            placeholder="ex: johndoe@example.com"
                                            value={data.contact_person_email}
                                            onChange={handleChangeContactPersonEmail}
                                        />
                                    </GroupFormField>
                                    {errors.contact_person_email && <FormMessage>{errors.contact_person_email}</FormMessage>}
                                </GroupFormItem>
                            </GroupFormGroup>
                            <input type="hidden" />
                        </GroupForm>
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    );
};

export default ManufactureUpdatePage;
