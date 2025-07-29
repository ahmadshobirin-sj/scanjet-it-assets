import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { AssignFormFields } from '@/pages/asset-assignment/form.schema';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AssetList from './asset-list';
import AssignmentDetails from './assignment-details';
import EmployeeInfo from './employee-info';

interface AssignmentConfirmationProps {
    data: AssignFormFields;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    employeeSelected: any;
    assetsSelected: any[];
    loading?: boolean;
    onConfirm?: () => void;
}

const AssignmentConfirmation: FC<AssignmentConfirmationProps> = ({
    data,
    employeeSelected,
    assetsSelected,
    open,
    onOpenChange,
    onConfirm,
    loading = false,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="sm:max-w-1xl max-h-[95vh] overflow-y-scroll lg:max-w-5xl xl:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="font-medium">Assignment Confirmation</DialogTitle>
                        <DialogDescription className="text-sm">
                            Please confirm the following details before proceeding with the asset assignment:
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Employee</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EmployeeInfo name={employeeSelected.name} job_title={employeeSelected.job_title} email={employeeSelected.email} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AssignmentDetails assignAt={data.assigned_at.toString()} notes={data.notes} />
                            </CardContent>
                        </Card>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            leading={<X />}
                            intent="secondary"
                            variant="fill"
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            loading={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="fill"
                            loading={loading}
                            leading={<Check />}
                            onClick={() => {
                                if (onConfirm) {
                                    onConfirm();
                                }
                            }}
                        >
                            Confirm Assignment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default AssignmentConfirmation;
