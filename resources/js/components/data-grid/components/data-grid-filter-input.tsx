import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDataGrid } from '../data-grid-provider';
import { DataGridInputFilterField } from '../data-grid.types';

interface DataGridFilterInputProps<TData> {
    field: DataGridInputFilterField<TData>;
}

export const DataGridFilterInput = <TData,>({ field }: DataGridFilterInputProps<TData>) => {
    const { table } = useDataGrid();
    const [inputValue, setInputValue] = useState<string>('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const column = table.getColumn(field.value as string);
    const filterValue = (column?.getFilterValue() as string) ?? '';

    useEffect(() => {
        setInputValue(filterValue);
    }, [filterValue]);

    const debouncedSetFilter = useCallback(
        (value: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                column?.setFilterValue(value || undefined);
            }, 300);
        },
        [column],
    );

    const handleInputChange = (value: string) => {
        setInputValue(value);
        debouncedSetFilter(value);
    };

    const clearFilter = () => {
        setInputValue('');
        column?.setFilterValue(undefined);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {filterValue && (
                    <Button variant="ghost" size="sm" onClick={clearFilter} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>
            <Input placeholder={`Filter ${field.label.toLowerCase()}...`} value={inputValue} onChange={(e) => handleInputChange(e.target.value)} />
        </div>
    );
};

export default DataGridFilterInput;
