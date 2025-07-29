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
import { PackageMinus, PackagePlus } from 'lucide-react';
import { useState } from 'react';

const AssetAssignmentListPage = () => {
    const {
        component,
    } = usePage<SharedData>();
    const breadcrumbs = useBreadcrumb(component);
    const [assets, setAsssets] = useState<ResponseCollection<AssetAssignment> | undefined>(undefined);
    const { setTable, columns, tableState, tableStateServer } = useTableResolver('assets-assignment-table');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle
                    title="Asset Assignments"
                    subtitle="View and manage asset assignments within the organization."
                    actions={
                        <>
                            <Button intent="warning" leading={<PackageMinus />}>
                                Return assets
                            </Button>
                            <Button intent="success" leading={<PackagePlus />} onClick={() => router.visit(route('asset-assignment.create'))}>
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
                            setAsssets(typedData.props.assetAssignments);
                            setTable(typedData.props.table);
                        },
                    }}
                    fallback={<SkeletonDataGrid />}
                >
                    <DataGrid
                        columns={columns}
                        rows={assets?.data || []}
                        pageSizeOptions={[10, 25, 50]}
                        tableState={tableState}
                        serverSide
                        rowCount={assets?.meta?.total || 0}
                        rowId={(row) => (row.id ? row.id.toString() : '')}
                        enableRowSelection
                    />
                </WhenVisible>
            </AppContainer>
        </AppLayout>
    );
};

export default AssetAssignmentListPage;
