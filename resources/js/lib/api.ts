import { MediaLibraryApi } from '@/components/media-library/helpers/mediaLibraryApi';

export const mediaLibraryApi = new MediaLibraryApi({
    baseURL: '/api/media-library',
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});
