import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetBody,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import useControlledModal from '@/hooks/use-controlled-modal';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEvent } from 'react';

const AssetCategoryCreatePage = () => {
    const { data, setData, post, processing, errors, reset, isDirty } = useForm<{ name: string; description: string }>({
        name: '',
        description: '',
    });

    const { open, setOpen, handleChange } = useControlledModal({
        shouldConfirmClose: () => isDirty,
        onConfirmClose: reset,
        onCloseClean: reset,
    });

    useBeforeUnloadPrompt(isDirty);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        postData();
    };

    const onButtonSubmit = () => {
        postData();
    };

    const postData = () => {
        post(route('asset_category.store'), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('name', e.target.value);
    };

    const handleChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('description', e.target.value);
    };

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetTrigger asChild>
                <Button variant="fill" leading={<Plus />} onClick={() => setOpen(true)}>
                    New asset category
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>New asset category</SheetTitle>
                    <SheetDescription>Create a new asset category to organize your assets effectively.</SheetDescription>
                </SheetHeader>
                <SheetBody className="px-4">
                    <form onSubmit={onSubmit}>
                        <GroupForm>
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
                    </form>
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
};

export default AssetCategoryCreatePage;
