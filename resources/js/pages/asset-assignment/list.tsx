import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { DataGrid, useTableResolver } from '@/components/data-grid';
import SkeletonDataGrid from '@/components/skeleton/skeleton-data-grid';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { AssetAssignment, ResponseCollection } from '@/types/model';
import { TableServer } from '@/types/table';
import { Page, router } from '@inertiajs/core';
import { usePage, WhenVisible } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { columns as TableColumns } from './column';

const AssetAssignmentListPage = () => {
    const { component } = usePage<SharedData>();
    const breadcrumbs = useBreadcrumb(component);
    const [assignments, setAssignments] = useState<ResponseCollection<AssetAssignment> | undefined>(undefined);
    const { setTable, columns, tableState, tableStateServer } = useTableResolver('assets-assignment-table', TableColumns);

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

                <WhenVisible
                    params={{
                        method: 'get',
                        data: {
                            ...(tableState ? tableStateServer : {}),
                        },
                        only: ['assetAssignments', 'table'],
                        preserveUrl: true,
                        async: true,
                        onSuccess: (data) => {
                            const typedData = data as Page<
                                SharedData & { assetAssignments: ResponseCollection<AssetAssignment>; table: TableServer<AssetAssignment> }
                            >;
                            setAssignments(typedData.props.assetAssignments);
                            setTable(typedData.props.table);
                        },
                    }}
                    fallback={<SkeletonDataGrid />}
                >
                    <DataGrid
                        columns={columns}
                        rows={assignments?.data || []}
                        pageSizeOptions={[10, 25, 50]}
                        tableState={tableState}
                        serverSide
                        rowCount={assignments?.meta?.total || 0}
                        rowId={(row) => (row.id ? row.id.toString() : '')}
                        enableRowSelection
                        actionsRow={(row) => [...(!row.returned_at ? [{ name: 'Return', event: handleReturn }] : [])]}
                    />
                </WhenVisible>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentListPage;
