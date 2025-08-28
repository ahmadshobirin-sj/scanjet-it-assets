'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, CloudUpload, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAxiosProgress } from '@/hooks/use-axios-progress';
import { formatBytes } from '@/lib/utils';
import AppToast from '../toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { UploadManyResult } from './helpers/mediaLibraryApi';
import { maxFiles, maxFileSize, useMediaLibrary } from './media-library-provider';

const _formatFileSize = formatBytes(maxFileSize);
const formSchema = z.object({
    files: z
        .array(z.custom<File>())
        .min(1, 'Please select at least one file')
        .max(maxFiles, `Please select up to ${maxFiles} files`)
        .refine((files) => files.every((file) => file.size <= maxFileSize), {
            message: `File size must be less than ${_formatFileSize}`,
            path: ['files'],
        }),
});

type FormValues = z.infer<typeof formSchema>;

export function MediaLibraryUploads() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            files: [],
        },
    });
    const { api, handleSetUploadErrors, uploadErrors, hasUploadError, refreshData, isUploadLoading, handleSetIsUploadLoading } = useMediaLibrary();
    const { progress, onProgress, reset } = useAxiosProgress();
    const [resTemp, setResTemp] = React.useState<UploadManyResult>();

    const onSubmit = React.useCallback(async (data: FormValues) => {
        setResTemp(undefined);
        try {
            handleSetIsUploadLoading(true);
            const res = await api.uploadMany(data.files, 'default', onProgress);
            AppToast({
                intent: 'success',
                message: 'Upload complete',
                description: 'Your file has been uploaded and is now available in the media library.',
            });
            setResTemp(res);
            form.reset();
            form.clearErrors();
        } catch (error: any) {
            if (error.response?.data) {
                AppToast({
                    intent: 'destructive',
                    message: 'Faile to upload',
                    description: error.response.data.message || 'Upload failed due to server error.',
                });
                if (error.response.data.type === 'ValidationException') {
                    handleSetUploadErrors(error.response.data.errors);
                }
            } else if (error.request) {
                AppToast({
                    intent: 'destructive',
                    message: 'Faile to upload',
                    description: 'No response from server, please try again later.',
                });
            } else {
                AppToast({
                    intent: 'destructive',
                    message: 'Faile to upload',
                    description: error.message || 'An unexpected error occurred.',
                });
            }
        } finally {
            reset();
            handleSetIsUploadLoading(false);
            refreshData();
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Uploads</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    {hasUploadError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircleIcon />
                            <AlertTitle>You have some errors!</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc">
                                    {(() => {
                                        if (!uploadErrors) return null;

                                        // case: string
                                        if (typeof uploadErrors === 'string') {
                                            return <li>{uploadErrors}</li>;
                                        }

                                        // case: string[]
                                        if (Array.isArray(uploadErrors) && typeof uploadErrors[0] === 'string') {
                                            return (uploadErrors as string[]).map((msg, idx) => <li key={idx}>{msg}</li>);
                                        }

                                        // case: Record<string, string>
                                        if (!Array.isArray(uploadErrors) && typeof uploadErrors === 'object') {
                                            return Object.entries(uploadErrors).map(([field, msg], idx) => (
                                                <li key={`${field}-${idx}`}>
                                                    <strong>{field}</strong>: {msg}
                                                </li>
                                            ));
                                        }

                                        // case: Record<string, string>[]
                                        if (Array.isArray(uploadErrors) && typeof uploadErrors[0] === 'object') {
                                            return (uploadErrors as Record<string, string>[]).flatMap((obj, objIdx) =>
                                                Object.entries(obj).map(([field, msg], idx) => (
                                                    <li key={`${objIdx}-${field}-${idx}`}>
                                                        <strong>{field}</strong>: {msg}
                                                    </li>
                                                )),
                                            );
                                        }

                                        return null;
                                    })()}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {resTemp && resTemp.skipped_count > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircleIcon />
                            <AlertTitle>Oops! Some files were skipped.</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc">
                                    {resTemp.skipped.map((file, index) => (
                                        <li key={index}>
                                            <p>{file.name}</p>
                                            <p>{file.message}</p>
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <FormField
                                control={form.control}
                                name="files"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                maxSize={maxFileSize}
                                                onFileReject={(_, message) => {
                                                    form.setError('files', {
                                                        message,
                                                    });
                                                }}
                                                disabled={isUploadLoading}
                                                multiple
                                            >
                                                <FileUploadDropzone className="h-40 flex-row flex-wrap border-dotted text-center">
                                                    <CloudUpload className="size-4" />
                                                    Drag and drop or
                                                    <FileUploadTrigger asChild disabled={isUploadLoading}>
                                                        <Button size="sm" variant={'fill'}>
                                                            Choose files
                                                        </Button>
                                                    </FileUploadTrigger>
                                                    to upload
                                                </FileUploadDropzone>
                                                <div className="space-y-1">
                                                    <Progress value={progress.percent} />
                                                    <div className="text-xs text-muted-foreground">
                                                        {progress.total
                                                            ? `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)} • ${progress.percent}%`
                                                            : isUploadLoading
                                                              ? `${formatBytes(progress.loaded)} uploaded`
                                                              : ''}
                                                    </div>
                                                </div>
                                                <FileUploadList>
                                                    {field.value.map((file, index) => (
                                                        <FileUploadItem key={index} value={file}>
                                                            <FileUploadItemPreview />
                                                            <FileUploadItemMetadata />
                                                            <FileUploadItemDelete asChild>
                                                                <Button variant="ghost" size="icon" className="size-7">
                                                                    <X />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </FileUploadItemDelete>
                                                        </FileUploadItem>
                                                    ))}
                                                </FileUploadList>
                                            </FileUpload>
                                        </FormControl>
                                        <FormDescription>
                                            You can upload up to <b>{maxFiles} files</b>. Maximum file size per file: <b>{_formatFileSize}</b>.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-4" loading={isUploadLoading}>
                                Submit
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
