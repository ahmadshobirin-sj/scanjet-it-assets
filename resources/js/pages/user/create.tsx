import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/ui/form-message'
import { GroupForm, GroupFormItem } from '@/components/ui/group-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useBeforeUnloadPrompt } from '@/hooks/use-before-unload-prompt'
import useControlledModal from '@/hooks/use-controlled-modal'
import { useForm } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'


const UserCreatePage = () => {
    const { data, setData, post, processing, errors, reset, isDirty } = useForm({
        email: '',
        roles: []
    });

    const { open, setOpen, handleChange } = useControlledModal({
        shouldConfirmClose: () => isDirty,
        onConfirmClose: reset,
        onCloseClean: reset
    })

    useBeforeUnloadPrompt(isDirty)


    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        postData()
    }

    const onButtonSubmit = () => {
        postData()
    }

    const postData = () => {
        post('/user/create', {
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

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetTrigger asChild>
                <Button variant="fill" leading={<Plus />} onClick={() => setOpen(true)}>New user</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>New user</SheetTitle>
                    <SheetDescription>
                        Create a new user by providing their email address.
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
}

export default UserCreatePage
