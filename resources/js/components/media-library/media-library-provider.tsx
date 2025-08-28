import { usePagination } from '@/hooks/use-pagination';
import { useRowSelection } from '@/hooks/use-row-selection';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AppToast from '../toast';
import type { MediaItem, MediaLibraryApi } from './helpers/mediaLibraryApi';
import { LibraryMeta } from './helpers/mediaLibraryApi';

type ViewMode = 'grid' | 'list';

export type TabsListMode = 'library' | 'uploads';

type Errors = string | string[] | Record<string, string> | Record<string, string>[] | null;

export type MediaLibraryRef = {
    getSelection: () => MediaItem[]; // ambil item terpilih (lintas halaman)
};

type Ctx = {
    // data
    items: MediaItem[];
    meta: LibraryMeta | null;
    isLoading: boolean;
    isUploadLoading: boolean;
    isBulkDeleteLoading: boolean;
    view: ViewMode;
    onSearch: (value: string) => void;
    selection: ReturnType<typeof useRowSelection<number>>;
    allChecked: boolean;
    indeterminate: boolean;
    pageIds: number[];
    pagination: ReturnType<typeof usePagination>;

    // ui
    tabs: TabsListMode;

    // filters
    search: string;
    page: number;
    perPage: number;

    // actions
    handleTabsChange: (value: TabsListMode) => void;
    setPage: Dispatch<SetStateAction<number>>;
    setPerPage: Dispatch<SetStateAction<number>>;
    refreshData: () => void;
    handleSetErrors: (errors: Errors) => void;
    handleSetUploadErrors: (errors: Errors) => void;
    handleSetIsUploadLoading: (value: boolean) => void;
    handleSetIsLoading: (value: boolean) => void;
    handleSetIsBulkDeleteLoading: (value: boolean) => void;

    api: MediaLibraryApi;
    errors: Errors;
    uploadErrors: Errors;
    hasError: boolean;
    hasUploadError: boolean;
};

const MediaLibraryContext = createContext<Ctx | null>(null);
export const useMediaLibrary = () => {
    const ctx = useContext(MediaLibraryContext);
    if (!ctx) throw new Error('useMediaLibrary must be used inside MediaLibraryProvider');
    return ctx;
};

export interface MediaLibraryProviderProps extends Pick<Ctx, 'api'> {
    children: ReactNode;
}

export const perPageOptions = [5, 10, 15, 25, 50, 100];
export const maxFileSize = 10 * 1024 * 1024; // 10 MB
export const maxFiles = 5;

export const MediaLibraryProvider: FC<MediaLibraryProviderProps> = ({ children, api }) => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [meta, setMeta] = useState<LibraryMeta | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tabs, setTabs] = useState<TabsListMode>('library');
    const [errors, setErrors] = useState<Errors>(null);
    const [uploadErrors, setUploadErrors] = useState<Errors>(null);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(perPageOptions[0]);
    const [search, setSearch] = useState<string>('');
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [isBulkDeleteLoading, setIsBulkDelete] = useState(false);

    const selection = useRowSelection<number>();
    const pageIds = useMemo(() => items.map((p) => p.id), [items]);
    const allChecked = selection.areAllSelectedOnPage(pageIds);
    const indeterminate = selection.isIndeterminateOnPage(pageIds);

    const pagination = usePagination({
        total: meta?.total || 0,
        onChange: setPage,
        value: page,
        pageSize: perPage,
        disabled: isLoading,
        siblingCount: 1,
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.listLibrary({
                page: page,
                per_page: perPage,
                search: search,
            });
            setItems(res.data);
            setMeta(res.meta);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.log('Failed to get media library!', error);
            }
            AppToast({
                message: 'Failed to get data!',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [page, perPage, search]);

    const handleTabsChange = useCallback((value: TabsListMode) => {
        setTabs(value);
        setUploadErrors(null);
        setErrors(null);
    }, []);

    const handleSetErrors = (errors: Errors) => {
        setErrors(errors);
    };

    const handleSetUploadErrors = (errors: Errors) => {
        setUploadErrors(errors);
    };

    const hasError = useMemo(() => {
        if (!errors) return false; // null case

        if (typeof errors === 'string') {
            return errors.trim().length > 0;
        }

        if (Array.isArray(errors)) {
            return errors.length > 0;
        }

        if (typeof errors === 'object') {
            return Object.keys(errors).length > 0;
        }

        return false;
    }, [errors]);

    const hasUploadError = useMemo(() => {
        if (!uploadErrors) return false; // null case

        if (typeof uploadErrors === 'string') {
            return uploadErrors.trim().length > 0;
        }

        if (Array.isArray(uploadErrors)) {
            return uploadErrors.length > 0;
        }

        if (typeof uploadErrors === 'object') {
            return Object.keys(uploadErrors).length > 0;
        }

        return false;
    }, [uploadErrors]);

    const refreshData = useCallback(() => {
        fetchData();
    }, [page, perPage, search]);

    const onSearch = useCallback((value: string) => {
        setSearch(value);
    }, []);

    const handleSetIsUploadLoading = useCallback((value: boolean) => {
        setIsUploadLoading(value);
    }, []);

    const handleSetIsLoading = useCallback((value: boolean) => {
        setIsLoading(value);
    }, []);

    const handleSetIsBulkDeleteLoading = useCallback((value: boolean) => {
        setIsBulkDelete(value);
    }, []);

    return (
        <MediaLibraryContext.Provider
            value={{
                // Data
                items,
                meta,
                pagination,
                isLoading,
                isUploadLoading,
                view: 'grid',
                page,
                perPage,
                search,
                allChecked,
                indeterminate,
                tabs,
                handleTabsChange,
                setPage,
                setPerPage,
                onSearch,
                api,
                errors,
                uploadErrors,
                handleSetErrors,
                handleSetUploadErrors,
                hasError,
                hasUploadError,
                refreshData,
                selection,
                pageIds,
                handleSetIsUploadLoading,
                handleSetIsLoading,
                isBulkDeleteLoading,
                handleSetIsBulkDeleteLoading,
            }}
        >
            {children}
        </MediaLibraryContext.Provider>
    );
};
