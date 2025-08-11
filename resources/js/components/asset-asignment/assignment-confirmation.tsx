import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { AssignFormFields, ReturnFormFields } from '@/pages/asset-assignment/form.schema';
import { AssetAssignedUser } from '@/types/model';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import { FC, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AssetList from './asset-list';
import AssignmentDetails from './assignment-details';
import EmployeeInfo from './employee-info';

interface AssignmentConfirmationProps {
    data: AssignFormFields | ReturnFormFields;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    employeeSelected: Partial<AssetAssignedUser>;
    assetsSelected: any[];
    loading?: boolean;
    onConfirm?: () => void;
    type: 'assign' | 'return';
}

const AssignmentConfirmation: FC<AssignmentConfirmationProps> = ({
    data,
    employeeSelected,
    assetsSelected,
    open,
    onOpenChange,
    onConfirm,
    loading = false,
    type,
}) => {
    const isAssign = useMemo(() => type === 'assign', [type]);

    const getCondition = useCallback(
        (id: string) => {
            if (isAssign) return undefined;
            const asset = (data as ReturnFormFields).assets.find((asset) => asset.asset_id === id);
            return asset ? asset.condition : undefined;
        },
        [data, isAssign],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="sm:max-w-1xl max-h-[95vh] overflow-y-scroll lg:max-w-5xl xl:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="font-medium">{isAssign ? 'Confirm Asset Assignment' : 'Confirm Asset Return'}</DialogTitle>
                        <DialogDescription className="text-sm">
                            Please confirm the following details before proceeding with this action:
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{isAssign ? 'Assigned Employee' : 'Returning Employee'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EmployeeInfo
                                    name={employeeSelected.name}
                                    job_title={employeeSelected.job_title}
                                    email={employeeSelected.email}
                                    office_location={employeeSelected.office_location}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{isAssign ? 'Assigned Assets' : 'Returned Assets'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {assetsSelected.map((asset) => (
                                        <AssetList
                                            bordered
                                            key={asset.value}
                                            name={asset.label}
                                            manufactureName={asset.manufacture?.name}
                                            serialNumber={asset.serial_number}
                                            assetTag={asset.asset_tag}
                                            categoryName={asset.category?.name}
                                            {...{
                                                showCondition: !isAssign,
                                                condition: getCondition(asset.value),
                                            }}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{isAssign ? 'Assignment Details' : 'Return Details'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isAssign ? (
                                    <AssignmentDetails assignAt={(data as AssignFormFields).assigned_at.toString()} notes={data.notes} />
                                ) : (
                                    <AssignmentDetails returnAt={(data as ReturnFormFields).returned_at.toString()} notes={data.notes} />
                                )}
                            </CardContent>
                        </Card>
                    </DialogBody>
                    <DialogFooter>
                        <Button leading={<X />} intent="secondary" variant="fill" onClick={() => onOpenChange(false)} loading={loading}>
                            Cancel
                        </Button>
                        <Button variant="fill" loading={loading} leading={<Check />} onClick={onConfirm}>
                            {isAssign ? 'Confirm Assignment' : 'Confirm Return'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default AssignmentConfirmation;
