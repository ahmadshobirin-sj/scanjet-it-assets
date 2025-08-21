// hooks/use-controlled-modal.ts
import { useState } from 'react';

type Opts = {
    shouldConfirmClose: () => boolean;
    onConfirmClose?: () => void; // dipanggil ketika user konfirmasi menutup (dirty)
    onCloseClean?: () => void;   // dipanggil saat close biasa / dipaksa (non-confirm)
};

const useControlledModal = ({ shouldConfirmClose, onConfirmClose, onCloseClean }: Opts) => {
    const [open, setOpen] = useState(false);

    const handleChange = (nextOpen: boolean, opts?: { force?: boolean }) => {
        if (!nextOpen && !opts?.force && shouldConfirmClose()) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
            if (!confirmed) return; // tetap open
            // confirmed
            onConfirmClose?.();      // 1) cleanup dulu
            setOpen(false);          // 2) baru tutup
            return;
        }

        if (!nextOpen) {
            onCloseClean?.();        // 1) cleanup dulu
        }
        setOpen(nextOpen);         // 2) set open
    };

    return { open, setOpen, handleChange };
};

export default useControlledModal;
