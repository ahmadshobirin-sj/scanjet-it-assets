import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { MediaItem } from './helpers/mediaLibraryApi';
import { MediaLibrary } from './media-library';
import { MediaLibraryInputItem } from './media-library-input-item';
import { MediaLibraryProviderProps, MediaLibraryRef } from './media-library-provider';

type MediaLibraryInput = Pick<MediaLibraryProviderProps, 'api'> & {
    value?: MediaItem[] | [];
    onChange?: (v: MediaItem[] | []) => void;
    onDelete?: (v: MediaItem['id']) => void;
};

export function MediaLibraryInput({ api, onChange, onDelete, value = [] }: MediaLibraryInput) {
    const ref = useRef<MediaLibraryRef>(null);
    const [open, setOpen] = useState(false);

    const handleChoose = useCallback(() => {
        const picked = ref.current?.getSelection() ?? [];
        onChange?.(picked);
        setOpen(false);
    }, []);

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" intent="secondary" onClick={() => setOpen(true)}>
                        <FolderDown /> Choose File
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[95vh] overflow-y-auto lg:max-w-screen-lg">
                    <DialogHeader>
                        <DialogTitle>Media Library</DialogTitle>
                        <DialogDescription>Manage and organize all your uploaded media in one place</DialogDescription>
                    </DialogHeader>

                    <MediaLibrary ref={ref} api={api} />

                    <DialogFooter>
                        <Button intent="secondary" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleChoose}>
                            Choose File
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {value.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {value.map((item, index) => (
                        <MediaLibraryInputItem file={item} key={index} onDelete={() => onDelete?.(item.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
