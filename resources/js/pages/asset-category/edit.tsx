import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import useControlledModal from '@/hooks/use-controlled-modal';
import { AssetCategory } from '@/types/model';
import { useForm } from '@inertiajs/react';
import { FormEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { toast } from 'sonner';

export type AssetCategoryUpdatePageRef = {
    open: () => void;
    close: () => void;
    getSheetElement: () => HTMLDivElement | null;
};

const AssetCategoryUpdatePage = forwardRef<AssetCategoryUpdatePageRef, { assetCategory: AssetCategory | null; onClose?: () => void }>(
    ({ assetCategory, onClose }, ref) => {
        const sheetRef = useRef<HTMLDivElement>(null);
        const { data, setData, put, processing, errors, reset, isDirty, setDefaults } = useForm<{ name: string; description?: string }>({
            name: '',
            description: '',
        });

        const { open, setOpen, handleChange } = useControlledModal({
            shouldConfirmClose: () => isDirty,
            onConfirmClose: () => {
                reset();
                onClose?.();
            },
            onCloseClean: () => {
                reset();
                onClose?.();
            },
        });

        useEffect(() => {
            if (!open || !assetCategory) return;

            const value: typeof data = {
                name: assetCategory.name,
                description: assetCategory.description || '',
            };

            setDefaults(value);
            setData(value);

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [open, assetCategory]);

        useBeforeUnloadPrompt(isDirty);

        const onSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            postData();
        };

        const onButtonSubmit = () => {
            postData();
        };

        const postData = () => {
            put(route('asset_category.update', assetCategory?.id), {
                onSuccess: (res) => {
                    reset();
                    toast.success((res.props.success as any).message);
                    setOpen(false);
                },
                onError: (errors) => {
                    if (errors.message) {
                        toast.error(errors.message, {
                            ...(errors.error ? { description: errors.error } : {}),
                        });
                    }
                },
            });
        };

        useImperativeHandle(
            ref,
            () => ({
                open: () => setOpen(true),
                close: () => setOpen(false),
                getSheetElement: () => sheetRef.current,
            }),
            [setOpen],
        );

        const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
            setData('name', e.target.value);
        };

        const handleChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setData('description', e.target.value);
        };

        return (
            <Sheet onOpenChange={handleChange} open={open}>
                <SheetContent ref={sheetRef}>
                    <SheetHeader>
                        <SheetTitle>Update asset category</SheetTitle>
                        <SheetDescription>Update asset category details.</SheetDescription>
                    </SheetHeader>
                    <SheetBody className="px-4">
                        <GroupForm onSubmit={onSubmit}>
                            <GroupFormItem>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" autoComplete="off" value={data.name} onChange={handleChangeName} />
                                {errors.name && <FormMessage error>{errors.name}</FormMessage>}
                            </GroupFormItem>
                            <GroupFormItem>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" autoComplete="off" value={data.description} onChange={handleChangeDescription} />
                                {errors.description && <FormMessage error>{errors.description}</FormMessage>}
                            </GroupFormItem>
                            <input type="submit" hidden />
                        </GroupForm>
                    </SheetBody>
                    <SheetFooter>
                        <Button loading={processing} onClick={onButtonSubmit}>
                            Save
                        </Button>
                        <SheetClose disabled={processing} asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );
    },
);

AssetCategoryUpdatePage.displayName = 'AssetCategoryUpdatePage';

export default AssetCategoryUpdatePage;
