import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SquareLibraryIcon, UploadIcon } from 'lucide-react';

export const MediaLibraryTabs = () => {
    return (
        <TabsList>
            <TabsTrigger value="library">
                <SquareLibraryIcon />
                Library
            </TabsTrigger>
            <TabsTrigger value="uploads">
                <UploadIcon />
                Uploads
            </TabsTrigger>
        </TabsList>
    );
};
