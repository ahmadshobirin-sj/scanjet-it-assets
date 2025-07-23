import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { DataGridCheckboxFilterField } from '../data-grid.types';
import { useDataGrid } from '../data-grid-provider';

interface DataGridFilterCheckboxProps<TData> {
    field: DataGridCheckboxFilterField<TData>;
}

export const DataGridFilterCheckbox = <TData,>({ field }: DataGridFilterCheckboxProps<TData>) => {
    const { table } = useDataGrid();
    
    const column = table.getColumn(field.value as string);
    const filterValue = (column?.getFilterValue() as string[]) || [];

    const handleChange = (optionValue: string | number | boolean | undefined, checked: boolean) => {
        // Filter out undefined values and convert to string
        if (optionValue === undefined) return;
        
        const stringValue = String(optionValue);
        let newValues: string[];
        
        if (checked) {
            newValues = [...filterValue, stringValue];
        } else {
            newValues = filterValue.filter(value => value !== stringValue);
        }
        
        column?.setFilterValue(newValues.length > 0 ? newValues : undefined);
    };

    const clearFilter = () => {
        column?.setFilterValue(undefined);
    };

    const isChecked = (optionValue: string | number | boolean | undefined) => {
        if (optionValue === undefined) return false;
        return filterValue.includes(String(optionValue));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {filterValue.length > 0 && (
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
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {field.options?.filter(option => option.value !== undefined).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${field.value as string}-${index}`}
                            checked={isChecked(option.value)}
                            onCheckedChange={(checked) => 
                                handleChange(option.value, Boolean(checked))
                            }
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
            
            {filterValue.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    {filterValue.length} selected
                </div>
            )}
        </div>
    );
};

export default DataGridFilterCheckbox;
