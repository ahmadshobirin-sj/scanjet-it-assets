import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoList, InfoListContainer, InfoListContent, InfoListGroup, InfoListLabel } from '@/components/ui/info-list';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Manufacture, ResponseResource } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { SquarePen } from 'lucide-react';

const ManufactureDetailPage = () => {
    const {
        component,
        props: { manufacture },
    } = usePage<SharedData & { manufacture: ResponseResource<Manufacture> }>();
    const breadcrumbs = useBreadcrumb(component);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Manufacture detail"
                    subtitle="Details of the selected manufacture"
                    actions={
                        <>
                            <Button
                                variant="fill"
                                intent="warning"
                                leading={<SquarePen />}
                                onClick={() => router.visit(route('manufacture.edit', { manufacture: manufacture?.data.id }))}
                            >
                                Edit manufacture
                            </Button>
                        </>
                    }
                />

                <Card>
                    <CardContent>
                        <InfoListContainer hasGroups>
                            <InfoListGroup title="Manufacture Information" columns={2}>
                                <InfoList direction="column">
                                    <InfoListLabel>Name</InfoListLabel>
                                    <InfoListContent>{manufacture.data.name || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Phone</InfoListLabel>
                                    <InfoListContent>{manufacture.data.phone || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Email</InfoListLabel>
                                    <InfoListContent>
                                        {manufacture.data.email ? (
                                            <a href={`mailto:${manufacture.data.email}`} target="_blank" rel="noopener noreferrer">
                                                {manufacture.data.email}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Website</InfoListLabel>
                                    <InfoListContent>{manufacture.data.website || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Address</InfoListLabel>
                                    <InfoListContent>{manufacture.data.address || '-'}</InfoListContent>
                                </InfoList>
                            </InfoListGroup>

                            <InfoListGroup title="Contact Person" columns={2}>
                                <InfoList direction="column">
                                    <InfoListLabel>Name</InfoListLabel>
                                    <InfoListContent>{manufacture.data.contact_person_name || '-'}</InfoListContent>
                                </InfoList>

                                <InfoList direction="column">
                                    <InfoListLabel>Phone</InfoListLabel>
                                    <InfoListContent>{manufacture.data.contact_person_phone || '-'}</InfoListContent>
                                </InfoList>

                                <InfoList direction="column">
                                    <InfoListLabel>Email</InfoListLabel>
                                    <InfoListContent>
                                        {manufacture.data.contact_person_email ? (
                                            <a href={`mailto:${manufacture.data.contact_person_email}`} target="_blank" rel="noopener noreferrer">
                                                {manufacture.data.contact_person_email}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </InfoListContent>
                                </InfoList>
                            </InfoListGroup>
                        </InfoListContainer>
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    );
};

export default ManufactureDetailPage;
