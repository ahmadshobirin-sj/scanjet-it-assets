import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

type ConfirmEventProps = {
    onClose: () => void
}

type ConfirmDialogOptions = {
    title?: string
    description?: string | React.ReactNode
    autoCloseAfterConfirm?: boolean
    onConfirm: (props: ConfirmEventProps) => void
}

let triggerDialog: (options: ConfirmDialogOptions) => void = () => {
    throw new Error('ConfirmDialog is not mounted.')
}

export function confirmDialog(options: ConfirmDialogOptions) {
    triggerDialog(options)
}

export function ConfirmDialog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('Are you sure?')
    const [description, setDescription] = useState<string | React.ReactNode>('This action cannot be undone.')
    const [onConfirm, setOnConfirm] = useState<(props: ConfirmEventProps) => void>(() => { })
    const [autoCloseAfterConfirm, setAutoCloseAfterConfirm] = useState(false)

    useEffect(() => {
        triggerDialog = ({ title, description, onConfirm, autoCloseAfterConfirm }) => {
            requestAnimationFrame(() => {
                if (title) setTitle(title)
                if (description) setDescription(description)
                setOnConfirm(() => onConfirm)
                setOpen(true)
                setAutoCloseAfterConfirm(autoCloseAfterConfirm || false)
            })
        }
    }, [])

    const handleConfirm = () => {
        onConfirm({ onClose: () => setOpen(false) })
        if (autoCloseAfterConfirm) {
            setOpen(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleConfirm} intent="destructive">Continue</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
