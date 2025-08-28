import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { getFileIcon } from './helpers/getFileIcon';
import { MediaItem } from './helpers/mediaLibraryApi';

export const MediaLibraryInputItem = ({ file, onDelete }: { file: MediaItem; onDelete?: () => void }) => {
    return (
        <div className="group flex w-full flex-row items-center overflow-hidden rounded-md border text-left">
            <div className="relative flex items-center justify-center bg-warning p-2 text-center">
                <span className="text-warning-foreground [&>svg]:size-4">{getFileIcon(file)}</span>
            </div>
            <div className="w-full overflow-hidden px-2 py-1">
                <p className="truncate text-sm" title={file.file_name}>
                    {file.file_name}
                </p>
            </div>
            {onDelete && (
                <div className="pr-1">
                    <Button size="icon" variant="ghost" intent="secondary" onClick={onDelete}>
                        <XIcon />
                    </Button>
                </div>
            )}
        </div>
    );
};
