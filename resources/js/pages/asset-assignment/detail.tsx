import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import AssetList from '@/components/asset-asignment/asset-list';
import { DataTable, DataTableResource } from '@/components/data-table';
import MemberPill from '@/components/member-pill';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoList, InfoListContainer, InfoListContent, InfoListLabel } from '@/components/ui/info-list';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { formatWithBrowserTimezone } from '@/lib/date';
import { SharedData } from '@/types';
import { AssetAssignment, AssetAssignmentReturnLog } from '@/types/model';
import { router, usePage } from '@inertiajs/react';
import { Boxes, FileInputIcon, FileTextIcon, LogsIcon, Notebook, ViewIcon } from 'lucide-react';

const AssetAssignmentDetail = () => {
    const {
        component,
        props: { assetAssignment, returnLog },
    } = usePage<SharedData & { assetAssignment: AssetAssignment; returnLog: DataTableResource<AssetAssignmentReturnLog> }>();
    const breadcrumbs = useBreadcrumb(component);

    const handleExportPdf = (row: AssetAssignmentReturnLog) => {
        window.open(route('asset-return.exportPdf', { id: row.id }), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title={`Asset Assignment | ${assetAssignment.reference_code}`}
                    subtitle="Asset assignment information"
                    actions={
                        <>
                            <Button
                                leading={<FileInputIcon />}
                                intent="info"
                                onClick={() => {
                                    router.visit(
                                        route('asset-assignment.storeReturn', {
                                            reference_code: assetAssignment.reference_code,
                                        }),
                                    );
                                }}
                            >
                                Return
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
                                <InfoList direction="column">
                                    <InfoListLabel>Completed Return At</InfoListLabel>
                                    <InfoListContent>{formatWithBrowserTimezone(assetAssignment.returned_at)}</InfoListContent>
                                </InfoList>
                            </InfoListContainer>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge size="md" className="p-1.5" intent="info" variant="light">
                                    <Boxes className="!size-5" />
                                </Badge>
                                Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                {assetAssignment.assets &&
                                    assetAssignment.assets.map((asset, index) => (
                                        <AssetList
                                            key={index}
                                            bordered
                                            name={asset.name}
                                            serialNumber={asset.serial_number || '-'}
                                            assetTag={asset.asset_tag || '-'}
                                            categoryName={asset.category.name}
                                            manufactureName={asset.manufacture.name}
                                        />
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Badge size="md" className="p-1.5" intent="success" variant="light">
                                <LogsIcon className="!size-5" />
                            </Badge>
                            Return Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            resource={returnLog}
                            bulkActions={[]}
                            exportActions={[]}
                            actionsRow={() => [
                                {
                                    name: 'View',
                                    icon: <ViewIcon />,
                                },
                                {
                                    name: 'Export PDF',
                                    icon: <FileTextIcon />,
                                    event: handleExportPdf,
                                },
                            ]}
                            transformerColumns={{
                                'received_by.email': (column) => ({
                                    ...column,
                                    cell: ({ row }) => {
                                        return (
                                            <MemberPill
                                                user={[
                                                    {
                                                        label: 'Name',
                                                        value: row.original.received_by.name || '?',
                                                    },
                                                    {
                                                        label: 'Email',
                                                        value: row.original.received_by.email || '-',
                                                    },
                                                    {
                                                        label: 'Job Title',
                                                        value: (
                                                            <Badge intent="info" variant="light">
                                                                {row.original.received_by.job_title || 'N/A'}
                                                            </Badge>
                                                        ),
                                                    },
                                                    {
                                                        label: 'Office Location',
                                                        value: row.original.received_by.office_location || '-',
                                                    },
                                                ]}
                                                text={row.original.received_by.name || row.original.received_by.email || '?'}
                                                intent="info"
                                                variant="light"
                                                size="sm"
                                            />
                                        );
                                    },
                                }),
                                returned_at: (column) => ({
                                    ...column,
                                    cell: ({ row }) => formatWithBrowserTimezone(row.original.returned_at),
                                }),
                            }}
                        />
                    </CardContent>
                </Card>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentDetail;
