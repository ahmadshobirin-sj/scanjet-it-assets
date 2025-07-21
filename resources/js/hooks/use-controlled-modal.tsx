import { useState } from 'react';

const useControlledModal = ({
    shouldConfirmClose,
    onConfirmClose,
    onCloseClean,
}: {
    shouldConfirmClose: () => boolean;
    onConfirmClose?: () => void;
    onCloseClean?: () => void;
}) => {
    const [open, setOpen] = useState(false);

    const handleChange = (nextOpen: boolean) => {
        if (!nextOpen && shouldConfirmClose()) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
            if (confirmed) {
                setOpen(false);
                onConfirmClose?.();
            }
        } else {
            setOpen(nextOpen);
            if (!nextOpen) onCloseClean?.();
        }
    };

    return {
        open,
        setOpen,
        handleChange,
    };
};

export default useControlledModal;
