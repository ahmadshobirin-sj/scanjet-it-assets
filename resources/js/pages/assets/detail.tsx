import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoList, InfoListContainer, InfoListContent, InfoListGroup, InfoListLabel } from '@/components/ui/info-list';
import { AssetStatusHelper } from '@/constants/asset-status';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { formatWithBrowserTimezone } from '@/lib/date';
import { SharedData } from '@/types';
import type { Asset, ResponseResource } from '@/types/model';
import { router, usePage } from '@inertiajs/react';

const AssetsDetailPage = () => {
    const {
        component,
        props: { asset },
    } = usePage<SharedData & { asset: ResponseResource<Asset> }>();
    const breadcrumbs = useBreadcrumb(component);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Detail Asset"
                    subtitle="View asset information."
                    actions={
                        <Button intent="warning" onClick={() => router.visit(route('asset.edit', { asset: asset.data.id }))}>
                            Edit
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoListContainer hasGroups>
                            <InfoListGroup title="Asset" columns={2}>
                                <InfoList direction="column">
                                    <InfoListLabel>Name</InfoListLabel>
                                    <InfoListContent>{asset.data.name || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Category</InfoListLabel>
                                    <InfoListContent>{asset.data.category.name || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Manufacture</InfoListLabel>
                                    <InfoListContent>{asset.data.manufacture.name || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Location</InfoListLabel>
                                    <InfoListContent>{asset.data.location || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Serial number</InfoListLabel>
                                    <InfoListContent>{asset.data.serial_number || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Warranty expired</InfoListLabel>
                                    <InfoListContent>{formatWithBrowserTimezone(asset.data.warranty_expired)}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Purchase date</InfoListLabel>
                                    <InfoListContent>{formatWithBrowserTimezone(asset.data.purchase_date)}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Reference link</InfoListLabel>
                                    <InfoListContent>{asset.data.reference_link || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Note</InfoListLabel>
                                    <InfoListContent>{asset.data.note || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Status</InfoListLabel>
                                    <InfoListContent>
                                        <Badge intent={AssetStatusHelper.getIntent(asset.data.status) as any} size="md">
                                            {AssetStatusHelper.getLabel(asset.data.status)}
                                        </Badge>
                                    </InfoListContent>
                                </InfoList>
                            </InfoListGroup>
                            {asset.data?.assigned_user && (
                                <InfoListGroup title="Assigned User" columns={2}>
                                    <InfoList direction="column">
                                        <InfoListLabel>Name</InfoListLabel>
                                        <InfoListContent>{asset.data.assigned_user?.name || '-'}</InfoListContent>
                                    </InfoList>
                                    <InfoList direction="column">
                                        <InfoListLabel>Email</InfoListLabel>
                                        <InfoListContent>{asset.data.assigned_user?.email || '-'}</InfoListContent>
                                    </InfoList>
                                    <InfoList direction="column">
                                        <InfoListLabel>Job title</InfoListLabel>
                                        <InfoListContent>{asset.data.assigned_user?.job_title || '-'}</InfoListContent>
                                    </InfoList>
                                    <InfoList direction="column">
                                        <InfoListLabel>Office location</InfoListLabel>
                                        <InfoListContent>{asset.data.assigned_user?.office_location || '-'}</InfoListContent>
                                    </InfoList>
                                </InfoListGroup>
                            )}
                        </InfoListContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Histories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataGrid rows={[]} columns={[]} />
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetsDetailPage;
