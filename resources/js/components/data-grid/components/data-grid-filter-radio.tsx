import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import { DataGridRadioFilterField, DataGridFilterOption } from '../data-grid.types';
import { useDataGrid } from '../data-grid-provider';

interface DataGridFilterRadioProps<TData> {
    field: DataGridRadioFilterField<TData>;
}

export const DataGridFilterRadio = <TData,>({ field }: DataGridFilterRadioProps<TData>) => {
    const { table } = useDataGrid();
    
    const column = table.getColumn(field.value as string);
    const filterValue = (column?.getFilterValue() as string) || '';

    const handleChange = (value: string) => {
        if (value === filterValue) {
            // If clicking the same value, clear the filter
            column?.setFilterValue(undefined);
        } else {
            column?.setFilterValue(value);
        }
    };

    const clearFilter = () => {
        column?.setFilterValue(undefined);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {filterValue && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilter}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>
            
            <RadioGroup value={filterValue} onValueChange={handleChange}>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {field.options?.filter((option: DataGridFilterOption) => option.value !== undefined).map((option: DataGridFilterOption, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem
                                value={String(option.value)}
                                id={`${field.value as string}-${index}`}
                            />
                            <Label 
                                htmlFor={`${field.value as string}-${index}`}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {field.component ? (
                                    <field.component {...option} />
                                ) : (
                                    option.label
                                )}
                            </Label>
                        </div>
                    ))}
                </div>
            </RadioGroup>
            
            {filterValue && (
                <div className="text-xs text-muted-foreground">
                    Selected: {field.options?.find((opt: DataGridFilterOption) => String(opt.value) === filterValue)?.label || filterValue}
                </div>
            )}
        </div>
    );
};

export default DataGridFilterRadio;
