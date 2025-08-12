import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid, useTableResolver } from '@/components/data-grid';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { usePermission } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { AssetAssignment, ResponseCollection } from '@/types/model';
import { TableServer } from '@/types/table';
import { router } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import { columns as TableColumns } from './column';

const AssetAssignmentListPage = () => {
    const {
        component,
        props: { assignments, table },
    } = usePage<SharedData & { assignments: ResponseCollection<AssetAssignment>; table: TableServer<AssetAssignment> }>();
    const breadcrumbs = useBreadcrumb(component);
    const { columns, tableState } = useTableResolver(table, TableColumns);
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

                <DataGrid
                    columns={columns}
                    rows={assignments?.data || []}
                    pageSizeOptions={[10, 25, 50]}
                    tableState={tableState}
                    serverSide
                    rowCount={assignments?.meta?.total || 0}
                    rowId={(row) => (row.id ? row.id.toString() : '')}
                    enableRowSelection
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
                />
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentListPage;
