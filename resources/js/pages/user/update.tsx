import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/ui/form-message'
import { GroupForm, GroupFormItem } from '@/components/ui/group-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt'
import useControlledModal from '@/hooks/use-controlled-modal'
import { User } from '@/types/model'
import { useForm } from '@inertiajs/react'
import { FormEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { toast } from 'sonner'

export type UserUpdatePageRef = {
    open: () => void
    close: () => void
    getSheetElement: () => HTMLDivElement | null
}

const UserUpdatePage = forwardRef<UserUpdatePageRef, { user: User | null, onClose?: () => void }>(({ user, onClose }, ref) => {
    const sheetRef = useRef<HTMLDivElement>(null)

    const { data, setData, put, processing, errors, reset, isDirty, setDefaults } = useForm({
        email: '',
    });

    const { open, setOpen, handleChange } = useControlledModal({
        shouldConfirmClose: () => isDirty,
        onConfirmClose: () => {
            reset()
            onClose?.()
        },
        onCloseClean: () => {
            reset()
            onClose?.()
        }
    })

    useEffect(() => {
        if (open && user) {
            handleSetDefaults({
                email: user.email,
            })
        }
    }, [open, user])


    const handleSetDefaults = (value: typeof data) => {
        setDefaults(value)
        setData(value)
    }

    useBeforeUnloadPrompt(isDirty)


    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        postData()
    }

    const onButtonSubmit = () => {
        postData()
    }

    const postData = () => {
        put(route('user.update', user?.id), {
            onSuccess: (res) => {
                reset()
                toast.success((res.props.success as any).message)
                setOpen(false)
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message, {
                        ...(errors.error ? { description: errors.error } : {}),
                    })
                }
            },
        })
    }

    useImperativeHandle(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        getSheetElement: () => sheetRef.current,
    }), [setOpen])

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetContent ref={sheetRef}>
                <SheetHeader>
                    <SheetTitle>Update user</SheetTitle>
                    <SheetDescription>
                        Update user information and roles.
                    </SheetDescription>
                </SheetHeader>
                <SheetBody className="px-4">
                    <GroupForm onSubmit={onSubmit}>
                        <GroupFormItem>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" autoComplete="off" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            {
                                errors.email && <FormMessage error>{errors.email}</FormMessage>
                            }
                        </GroupFormItem>
                        <input type="submit" hidden />
                    </GroupForm>
                </SheetBody>
                <SheetFooter>
                    <Button loading={processing} onClick={onButtonSubmit}>Save</Button>
                    <SheetClose disabled={processing} asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
})

UserUpdatePage.displayName = 'UserUpdatePage'

export default UserUpdatePage
