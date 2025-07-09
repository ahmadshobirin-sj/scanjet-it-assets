import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InfoList, InfoListContainer, InfoListContent, InfoListGroup, InfoListLabel } from '@/components/ui/info-list'
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import useControlledModal from '@/hooks/use-controlled-modal'
import { UserRoleStyle } from '@/lib/userRoleStyle'
import { User } from '@/types/model'
import { forwardRef, useImperativeHandle, useRef } from 'react'

export type UserDetailPageRef = {
    open: () => void
    close: () => void
    getSheetElement: () => HTMLDivElement | null
}

const UserDetailPage = forwardRef<UserDetailPageRef, { user: User | null, onClose?: () => void }>(({ user, onClose }, ref) => {
    const sheetRef = useRef<HTMLDivElement>(null)

    const { open, setOpen, handleChange } = useControlledModal({
        shouldConfirmClose: () => false,
        onConfirmClose: () => {
            onClose?.()
        },
        onCloseClean: () => {
            onClose?.()
        }
    })

    useImperativeHandle(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        getSheetElement: () => sheetRef.current,
    }), [setOpen])

    return (
        <Sheet onOpenChange={handleChange} open={open}>
            <SheetContent ref={sheetRef} className='w-full sm:max-w-2xl'>
                <SheetHeader>
                    <SheetTitle>Detail user</SheetTitle>
                    <SheetDescription>
                        Detail information of the user.
                    </SheetDescription>
                </SheetHeader>
                <SheetBody className="px-4 flex-1 overflow-y-auto">
                    <InfoListContainer columns={1} hasGroups>
                        <InfoListGroup title="User Information">
                            <InfoList direction="column">
                                <InfoListLabel>Email</InfoListLabel>
                                <InfoListContent>{user?.email}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Role</InfoListLabel>
                                <InfoListContent>{user?.roles && user.roles.length > 0 ? user.roles.map((role) => (
                                    <Badge key={role.id} intent={UserRoleStyle.getIntent(role.name) as any} variant="fill" size="md" className="text-xs">
                                        {role.name}
                                    </Badge>
                                )) : '-'}</InfoListContent>
                            </InfoList>
                        </InfoListGroup>
                        <InfoListGroup title="Personal Information" columns={2}>
                            <InfoList direction="column">
                                <InfoListLabel>Name</InfoListLabel>
                                <InfoListContent>{user?.name || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Given name</InfoListLabel>
                                <InfoListContent>{user?.given_name || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Surname</InfoListLabel>
                                <InfoListContent>{user?.surname || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>User principal name</InfoListLabel>
                                <InfoListContent>{user?.user_principal_name || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Business phones</InfoListLabel>
                                <InfoListContent>{user?.business_phones?.join(', ') || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Mobile phones</InfoListLabel>
                                <InfoListContent>{user?.mobile_phone || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Job title</InfoListLabel>
                                <InfoListContent>{user?.job_title || '-'}</InfoListContent>
                            </InfoList>
                            <InfoList direction="column">
                                <InfoListLabel>Office location</InfoListLabel>
                                <InfoListContent>{user?.office_location || '-'}</InfoListContent>
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
    )
})

UserDetailPage.displayName = 'UserDetailPage'

export default UserDetailPage
