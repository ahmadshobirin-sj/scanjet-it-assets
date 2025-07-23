import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDataGrid } from '../data-grid-provider';
import { DataGridSliderFilterField } from '../data-grid.types';

interface DataGridFilterSliderProps<TData> {
    field: DataGridSliderFilterField<TData>;
}

export const DataGridFilterSlider = <TData,>({ field }: DataGridFilterSliderProps<TData>) => {
    const { table } = useDataGrid();

    const column = table.getColumn(field.value as string);
    const filterValue = column?.getFilterValue() as [number, number] | undefined;

    const [localValue, setLocalValue] = useState<[number, number]>([field.min, field.max]);

    // Update local value when filter value changes
    useEffect(() => {
        if (filterValue) {
            setLocalValue(filterValue);
        } else {
            setLocalValue([field.min, field.max]);
        }
    }, [filterValue, field.min, field.max]);

    const handleValueChange = (value: number[]) => {
        const newValue: [number, number] = [value[0], value[1]];
        setLocalValue(newValue);

        // Only set filter if values are different from min/max (meaning user has filtered)
        if (newValue[0] !== field.min || newValue[1] !== field.max) {
            column?.setFilterValue(newValue);
        } else {
            column?.setFilterValue(undefined);
        }
    };

    const clearFilter = () => {
        setLocalValue([field.min, field.max]);
        column?.setFilterValue(undefined);
    };

    const hasFilter = filterValue && (filterValue[0] !== field.min || filterValue[1] !== field.max);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {hasFilter && (
                    <Button variant="ghost" size="sm" onClick={clearFilter} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <div className="px-2">
                <Slider value={localValue} onValueChange={handleValueChange} min={field.min} max={field.max} step={1} className="w-full" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{localValue[0]}</span>
                <span>{localValue[1]}</span>
            </div>

            {hasFilter && (
                <div className="text-xs text-muted-foreground">
                    Range: {localValue[0]} - {localValue[1]}
                </div>
            )}
        </div>
    );
};

export default DataGridFilterSlider;
