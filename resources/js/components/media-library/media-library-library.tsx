import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import EmptyData from '../ui/empty-data';
import { Label } from '../ui/label';
import { MediaLibraryItem, MediaLibraryItemSkeleton } from './media-library-item';
import { MediaLibraryPagination } from './media-library-pagination';
import { useMediaLibrary } from './media-library-provider';
import { MediaLibraryToolbar } from './media-library-toolbar';

const MediaLibraryLibrary = () => {
    const { items, isLoading, selection, allChecked, indeterminate, pageIds } = useMediaLibrary();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Library</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <MediaLibraryToolbar />
                    <div className="divide-y border-t">
                        <div className="py-6">
                            {items.length > 0 && (
                                <div className="mb-4 flex items-center gap-3">
                                    <Checkbox
                                        id="terms"
                                        disabled={isLoading}
                                        checked={indeterminate ? 'indeterminate' : allChecked}
                                        onCheckedChange={() => selection.togglePage(pageIds)}
                                    />
                                    <Label htmlFor="terms">Select All</Label>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex flex-wrap items-stretch gap-4">
                                    {Array(8)
                                        .fill(null)
                                        .map((_, index) => (
                                            <MediaLibraryItemSkeleton key={index} />
                                        ))}
                                </div>
                            )}
                            {!isLoading && items.length > 0 ? (
                                <div className="flex flex-wrap gap-4">
                                    {items.map((item, index) => (
                                        <MediaLibraryItem file={item} key={index} />
                                    ))}
                                </div>
                            ) : (
                                !isLoading && <EmptyData />
                            )}
                        </div>
                        <div className="py-3">
                            <MediaLibraryPagination />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MediaLibraryLibrary;
