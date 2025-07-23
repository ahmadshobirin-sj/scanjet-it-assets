import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { X } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useDataGrid } from '../data-grid-provider';
import { DataGridSearchResult, DataGridSelectFilterField } from '../data-grid.types';

interface DataGridFilterSelectProps<TData> {
    field: DataGridSelectFilterField<TData>;
}

// Extended Option interface to store all attributes
interface ExtendedOption extends Option {
    [key: string]: any; // Store all additional properties
}

export const DataGridFilterSelect = <TData,>({ field }: DataGridFilterSelectProps<TData>) => {
    const { table } = useDataGrid();

    // Cache to store full data for selected options
    const optionsCache = useRef<Map<string, DataGridSearchResult>>(new Map());

    const column = table.getColumn(field.value as string);
    const filterValue = column?.getFilterValue() as string[] | string | undefined;

    // Convert filter value to Option format, preserving all attributes
    const selectedOptions: ExtendedOption[] = filterValue
        ? (Array.isArray(filterValue) ? filterValue : [filterValue]).map((value) => {
              const stringValue = String(value);
              const cachedData = optionsCache.current.get(stringValue);

              if (cachedData) {
                  // Create new object without duplicating label and value
                  const result: ExtendedOption = {
                      value: stringValue,
                      label: cachedData.label,
                  };

                  // Add other properties except label and value
                  Object.keys(cachedData).forEach((key) => {
                      if (key !== 'label' && key !== 'value') {
                          result[key] = cachedData[key];
                      }
                  });

                  return result;
              } else {
                  // Fallback if not in cache
                  const option = field.options?.find((opt) => String(opt.value) === stringValue);
                  if (option) {
                      const result: ExtendedOption = {
                          value: stringValue,
                          label: option.label || stringValue,
                      };

                      // Add other properties except label and value
                      Object.keys(option).forEach((key) => {
                          if (key !== 'label' && key !== 'value') {
                              result[key] = option[key];
                          }
                      });

                      return result;
                  }
                  return {
                      value: stringValue,
                      label: stringValue,
                  };
              }
          })
        : [];

    // Handle search - use onSearch if provided, otherwise filter static options
    const handleSearch = useCallback(
        async (searchValue: string): Promise<ExtendedOption[]> => {
            if (field.onSearch) {
                // Use async search function
                const results = await field.onSearch(searchValue);

                // Cache all results for future use
                results.forEach((result) => {
                    if (result.value !== undefined) {
                        optionsCache.current.set(String(result.value), result);
                    }
                });

                return results.map((result) => {
                    const extendedOption: ExtendedOption = {
                        value: String(result.value),
                        label: result.label,
                    };

                    // Add other properties except label and value
                    Object.keys(result).forEach((key) => {
                        if (key !== 'label' && key !== 'value') {
                            extendedOption[key] = result[key];
                        }
                    });

                    return extendedOption;
                });
            } else if (field.options) {
                // Filter static options
                const filteredOptions = field.options.filter((option) => option.value !== undefined);

                if (!searchValue.trim()) {
                    // Cache static options too
                    filteredOptions.forEach((option) => {
                        if (option.value !== undefined) {
                            optionsCache.current.set(String(option.value), {
                                label: option.label,
                                value: option.value as string | number | boolean,
                                ...Object.fromEntries(Object.entries(option).filter(([key]) => key !== 'label' && key !== 'value')),
                            });
                        }
                    });

                    return filteredOptions.map((option) => {
                        const extendedOption: ExtendedOption = {
                            value: String(option.value),
                            label: option.label,
                            disable: Boolean(option.disable),
                        };

                        // Add other properties except label, value, and disable
                        Object.keys(option).forEach((key) => {
                            if (key !== 'label' && key !== 'value' && key !== 'disable') {
                                extendedOption[key] = option[key];
                            }
                        });

                        return extendedOption;
                    });
                }

                const filtered = filteredOptions.filter(
                    (option) =>
                        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                        String(option.value).toLowerCase().includes(searchValue.toLowerCase()),
                );

                // Cache filtered options
                filtered.forEach((option) => {
                    if (option.value !== undefined) {
                        optionsCache.current.set(String(option.value), {
                            label: option.label,
                            value: option.value as string | number | boolean,
                            ...Object.fromEntries(Object.entries(option).filter(([key]) => key !== 'label' && key !== 'value')),
                        });
                    }
                });

                return filtered.map((option) => {
                    const extendedOption: ExtendedOption = {
                        value: String(option.value),
                        label: option.label,
                        disable: Boolean(option.disable),
                    };

                    // Add other properties except label, value, and disable
                    Object.keys(option).forEach((key) => {
                        if (key !== 'label' && key !== 'value' && key !== 'disable') {
                            extendedOption[key] = option[key];
                        }
                    });

                    return extendedOption;
                });
            }

            return [];
        },
        [field],
    );

    const handleChange = (options: ExtendedOption[]) => {
        if (options.length === 0) {
            column?.setFilterValue(undefined);
        } else {
            // Update cache with selected options
            options.forEach((option) => {
                const cacheData: DataGridSearchResult = {
                    label: option.label,
                    value: option.value,
                };

                // Add other properties except label and value
                Object.keys(option).forEach((key) => {
                    if (key !== 'label' && key !== 'value') {
                        cacheData[key] = option[key];
                    }
                });

                optionsCache.current.set(option.value, cacheData);
            });

            const values = options.map((opt) => opt.value);
            // For single select, use string value; for multi-select, use array
            column?.setFilterValue(values.length === 1 && !field.multiple ? values[0] : values);
        }
    };

    const clearFilter = () => {
        column?.setFilterValue(undefined);
    };

    // Function to get cached data for persistence (can be used by parent components)
    const getCachedData = useCallback(() => {
        return Array.from(optionsCache.current.entries()).map(([key, value]) => ({
            key,
            data: value,
        }));
    }, []);

    // Expose cache data for localStorage persistence
    (window as any)[`dataGridFilterCache_${field.value as string}`] = getCachedData;

    const isMultiple = field.multiple !== false; // Default to multiple unless explicitly set to false

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{field.label}</Label>
                {selectedOptions.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilter} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <MultipleSelector
                value={selectedOptions}
                onChange={handleChange}
                onSearch={handleSearch}
                triggerSearchOnFocus={true}
                placeholder={`Search ${field.label.toLowerCase()}...`}
                emptyIndicator={<p className="text-center text-sm text-muted-foreground">No options found.</p>}
                loadingIndicator={<p className="text-center text-sm text-muted-foreground">Searching...</p>}
                single={!isMultiple}
                hideClearAllButton={!isMultiple}
                maxSelected={isMultiple ? undefined : 1}
                delay={300}
            />
        </div>
    );
};

export default DataGridFilterSelect;
