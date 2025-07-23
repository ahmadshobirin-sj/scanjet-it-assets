import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDataGrid } from '../data-grid-provider';
import { DataGridTimerangeFilterField } from '../data-grid.types';

interface DataGridFilterTimerangeProps<TData> {
    field: DataGridTimerangeFilterField<TData>;
}

export const DataGridFilterTimerange = <TData,>({ field }: DataGridFilterTimerangeProps<TData>) => {
    const { table } = useDataGrid();

    const column = table.getColumn(field.value as string);
    const filterValue = column?.getFilterValue() as { from: Date; to: Date } | undefined;

    const [date, setDate] = useState<DateRange | undefined>(filterValue ? { from: filterValue.from, to: filterValue.to } : undefined);

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate);

        if (newDate?.from && newDate?.to) {
            column?.setFilterValue({
                from: newDate.from,
                to: newDate.to,
            });
        } else {
            column?.setFilterValue(undefined);
        }
    };

    const clearFilter = () => {
        setDate(undefined);
        column?.setFilterValue(undefined);
    };

    const formatDateRange = () => {
        if (!date?.from) return 'Pick a date range';

        if (date.to) {
            return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
        }

        return format(date.from, 'LLL dd, y');
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {date?.from && (
                    <Button variant="ghost" size="sm" onClick={clearFilter} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('h-8 w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={handleDateChange} numberOfMonths={2} />
                </PopoverContent>
            </Popover>

            {date?.from && date?.to && (
                <div className="text-xs text-muted-foreground">
                    {Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} days selected
                </div>
            )}
        </div>
    );
};

export default DataGridFilterTimerange;
