import { usePermission } from '@/hooks/use-permissions';
import { forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent } from '../ui/tabs';
import MediaLibraryLibrary from './media-library-library';
import type { MediaLibraryProviderProps, MediaLibraryRef } from './media-library-provider';
import { MediaLibraryProvider, useMediaLibrary } from './media-library-provider';
import { MediaLibraryTabs } from './media-library-tabs';
import { MediaLibraryUploads } from './media-library-uploads';

type MediaLibraryProps = Pick<MediaLibraryProviderProps, 'api'>;

export const MediaLibrary = forwardRef<MediaLibraryRef, MediaLibraryProps>(function MediaLibrary(props, ref) {
    return (
        <MediaLibraryProvider {...props}>
            <MediaLibraryRoot ref={ref} />
        </MediaLibraryProvider>
    );
});

const MediaLibraryRoot = forwardRef<MediaLibraryRef>(function MediaLibraryRoot(_, ref) {
    const { can } = usePermission();
    const { tabs, handleTabsChange, selection, items } = useMediaLibrary();

    const getSelectionItems = () => {
        const ids = Array.from(selection.selected) as number[];
        return items.filter((it) => ids.includes(it.id));
    };

    useImperativeHandle(
        ref,
        () => ({
            getSelection: getSelectionItems,
        }),
        [selection.selected, items],
    );

    return (
        <Tabs defaultValue={tabs} onValueChange={(v) => handleTabsChange(v as any)}>
            <MediaLibraryTabs />
            <div className="my-4">
                {can('media_library.viewAny') && (
                    <TabsContent value="library">
                        <MediaLibraryLibrary />
                    </TabsContent>
                )}
                {can('media_library.create') && (
                    <TabsContent value="uploads">
                        <MediaLibraryUploads />
                    </TabsContent>
                )}
            </div>
        </Tabs>
    );
});
