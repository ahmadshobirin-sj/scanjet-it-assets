import { useMemo } from 'react';
import { Table as TableType } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from "motion/react";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    actionsToolbar
}: DataGridActionsToolbarProps<TData>) => {
    const getLengthRowSelection = useMemo(() =>
        serverSide ? Object.keys(rowSelection).length : table.getFilteredSelectedRowModel().rows.length,
        [rowSelection, serverSide, table]
    );

    return (
        <AnimatePresence>
            {enableRowSelection && getLengthRowSelection > 0 && (
                <motion.div
                    key="actions-toolbar"
                    initial={{ opacity: 0, translateY: 100 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 100 }}
                    className='fixed bottom-10 rounded-md bg-secondary left-1/2 -translate-x-1/2 p-2 flex gap-2 border'
                >
                    <div className='px-2 py-1 border bg-background rounded-md text-sm items-center flex'>
                        <span>{getLengthRowSelection} selected</span>
                        <div data-orientation="vertical" role="none" data-slot="separator-root" className="shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px mr-1 ml-2 data-[orientation=vertical]:h-4"></div>
                        <Tooltip>
                            <TooltipTrigger asChild onClick={() => table.resetRowSelection()}>
                                <div className='cursor-pointer'>
                                    <X className='size-4' />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Clear selection
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    {actionsToolbar?.map((menu, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild onClick={menu.event}>
                                <Button size="icon" variant="light" intent={menu.color as any || 'secondary'}>
                                    {menu.icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {menu.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
