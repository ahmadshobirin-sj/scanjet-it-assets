import { Badge } from '@/components/ui/badge';
import { AssetCondition, AssetConditionHelper } from '@/constants/asset-condition';
import { cn } from '@/lib/utils';
import { Package, Trash } from 'lucide-react';
import { FC, forwardRef } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AssetListProps {
    name?: string;
    manufactureName?: string;
    serialNumber?: string;
    assetTag?: string;
    categoryName?: string;
    bordered?: boolean;
    className?: string;
    condition?: AssetCondition;
    showCondition?: boolean;
}

const AssetList: FC<AssetListProps> = ({
    name,
    manufactureName,
    serialNumber,
    assetTag,
    categoryName,
    bordered = false,
    className,
    condition,
    showCondition,
}) => {
    return (
        <div className="flex w-full flex-col rounded-md">
            <div
                className={cn(
                    'flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center',
                    bordered && 'rounded-md border p-2',
                    showCondition && 'flex-1 rounded-b-none',
                    className,
                )}
            >
                <div>
                    <Badge size="md" className="p-1.5" intent="info" variant="light">
                        <Package className="!size-4" />
                    </Badge>
                </div>
                <div className="flex-1 text-left">
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
            {showCondition && (
                <div className={cn('flex w-full items-center justify-center rounded-b-md border-x border-b px-1 py-1 text-center text-sm')}>
                    {condition ? (
                        <Badge className="w-full" size="md" intent={AssetConditionHelper.getIntent(condition) as any} variant="light">
                            {AssetConditionHelper.getLabel(condition)}
                        </Badge>
                    ) : (
                        <Badge className="w-full" size="md" intent="secondary" variant="fill">
                            Select condition
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

interface AssetListSelectorProps {
    assetList: Omit<AssetListProps, 'condition' | 'showCondition'>;
    value?: AssetCondition;
    onValueChange?: (value: string) => void;
    onDelete?: () => void;
    error?: string;
}

const AssetListSelector = forwardRef<HTMLButtonElement, AssetListSelectorProps>(
    ({ assetList: { className: classNameAssetList, ...assetList }, value, onValueChange, onDelete, error }, ref) => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger ref={ref} asChild>
                    <button
                        type="button"
                        className={cn(
                            'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            error && 'ring-2 ring-destructive',
                        )}
                    >
                        <AssetList className={classNameAssetList} condition={value} showCondition={true} {...assetList} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Asset Condition</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
                        {AssetConditionHelper.getOptions().map((option, index) => (
                            <DropdownMenuRadioItem key={index} value={option.value}>
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    {onDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={onDelete}>
                                <Trash className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    },
);

export { AssetListSelector };
export default AssetList;
