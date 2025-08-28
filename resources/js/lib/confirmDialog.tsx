// confirm-dialog.tsx
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';

type ConfirmEventProps = {
    onClose: () => void;
};

type ConfirmDialogOptions = {
    title?: string;
    description?: string | React.ReactNode;
    /** jika true, dialog auto-close setelah onConfirm sukses */
    autoCloseAfterConfirm?: boolean;
    /** onConfirm boleh sync (void) atau async (Promise<void>) */
    onConfirm: (ctx: ConfirmEventProps) => void | Promise<void>;
};

let triggerDialog: (options: ConfirmDialogOptions) => void = () => {
    throw new Error('ConfirmDialog is not mounted.');
};
export function confirmDialog(options: ConfirmDialogOptions) {
    triggerDialog(options);
}

export function ConfirmDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('Are you sure?');
    const [description, setDescription] = useState<string | React.ReactNode>('This action cannot be undone.');
    const [onConfirm, setOnConfirm] = useState<(ctx: ConfirmEventProps) => void | Promise<void>>(() => () => {});
    const [autoCloseAfterConfirm, setAutoCloseAfterConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        triggerDialog = ({ title, description, onConfirm, autoCloseAfterConfirm }) => {
            requestAnimationFrame(() => {
                if (title) setTitle(title);
                if (description) setDescription(description);
                setOnConfirm(() => onConfirm);
                setAutoCloseAfterConfirm(!!autoCloseAfterConfirm);
                setOpen(true);
            });
        };
    }, []);

    const isPromise = (v: unknown): v is Promise<unknown> => !!v && typeof (v as any).then === 'function';

    const handleConfirm = async () => {
        try {
            const result = onConfirm({ onClose: () => setOpen(false) });

            if (isPromise(result)) {
                setLoading(true);
                await result;
            }

            if (autoCloseAfterConfirm) setOpen(false);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log(title, error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <Button onClick={handleConfirm} intent="destructive" loading={loading} disabled={loading}>
                        {loading ? 'Processing...' : 'Continue'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
