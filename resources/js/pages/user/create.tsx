import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
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
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import useControlledModal from '@/hooks/use-controlled-modal';
import { UserRoleStyle } from '@/lib/userRoleStyle';
import { SharedData } from '@/types';
import { ResponseCollection, Role } from '@/types/model';
import { useForm, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEvent, useMemo } from 'react';
import { toast } from 'sonner';

const UserCreatePage = () => {
    const {
        props: { roles },
    } = usePage<SharedData & { roles: ResponseCollection<Role> }>();

    const { data, setData, post, processing, errors, reset, isDirty, transform } = useForm<{ email: string; roles: Option[] }>({
        email: '',
        roles: [],
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
        transform((data) => ({
            ...data,
            roles: data.roles.map((role) => role.value),
        }));
        post('/user/create', {
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

    const rolesOptions: Option[] = useMemo(() => {
        return roles.data.map((role) => ({
            label: role.name,
            value: role.id,
            badgeColor: UserRoleStyle.getIntent(role.name),
        }));
    }, [roles.data]);

    const handleChangeRoles = (values: Option[]) => {
        setData('roles', values);
    };

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('email', e.target.value);
    };

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetTrigger asChild>
                <Button variant="fill" leading={<Plus />} onClick={() => setOpen(true)}>
                    New user
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>New user</SheetTitle>
                    <SheetDescription>Create a new user by providing their email address.</SheetDescription>
                </SheetHeader>
                <SheetBody className="px-4">
                    <GroupForm onSubmit={onSubmit}>
                        <GroupFormItem>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" autoComplete="off" value={data.email} onChange={handleChangeEmail} />
                            {errors.email && <FormMessage error>{errors.email}</FormMessage>}
                        </GroupFormItem>
                        <GroupFormItem>
                            <Label htmlFor="roles">Roles</Label>
                            <MultipleSelector options={rolesOptions} onChange={handleChangeRoles} />
                            {errors.roles && <FormMessage error>{errors.roles}</FormMessage>}
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
};

export default UserCreatePage;
