import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { ChevronDownIcon, X } from 'lucide-react';
import * as React from 'react';
import { forwardRef, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface Option {
    value: string;
    label: string;
    disable?: boolean;
    badgeColor?: string;
    /** fixed option that can't be removed. */
    fixed?: boolean;
    /** Custom content to render in the option dropdown - overrides default label */
    optionContent?: (option: Option) => React.ReactNode;
    /** Custom content to render in the selected badge - overrides default label */
    badgeContent?: (option: Option) => React.ReactNode;
    /** Custom element to completely replace the badge - receives option and handlers */
    badgeElement?: (props: { option: Option; onRemove: () => void; disabled?: boolean; fixed?: boolean }) => React.ReactNode;
    /** Group the options by providing key. */
    [key: string]: any;
}
interface GroupOption {
    [key: string]: Option[];
}

interface MultipleSelectorProps {
    value?: Option[];
    defaultOptions?: Option[] | any[];
    /** manually controlled options */
    options?: Option[] | any[];
    placeholder?: string;
    /** Loading component. */
    loadingIndicator?: React.ReactNode;
    /** Empty component. */
    emptyIndicator?: React.ReactNode;
    /** Debounce time for async search. Only work with `onSearch`. */
    delay?: number;
    /**
     * Only work with `onSearch` prop. Trigger search when `onFocus`.
     * For example, when user click on the input, it will trigger the search to get initial options.
     **/
    triggerSearchOnFocus?: boolean;
    /** async search - can return raw backend data when using optionTransformer */
    onSearch?: (value: string) => Promise<Option[] | any[]>;
    /**
     * sync search. This search will not showing loadingIndicator.
     * The rest props are the same as async search.
     * i.e.: creatable, groupBy, delay.
     **/
    onSearchSync?: (value: string) => Option[] | any[];
    onChange?: (options: Option[]) => void;
    /** Limit the maximum number of selected options. */
    maxSelected?: number;
    /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
    onMaxSelected?: (maxLimit: number) => void;
    /** Hide the placeholder when there are options selected. */
    hidePlaceholderWhenSelected?: boolean;
    disabled?: boolean;
    /** Group the options base on provided key. */
    groupBy?: string;
    className?: string;
    badgeClassName?: string;
    /**
     * First item selected is a default behavior by cmdk. That is why the default is true.
     * This is a workaround solution by add a dummy item.
     *
     * @reference: https://github.com/pacocoursey/cmdk/issues/171
     */
    selectFirstItem?: boolean;
    /** Allow user to create option when there is no option matched. */
    creatable?: boolean;
    /** Props of `Command` */
    commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
    /** Props of `CommandInput` */
    inputProps?: Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value' | 'placeholder' | 'disabled'>;
    /** hide the clear all button. */
    hideClearAllButton?: boolean;
    /** Enable single value mode - only one option can be selected */
    single?: boolean;
    /** Transform backend data to add custom render functions */
    optionTransformer?: (option: any) => Option;
    /** Transform selected options for custom badge rendering */
    selectedTransformer?: (option: any) => Option;
}

export interface MultipleSelectorRef {
    selectedValue: Option[];
    input: HTMLInputElement;
    focus: () => void;
    reset: () => void;
}

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string) {
    if (options.length === 0) {
        return {};
    }
    if (!groupBy) {
        return {
            '': options,
        };
    }

    const groupOption: GroupOption = {};
    options.forEach((option) => {
        const key = (option[groupBy] as string) || '';
        if (!groupOption[key]) {
            groupOption[key] = [];
        }
        groupOption[key].push(option);
    });
    return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
    // Don't use JSON.parse/stringify as it removes functions
    const cloneOption: GroupOption = {};

    for (const [key, value] of Object.entries(groupOption)) {
        cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value)).map((option) => ({ ...option })); // Shallow copy to preserve functions
    }
    return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
    for (const [, value] of Object.entries(groupOption)) {
        if (value.some((option) => targetOption.find((p) => p.value === option.value))) {
            return true;
        }
    }
    return false;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = forwardRef<HTMLDivElement, React.ComponentProps<typeof CommandPrimitive.Empty>>(({ className, ...props }, forwardedRef) => {
    const render = useCommandState((state) => state.filtered.count === 0);

    if (!render) return null;

    return <div ref={forwardedRef} className={cn('py-6 text-center text-sm', className)} cmdk-empty="" role="presentation" {...props} />;
});

