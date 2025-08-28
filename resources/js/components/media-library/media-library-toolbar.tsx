import { usePermission } from '@/hooks/use-permissions';
import { confirmDialog } from '@/lib/confirmDialog';
import { cn } from '@/lib/utils';
import { RefreshCcw, SearchIcon, Settings2Icon, Trash } from 'lucide-react';
import AppToast from '../toast';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { useMediaLibrary } from './media-library-provider';

export const MediaLibraryToolbar = () => {
    const { isLoading, refreshData, search, onSearch, selection, handleSetIsBulkDeleteLoading, api, pagination } = useMediaLibrary();
    const { can } = usePermission();

    const handleDeleteFiles = () => {
        confirmDialog({
            title: `Delete ${selection.selected.size > 1 ? 'Files' : 'File'}`,
            description: (
                <>
                    Are you sure you want to delete {selection.selected.size} selected {selection.selected.size > 1 ? 'files' : 'file'}?<br />
                    This action is permanent and cannot be undone.
                </>
            ),
            autoCloseAfterConfirm: false,
            onConfirm: async ({ onClose }) => {
                try {
                    const ids = Array.from(selection.selected) as number[];
                    handleSetIsBulkDeleteLoading(true);
                    await api.bulkDelete(ids);
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.log(error);
                    }
                    AppToast({
                        message: 'Failed to delete files',
                        description: 'An error occurred while trying to delete the selected files. Please try again.',
                    });
                } finally {
                    handleSetIsBulkDeleteLoading(false);
                    selection.clearAll();
                    if (pagination.page === 1) {
                        refreshData();
                    } else {
                        pagination.setPage(1);
                    }
                    onClose();
                }
            },
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <div>
                        <Button size="icon" intent="primary" disabled={isLoading} onClick={refreshData}>
                            <RefreshCcw className={cn(isLoading && 'animate-spin')} />
                        </Button>
                    </div>
                    <Input
                        placeholder="Search..."
                        trailing={<SearchIcon />}
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        title="Refresh"
                        readOnly={isLoading}
                    />
                </div>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isLoading}>
                            <Button variant="outline" intent="secondary">
                                <Settings2Icon />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {can('media_library.delete') ? (
                                    <DropdownMenuItem variant="destructive" onClick={handleDeleteFiles}>
                                        <Trash />
                                        Delete
                                    </DropdownMenuItem>
                                ) : (
                                    ''
                                )}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
