import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataTable, DataTableResource } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { AssetAssignment } from '@/types/model';
import { router } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import { columns } from './column';

const AssetAssignmentListPage = () => {
    const {
        component,
        props: { assignments },
    } = usePage<SharedData & { assignments: DataTableResource<AssetAssignment> }>();
    const breadcrumbs = useBreadcrumb(component);
    const { can } = usePermission();

    const handleReturn = (row: AssetAssignment) => {
        router.visit(route('asset-assignment.return', { reference_code: row.reference_code }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Asset Assignments"
                    subtitle="View and manage asset assignments within the organization."
                    actions={
                        <>
                            <Button intent="success" leading={<PackagePlus />} onClick={() => router.visit(route('asset-assignment.assign'))}>
                                Assign assets
                            </Button>
                        </>
                    }
                />
                <DataTable
                    resource={assignments}
                    bulkActions={[]}
                    exportActions={[]}
                    actionsRow={() => [
                        ...(can('asset_return.create')
                            ? [
                                  {
                                      name: 'Return',
                                      event: handleReturn,
                                  },
                              ]
                            : []),
                    ]}
                    transformerColumns={columns}
                />
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentListPage;
