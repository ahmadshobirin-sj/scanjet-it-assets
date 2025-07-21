import { Button } from '@/components/ui/button';
import { InfoList, InfoListContainer, InfoListContent, InfoListGroup, InfoListLabel } from '@/components/ui/info-list';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import useControlledModal from '@/hooks/use-controlled-modal';
import { AssetCategory } from '@/types/model';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export type AssetCategoryDetailPageRef = {
    open: () => void;
    close: () => void;
    getSheetElement: () => HTMLDivElement | null;
};

const AssetCategoryDetailPage = forwardRef<AssetCategoryDetailPageRef, { assetCategory: AssetCategory | null; onClose?: () => void }>(
    ({ assetCategory, onClose }, ref) => {
        const sheetRef = useRef<HTMLDivElement>(null);

        const { open, setOpen, handleChange } = useControlledModal({
            shouldConfirmClose: () => false,
            onConfirmClose: () => {
                onClose?.();
            },
            onCloseClean: () => {
                onClose?.();
            },
        });

        useImperativeHandle(
            ref,
            () => ({
                open: () => setOpen(true),
                close: () => setOpen(false),
                getSheetElement: () => sheetRef.current,
            }),
            [setOpen],
        );

        return (
            <Sheet onOpenChange={handleChange} open={open}>
                <SheetContent ref={sheetRef}>
                    <SheetHeader>
                        <SheetTitle>Detail asset category</SheetTitle>
                        <SheetDescription>View the details of the asset category.</SheetDescription>
                    </SheetHeader>
                    <SheetBody className="px-4">
                        <InfoListContainer>
                            <InfoListGroup title="Asset Category Information">
                                <InfoList direction="column">
                                    <InfoListLabel>Name</InfoListLabel>
                                    <InfoListContent>{assetCategory?.name || '-'}</InfoListContent>
                                </InfoList>
                                <InfoList direction="column">
                                    <InfoListLabel>Description</InfoListLabel>
                                    <InfoListContent>{assetCategory?.description || '-'}</InfoListContent>
                                </InfoList>
                            </InfoListGroup>
                        </InfoListContainer>
                    </SheetBody>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );
    },
);

AssetCategoryDetailPage.displayName = 'AssetCategoryDetailPage';

export default AssetCategoryDetailPage;