CommandEmpty.displayName = 'CommandEmpty';

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
    (
        {
            value,
            onChange,
            placeholder,
            defaultOptions: arrayDefaultOptions = [],
            options: arrayOptions,
            delay,
            onSearch,
            onSearchSync,
            loadingIndicator,
            emptyIndicator,
            maxSelected = Number.MAX_SAFE_INTEGER,
            onMaxSelected,
            hidePlaceholderWhenSelected,
            disabled,
            groupBy,
            className,
            badgeClassName,
            selectFirstItem = true,
            creatable = false,
            triggerSearchOnFocus = false,
            commandProps,
            inputProps,
            hideClearAllButton = false,
            single = false,
            optionTransformer,
            selectedTransformer,
        }: MultipleSelectorProps,
        ref: React.Ref<MultipleSelectorRef>,
    ) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const inputContainerRef = React.useRef<HTMLInputElement>(null);
        const [open, setOpen] = React.useState(false);
        const [onScrollbar, setOnScrollbar] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        const [selected, setSelected] = React.useState<Option[]>(() => {
            const initialValue = value || [];
            return selectedTransformer ? initialValue.map(selectedTransformer) : initialValue;
        });
        const [options, setOptions] = React.useState<GroupOption>(() => {
            const transformedDefaults = optionTransformer ? arrayDefaultOptions.map(optionTransformer) : arrayDefaultOptions;
            return transToGroupOption(transformedDefaults, groupBy);
        });
        const [inputValue, setInputValue] = React.useState('');
        const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

        // Override maxSelected to 1 when single mode is enabled
        const effectiveMaxSelected = single ? 1 : maxSelected;

        // Cache onsearch results
        const searchCache = React.useRef<Record<string, Option[]>>({});

        React.useImperativeHandle(
            ref,
            () => ({
                selectedValue: [...selected],
                input: inputRef.current as HTMLInputElement,
                focus: () => inputRef?.current?.focus(),
                reset: () => setSelected([]),
            }),
            [selected],
        );

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                inputRef.current.blur();
            }
        };

        const handleUnselect = React.useCallback(
            (option: Option) => {
                const newOptions = selected.filter((s) => s.value !== option.value);
                setSelected(newOptions);
                onChange?.(newOptions);
            },
            [onChange, selected],
        );

        const handleKeyDown = React.useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                const input = inputRef.current;
                if (input) {
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                        if (input.value === '' && selected.length > 0) {
                            const lastSelectOption = selected[selected.length - 1];
                            // If there is a last item and it is not fixed, we can remove it.
                            if (lastSelectOption && !lastSelectOption.fixed) {
                                handleUnselect(lastSelectOption);
                            }
                        }
                    }
                    // This is not a default behavior of the <input /> field
                    if (e.key === 'Escape') {
                        input.blur();
                    }
                }
            },
            [handleUnselect, selected],
        );

        useEffect(() => {
            if (open) {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('touchend', handleClickOutside);
            } else {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchend', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchend', handleClickOutside);
            };
        }, [open]);

        useEffect(() => {
            if (value) {
                const transformedValue = selectedTransformer ? value.map(selectedTransformer) : value;
                // Only update if different to avoid infinite loop
                setSelected((prevSelected) => {
                    const prevValues = prevSelected.map((v) => v.value);
                    const newValues = transformedValue.map((v) => v.value);
                    const isEqual = prevValues.length === newValues.length && prevValues.every((val, idx) => val === newValues[idx]);
                    if (isEqual) {
                        return prevSelected;
                    }
                    return transformedValue;
                });
            }
        }, [value, selectedTransformer]);

        useEffect(() => {
            /** If `onSearch` is provided, do not trigger options updated. */
            if (!arrayOptions || onSearch) {
                return;
            }
            const transformedOptions = optionTransformer ? arrayOptions.map(optionTransformer) : arrayOptions;
            const newOption = transToGroupOption(transformedOptions, groupBy);

            // Compare options to prevent unnecessary updates
            setOptions((prevOptions) => {
                const prevKeys = Object.keys(prevOptions).sort();
                const newKeys = Object.keys(newOption).sort();

                // Check if keys are different
                if (prevKeys.length !== newKeys.length || !prevKeys.every((key, idx) => key === newKeys[idx])) {
                    return newOption;
                }

                // Check if option values are different
                for (const key of prevKeys) {
                    const prevVals = prevOptions[key] || [];
                    const newVals = newOption[key] || [];

                    if (prevVals.length !== newVals.length) {
                        return newOption;
                    }

                    for (let i = 0; i < prevVals.length; i++) {
                        if (prevVals[i].value !== newVals[i].value || prevVals[i].label !== newVals[i].label) {
                            return newOption;
                        }
                    }
                }

                // No changes detected, return previous options
                return prevOptions;
            });
        }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, optionTransformer]);

        useEffect(() => {
            /** sync search */

            const doSearchSync = () => {
                const res = onSearchSync?.(debouncedSearchTerm);
                const rawOptions = res || [];
                const transformedOptions = optionTransformer ? rawOptions.map(optionTransformer) : rawOptions;
                setOptions(transToGroupOption(transformedOptions, groupBy));
            };

            const exec = async () => {
                if (!onSearchSync || !open) return;

                if (triggerSearchOnFocus) {
                    doSearchSync();
                }

                if (debouncedSearchTerm) {
                    doSearchSync();
                }
            };

            void exec();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, optionTransformer]);

        useEffect(() => {
            /** async search */
            const doSearch = async () => {
                if (searchCache.current[debouncedSearchTerm]) {
                    const cachedOptions = searchCache.current[debouncedSearchTerm];
                    const transformedOptions = optionTransformer ? cachedOptions.map(optionTransformer) : cachedOptions;
                    setOptions(transToGroupOption(transformedOptions, groupBy));
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);

                try {
                    const res = await onSearch?.(debouncedSearchTerm);
                    const rawOptions = res || [];
                    searchCache.current[debouncedSearchTerm] = rawOptions;

                    const transformedOptions = optionTransformer ? rawOptions.map(optionTransformer) : rawOptions;
                    setOptions(transToGroupOption(transformedOptions, groupBy));
                } finally {
                    setIsLoading(false);
                }
            };

            const exec = async () => {
                if (!onSearch || !open) return;

                if (triggerSearchOnFocus) {
                    await doSearch();
                }

                if (debouncedSearchTerm) {
                    await doSearch();
                }
            };

            void exec();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, optionTransformer]);

        const CreatableItem = () => {
            if (!creatable) return undefined;
            if (isOptionsExist(options, [{ value: inputValue, label: inputValue }]) || selected.find((s) => s.value === inputValue)) {
                return undefined;
            }

            const Item = (
                <CommandItem
                    value={inputValue}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onSelect={(value: string) => {
                        if (selected.length >= effectiveMaxSelected) {
                            onMaxSelected?.(selected.length);
                            return;
                        }
                        setInputValue('');
                        const newOption = { value, label: value };
                        const newOptions = single ? [newOption] : [...selected, newOption];
                        setSelected(newOptions);
                        onChange?.(newOptions);
                        // Close dropdown in single mode after selection
                        if (single) {
                            setOpen(false);
                            inputRef.current?.blur();
                        }
                    }}
                >
                    {`Create "${inputValue}"`}
                </CommandItem>
            );

            // For normal creatable
            if (!onSearch && inputValue.length > 0) {
                return Item;
            }

            // For async search creatable. avoid showing creatable item before loading at first.
            if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
                return Item;
            }

            return undefined;
        };

        const EmptyItem = React.useCallback(() => {
            if (!emptyIndicator) return undefined;

            // For async search that showing emptyIndicator
            if (onSearch && !creatable && Object.keys(options).length === 0) {
                return (
                    <CommandItem value="-" disabled>
                        {emptyIndicator}
                    </CommandItem>
                );
            }

            return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
        }, [creatable, emptyIndicator, onSearch, options]);

        const selectables = React.useMemo<GroupOption>(() => removePickedOption(options, selected), [options, selected]);

        /** Avoid Creatable Selector freezing or lagging when paste a long string. */
        const commandFilter = React.useCallback(() => {
            if (commandProps?.filter) {
                return commandProps.filter;
            }

            if (creatable) {
                return (value: string, search: string) => {
                    return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
                };
            }
            // Using default filter in `cmdk`. We don't have to provide it.
            return undefined;
        }, [creatable, commandProps?.filter]);

        return (
            <Command
                ref={dropdownRef}
                {...commandProps}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                    commandProps?.onKeyDown?.(e);
                }}
                className={cn('h-auto overflow-visible', commandProps?.className)}
                shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch} // When onSearch is provided, we don't want to filter the options. You can still override it.
                filter={commandFilter()}
            >
                <div
                    className={cn(
                        'flex items-start justify-between rounded-md border border-input px-3 py-2 text-base md:text-sm',
                        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                        'shadow-xs transition-[color,box-shadow] outline-none',
                        {
                            'cursor-text': !disabled && selected.length !== 0,
                        },
                        className,
                    )}
                    onClick={() => {
                        if (disabled) return;
                        inputRef?.current?.focus();
                    }}
                    ref={inputContainerRef}
                >
                    <div className="relative flex flex-wrap gap-1">
                        {selected.map((option) => {
                            // If custom badge element is provided, use it
                            if (option.badgeElement) {
                                return (
                                    <div key={option.value}>
                                        {option.badgeElement({
                                            option,
                                            onRemove: () => handleUnselect(option),
                                            disabled: disabled,
                                            fixed: option.fixed,
                                        })}
                                    </div>
                                );
                            }

                            // Default badge with optional custom content
                            return (
                                <Badge
                                    key={option.value}
                                    className={cn(
                                        'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                                        'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                                        badgeClassName,
                                    )}
                                    intent={option.badgeColor as any}
                                    data-fixed={option.fixed}
                                    data-disabled={disabled || undefined}
                                >
                                    {option.badgeContent ? option.badgeContent(option) : option.label || 'Unknown'}
                                    <button
                                        type="button"
                                        className={cn(
                                            'ml-1 rounded-full ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                            (disabled || option.fixed) && 'hidden',
                                        )}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUnselect(option);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleUnselect(option)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            );
                        })}
                        {/* Avoid having the "Search" Icon */}
                        <CommandPrimitive.Input
                            {...inputProps}
                            ref={inputRef}
                            value={inputValue}
                            disabled={disabled}
                            onValueChange={(value) => {
                                setInputValue(value);
                                inputProps?.onValueChange?.(value);
                            }}
                            onBlur={(event) => {
                                if (!onScrollbar) {
                                    setOpen(false);
                                }
                                inputProps?.onBlur?.(event);
                            }}
                            onFocus={(event) => {
                                setOpen(true);
                                inputProps?.onFocus?.(event);
                            }}
                            placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
                            className={cn(
                                'flex-1 self-baseline bg-transparent outline-none placeholder:text-muted-foreground',
                                {
                                    'w-full': hidePlaceholderWhenSelected,
                                    'ml-1': selected.length !== 0,
                                },
                                inputProps?.className,
                            )}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelected(selected.filter((s) => s.fixed));
                            onChange?.(selected.filter((s) => s.fixed));
                        }}
                        className={cn(
                            'size-5',
                            (hideClearAllButton || disabled || selected.length < 1 || selected.filter((s) => s.fixed).length === selected.length) &&
                                'hidden',
                        )}
                    >
                        <X className="size-5" />
                    </button>
                    <ChevronDownIcon
                        className={cn(
                            'size-5 text-muted-foreground/50',
                            (hideClearAllButton || disabled || selected.length >= 1 || selected.filter((s) => s.fixed).length !== selected.length) &&
                                'hidden',
                        )}
                    />
                </div>
                <div className="relative" style={{ width: inputContainerRef?.current?.clientWidth || '100%' }}>
                    {open && (
                        <CommandList
                            className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in outline-none"
                            onMouseLeave={() => {
                                setOnScrollbar(false);
                            }}
                            onMouseEnter={() => {
                                setOnScrollbar(true);
                            }}
                            onMouseUp={() => {
                                inputRef?.current?.focus();
                            }}
                        >
                            {isLoading ? (
                                <>{loadingIndicator || <p className="text-center text-sm text-muted-foreground">Loading...</p>}</>
                            ) : (
                                <>
                                    {EmptyItem()}
                                    {CreatableItem()}
                                    {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                                    {Object.entries(selectables).map(([key, dropdowns]) => (
                                        <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                                            <>
                                                {dropdowns.map((option) => {
                                                    return (
                                                        <CommandItem
                                                            key={option.value}
                                                            value={option.label}
                                                            disabled={option.disable}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onSelect={() => {
                                                                if (selected.length >= effectiveMaxSelected && !single) {
                                                                    onMaxSelected?.(selected.length);
                                                                    return;
                                                                }
                                                                setInputValue('');
                                                                const newOptions = single ? [option] : [...selected, option];
                                                                setSelected(newOptions);
                                                                onChange?.(newOptions);
                                                                // Close dropdown in single mode after selection
                                                                if (single) {
                                                                    setOpen(false);
                                                                    inputRef.current?.blur();
                                                                }
                                                            }}
                                                            className={cn('cursor-pointer', option.disable && 'cursor-default text-muted-foreground')}
                                                        >
                                                            {option.optionContent ? option.optionContent(option) : option.label || 'Unknown'}
                                                        </CommandItem>
                                                    );
                                                })}
                                            </>
                                        </CommandGroup>
                                    ))}
                                </>
                            )}
                        </CommandList>
                    )}
                </div>
            </Command>
        );
    },
);

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;
