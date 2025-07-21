import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { GroupForm, GroupFormItem } from '@/components/ui/group-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt';
import useControlledModal from '@/hooks/use-controlled-modal';
import { UserRoleStyle } from '@/lib/userRoleStyle';
import { SharedData } from '@/types';
import { ResponseCollection, Role, User } from '@/types/model';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { toast } from 'sonner';

export type UserUpdatePageRef = {
    open: () => void;
    close: () => void;
    getSheetElement: () => HTMLDivElement | null;
};

const UserUpdatePage = forwardRef<UserUpdatePageRef, { user: User | null; onClose?: () => void }>(({ user, onClose }, ref) => {
    const {
        props: { roles },
    } = usePage<SharedData & { roles: ResponseCollection<Role> }>();
    const sheetRef = useRef<HTMLDivElement>(null);
    const { data, setData, put, processing, errors, reset, isDirty, setDefaults, transform } = useForm<{ email: string; roles: Option[] }>({
        email: '',
        roles: [],
    });

    const rolesOptions: Option[] = useMemo(() => {
        return roles.data.map((role) => ({
            label: role.name,
            value: role.id,
            badgeColor: UserRoleStyle.getIntent(role.name),
        }));
    }, [roles.data]);

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
        if (open && user) {
            const values: typeof data = {
                email: user.email,
                roles: rolesOptions.filter((option) => user.roles.some((role) => role.id === option.value)),
            };
            setDefaults(values);
            setData(values);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

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
        put(route('user.update', user?.id), {
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

    const handleChangeRoles = (values: Option[]) => {
        setData('roles', values);
    };

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('email', e.target.value);
    };

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetContent ref={sheetRef}>
                <SheetHeader>
                    <SheetTitle>Update user</SheetTitle>
                    <SheetDescription>Update user information and roles.</SheetDescription>
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
                            <MultipleSelector value={data.roles} options={rolesOptions} onChange={handleChangeRoles} />
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
});

UserUpdatePage.displayName = 'UserUpdatePage';

export default UserUpdatePage;
