import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table as TableType } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';

interface DataGridActionsToolbarProps<TData> {
    table: TableType<TData>;
    enableRowSelection: boolean;
    serverSide: boolean;
    rowSelection: Record<string, boolean>;
    actionsToolbar?: {
        icon: React.ReactNode;
        name: string;
        event?: () => void;
        color?: string;
    }[];
}

export const DataGridActionsToolbar = <TData,>({
    table,
    enableRowSelection,
    serverSide,
    rowSelection,
    actionsToolbar,
}: DataGridActionsToolbarProps<TData>) => {
    const getLengthRowSelection = useMemo(
        () => (serverSide ? Object.keys(rowSelection).length : table.getFilteredSelectedRowModel().rows.length),
        [rowSelection, serverSide, table],
    );

    return (
        <AnimatePresence>
            {enableRowSelection && getLengthRowSelection > 0 && (
                <motion.div
                    key="actions-toolbar"
                    initial={{ opacity: 0, translateY: 100 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 100 }}
                    className="fixed bottom-10 left-1/2 flex -translate-x-1/2 gap-2 rounded-md border bg-secondary p-2"
                >
                    <div className="flex items-center rounded-md border bg-background px-2 py-1 text-sm">
                        <span>{getLengthRowSelection} selected</span>
                        <div
                            data-orientation="vertical"
                            role="none"
                            data-slot="separator-root"
                            className="mr-1 ml-2 shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px"
                        ></div>
                        <Tooltip>
                            <TooltipTrigger asChild onClick={() => table.resetRowSelection()}>
                                <div className="cursor-pointer">
                                    <X className="size-4" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Clear selection</TooltipContent>
                        </Tooltip>
                    </div>
                    {actionsToolbar?.map((menu, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild onClick={menu.event}>
                                <Button size="icon" variant="light" intent={(menu.color as any) || 'secondary'}>
                                    {menu.icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{menu.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
