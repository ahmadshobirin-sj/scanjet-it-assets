import { usePermission } from '@/hooks/use-permissions';
import { ExternalLinkIcon } from 'lucide-react';
import { FC } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { getFileIcon } from './helpers/getFileIcon';
import { MediaItem } from './helpers/mediaLibraryApi';
import { useMediaLibrary } from './media-library-provider';

interface MediaLibraryItemProps {
    file: MediaItem;
}

export const MediaLibraryItem: FC<MediaLibraryItemProps> = ({ file }) => {
    const { selection } = useMediaLibrary();
    const { can } = usePermission();
    return (
        <div className="group flex w-full max-w-36 min-w-32 flex-col overflow-hidden rounded-md border text-left">
            <div className="relative flex items-center justify-center bg-warning p-3 text-center">
                <span className="text-warning-foreground [&>svg]:size-20">{getFileIcon(file)}</span>
                <Checkbox
                    className="absolute top-2 left-2"
                    checked={selection.isRowSelected(file.id)}
                    onCheckedChange={() => selection.toggleRow(file.id)}
                />
                {can(['media_library.view', 'media_library.delete', 'media_library.update']) && (
                    <Button size="icon" className="absolute top-2 right-2 hidden md:group-hover:flex md:group-focus:flex">
                        <ExternalLinkIcon />
                    </Button>
                )}
            </div>
            <div className="space-y-1 px-2 py-1">
                <Badge size="sm">{file.human_readable_size}</Badge>
                <p className="text-sm break-words" title={file.file_name}>
                    {file.file_name}
                </p>
            </div>
        </div>
    );
};

export const MediaLibraryItemSkeleton = () => {
    return (
        <div className="flex w-36 flex-col space-y-3 overflow-hidden rounded-md border">
            <div>
                <Skeleton className="h-28 w-full rounded-none" />
            </div>
            <div className="space-y-2 p-2">
                <Skeleton className="h-4 w-5/12" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
};
