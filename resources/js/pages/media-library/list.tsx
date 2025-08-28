import AppContainer from '@/components/app-container';
import AppTitle from '@/components/app-title';
import { MediaLibrary } from '@/components/media-library';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { mediaLibraryApi } from '@/lib/api';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const MediaLibraryPage = () => {
    const { component } = usePage<SharedData>();
    const breadcrumbs = useBreadcrumb(component);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <AppContainer className="space-y-6">
                <AppTitle title="Media Library" subtitle="Manage and organize all your uploaded media in one place" />

                <MediaLibrary api={mediaLibraryApi} />
            </AppContainer>
        </AppLayout>
    );
};

export default MediaLibraryPage;
