import { Button } from '@/components/ui/button';
import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useDidUpdate from '@/hooks/use-did-update';
import { convertCarbonToDateFns } from '@/lib/convertCarbonToDateFns';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { isArray, isEqual } from 'lodash';
import { FilterIcon, SearchIcon } from 'lucide-react';
import { FC, useCallback, useMemo, useState } from 'react';
import { isArrayValue } from '.';
import { useDataTable } from './data-table-provider';
import { DataTableFilter, DataTableFilterStateItem } from './data-table.types';

interface DataTableFilterItemProps extends DataTableFilter {
    state: DataTableFilterStateItem;
}

const DataTableFilterItem: FC<DataTableFilterItemProps> = ({ label, attribute, clauses, type, meta, options, state: defaultState }) => {
    const { handleOnChangeFilter, isLoading } = useDataTable();
    const [state, setState] = useState<DataTableFilterStateItem>(defaultState);

    const handleChange = (value: string[]) => {
        const val = value[0];

        const obj = {
            clause: val,
            enabled: true,
            value: null,
        };

        setState(obj);
    };

    useDidUpdate(() => {
        setState(defaultState);
    }, [defaultState]);

    const handleApplyFilter = useCallback(() => {
        if (isEqual(state, defaultState)) return;

        handleOnChangeFilter(attribute, {
            ...state,
            enabled: state.value === null ? false : true,
        });
    }, [state, defaultState, attribute, handleOnChangeFilter]);

    const handleChangeController = (state: DataTableFilterStateItem) => {
        setState(state);
    };

    const handleClearFilter = () => {
        setState((old) => ({
            ...old,
            enabled: false,
            value: null,
        }));
    };

    return (
        <Popover
            onOpenChange={(value) => {
                if (!value) {
                    handleApplyFilter();
                }
            }}
        >
            <PopoverTrigger asChild disabled={isLoading}>
                <button
                    className={cn(
                        'cursor-pointer rounded-md border border-dashed border-black bg-white px-3 py-1 text-sm shadow-sm',
                        isLoading && 'opacity-60',
                    )}
                >
                    {label}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <FilterIcon className="size-5" />
                        </div>
                        <MultiSelect
                            variant="default"
                            single
                            clearable={false}
                            defaultValue={state.clause ? [state.clause] : []}
                            value={state.clause ? [state.clause] : []}
                            options={clauses}
                            onValueChange={handleChange}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div>
                            <SearchIcon className="size-5" />
                        </div>
                        <DateTableFilterItemController
                            type={type}
                            meta={meta}
                            options={options}
                            state={state}
                            handleChange={handleChangeController}
                        />
                    </div>
                </div>
                {state.value !== null && (
                    <div className="mt-4 border-t pt-3">
                        <Button className="w-full" intent="destructive" variant="light" onClick={handleClearFilter}>
                            Clear
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

interface DateTableFilterItemControllerProps extends Pick<DataTableFilterItemProps, 'type' | 'meta' | 'options' | 'state'> {
    handleChange: (state: DataTableFilterStateItem) => void;
}

const DateTableFilterItemController = ({ type, options, meta, state, handleChange }: DateTableFilterItemControllerProps) => {
    const numberOfMonths = useMemo(() => (isArrayValue.includes(state.clause) ? 2 : 1), [state.clause]);

    if (type === 'text') {
        return (
            <Input
                type="text"
                value={state.value || ''}
                placeholder={'Enter text'}
                onChange={(event) => {
                    handleChange({
                        ...state,
                        value: event.target.value || '',
                    });
                }}
            />
        );
    }
    if (type === 'date') {
        return (
            <CalendarDatePicker
                className="h-auto w-full border-border whitespace-pre-wrap"
                variant="outline"
                intent="secondary"
                numberOfMonths={numberOfMonths}
                date={
                    state.value
                        ? numberOfMonths > 1
                            ? {
                                  from: new Date(state.value[0]),
                                  to: new Date(state.value[1]),
                              }
                            : {
                                  from: new Date(state.value),
                                  to: new Date(state.value),
                              }
                        : {
                              from: undefined,
                              to: undefined,
                          }
                }
                onDateSelect={(date) => {
                    let value;
                    const formatDate = meta!.format as string;
                    if (numberOfMonths > 1) {
                        value = [format(date.from, convertCarbonToDateFns(formatDate)), format(date.to, convertCarbonToDateFns(formatDate))];
                    } else {
                        value = format(date.from, convertCarbonToDateFns(formatDate));
                    }

                    handleChange({
                        ...state,
                        value: value,
                    });
                }}
            />
        );
    }

    if (type === 'set') {
        return (
            <MultiSelect
                single={!isArrayValue.includes(state.clause)}
                defaultValue={state.value ? (!isArray(state.value) ? [state.value] : state.value) : []}
                value={state.value || []}
                options={options as any}
                onValueChange={(value) => {
                    handleChange({
                        ...state,
                        value: value.length > 0 ? (value.length > 1 ? value : value[0]) : [],
                    });
                }}
            />
        );
    }
};

export default DataTableFilterItem;
