import axios, { AxiosInstance, AxiosProgressEvent, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import qs from 'qs';

export type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string | null;
    size: number;
    human_readable_size: string;
    url: string;
    thumb_url: string | null;
    created_at: string | null;
    collection: string;
    model_type: string;
    model_id: string; // UUID
    custom_properties?: Record<string, any>;
};

export type LibraryMeta = {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
};

export type LibraryResponse = { data: MediaItem[]; meta: LibraryMeta };

export type UploadManyResult = {
    uploaded: MediaItem[];
    count: number;
    skipped: { name: string; reason: string; message?: string }[];
    skipped_count: number;
};

export type BuildFilterParams = {
    search?: string;
    mime_prefix?: string;
    collection?: string;
    sort?: string; // e.g. "-id,name,size,created_at"
    page?: number;
    per_page?: number;
};

export class MediaLibraryApi {
    private http: AxiosInstance;

    constructor(opts?: Omit<CreateAxiosDefaults, 'paramsSerializer'>) {
        this.http = axios.create({
            ...opts,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    arrayFormat: 'indices',
                    encode: true,
                    skipNulls: true,
                }),
        });
    }

    // helper to build ?filter[...] with qs
    private buildFilterQuery(p?: BuildFilterParams) {
        const filter: Record<string, any> = {};
        if (p?.search) filter.search = p.search;
        if (p?.mime_prefix) filter.mime_prefix = p.mime_prefix;
        if (p?.collection) filter.collection = p.collection;

        const q: any = {};
        if (Object.keys(filter).length) q.filter = filter;
        if (p?.sort) q.sort = p.sort;
        if (p?.page) q.page = p.page;
        if (p?.per_page) q.per_page = p.per_page;
        return q;
    }

    async listLibrary(p?: BuildFilterParams): Promise<LibraryResponse> {
        const params = this.buildFilterQuery(p);
        const { data } = await this.http.get<LibraryResponse>('/', { params });
        return data;
    }

    async uploadSingle(file: File, collection = 'default', onProgress?: (pe: AxiosProgressEvent) => void): Promise<MediaItem> {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('collection', collection);
        const cfg: AxiosRequestConfig = { onUploadProgress: onProgress };
        const { data } = await this.http.post<MediaItem>('/upload', fd, cfg);
        return data;
    }

    async uploadMany(files: File[], collection = 'default', onProgress?: (pe: AxiosProgressEvent) => void): Promise<UploadManyResult> {
        const fd = new FormData();
        files.forEach((f) => fd.append('files[]', f));
        fd.append('collection', collection);
        const cfg: AxiosRequestConfig = { onUploadProgress: onProgress };
        const { data } = await this.http.post<UploadManyResult>('/upload', fd, cfg);
        return data;
    }

    async deleteMedia(mediaId: number | string): Promise<{ deleted: boolean }> {
        const { data } = await this.http.delete<{ deleted: boolean }>(`/${mediaId}`);
        return data;
    }

    async bulkDelete(ids: Array<number>): Promise<{ deleted: number }> {
        const { data } = await this.http.post<{ deleted: number }>('/bulk-delete', { ids });
        return data;
    }

    // link/unlink/list-linked
    async link(target_type: string, target_id: string, media_ids: number[]): Promise<{ linked: number }> {
        const { data } = await this.http.post<{ linked: number }>('/links', { target_type, target_id, media_ids });
        return data;
    }
    async unlink(target_type: string, target_id: string, media_ids: number[]): Promise<{ unlinked: number }> {
        const { data } = await this.http.delete<{ unlinked: number }>('/links', { data: { target_type, target_id, media_ids } });
        return data;
    }
    async listLinked(typeKeyOrFqcn: string, id: string, p?: { collection?: string }): Promise<{ data: MediaItem[] }> {
        const { data } = await this.http.get<{ data: MediaItem[] }>(`/links/${typeKeyOrFqcn}/${id}`, {
            params: p?.collection ? { collection: p.collection } : undefined,
        });
        return data;
    }
}
