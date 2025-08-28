import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { perPageOptions, useMediaLibrary } from './media-library-provider';

export const MediaLibraryPagination = () => {
    const { isLoading, page, setPerPage, perPage, selection, pagination } = useMediaLibrary();

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <span className="text-sm">
                    {selection.selected.size} {selection.selected.size === 1 ? 'Row Selected' : 'Rows Selected'}
                </span>
            </div>
            <div className="flex flex-row-reverse flex-wrap items-center gap-4">
                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))} disabled={isLoading}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        {perPageOptions.map((value, index) => (
                            <SelectItem value={value.toString()} key={index}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex gap-1">
                    <Button size="icon" intent="secondary" disabled={!pagination.canPrev || isLoading} onClick={pagination.goStart}>
                        <ChevronsLeftIcon />
                    </Button>
                    <Button size="icon" intent="secondary" disabled={!pagination.canPrev || isLoading} onClick={pagination.prev}>
                        <ChevronLeftIcon />
                    </Button>
                    {pagination.pages.map((p, index) => {
                        if (p === '...') {
                            return (
                                <Button size="icon" variant="ghost" intent="secondary" key={index}>
                                    {p}
                                </Button>
                            );
                        } else {
                            return (
                                <Button
                                    size="icon"
                                    intent={page === p ? 'primary' : 'secondary'}
                                    disabled={isLoading}
                                    key={index}
                                    onClick={() => pagination.setPage(p)}
                                >
                                    {p}
                                </Button>
                            );
                        }
                    })}
                    <Button size="icon" intent="secondary" disabled={!pagination.canNext || isLoading} onClick={pagination.next}>
                        <ChevronRightIcon />
                    </Button>
                    <Button size="icon" intent="secondary" disabled={!pagination.canNext || isLoading} onClick={pagination.goEnd}>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};
