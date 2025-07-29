import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

const AssetList = ({
    name,
    manufactureName,
    serialNumber,
    assetTag,
    categoryName,
    bordered = false,
}: {
    name?: string;
    manufactureName?: string;
    serialNumber?: string;
    assetTag?: string;
    categoryName?: string;
    bordered?: boolean;
}) => {
    return (
        <div className={cn('flex w-full items-center gap-2', bordered && 'rounded-md border p-2')}>
            <div>
                <Badge size="md" className="p-1.5" intent="info" variant="light">
                    <Package className="!size-4" />
                </Badge>
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold">
                    {name}{' '}
                    <Badge intent="success" variant="light">
                        {manufactureName || 'N/A'}
                    </Badge>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Serial: {serialNumber} | Asset tag: {assetTag}
                </p>
            </div>
            <div>
                <Badge intent="info" variant="light">
                    {categoryName || 'N/A'}
                </Badge>
            </div>
        </div>
    );
};

export default AssetList;
