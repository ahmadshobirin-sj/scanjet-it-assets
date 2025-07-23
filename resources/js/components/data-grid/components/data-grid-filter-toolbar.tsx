import { AnimatePresence, motion } from 'motion/react';
import { useDataGrid } from '../data-grid-provider';
import { DataGridFilterInput } from './data-grid-filter-input';
import { DataGridFilterSelect } from './data-grid-filter-select';
import { DataGridFilterCheckbox } from './data-grid-filter-checkbox';
import { DataGridFilterSlider } from './data-grid-filter-slider';
import { DataGridFilterTimerange } from './data-grid-filter-timerange';
import { DataGridFilterRadio } from './data-grid-filter-radio';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';

const DataGridFilterToolbar = () => {
    const {
        isFilterOpen,
        filterFields,
        table,
        clearAllFilters
    } = useDataGrid();

    const isMobile = useIsMobile();

    // Calculate hasActiveFilters locally to avoid infinite loop
    const hasActiveFilters = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

    return (
        <AnimatePresence>
            {filterFields && filterFields.length > 0 && isFilterOpen && (
                <motion.div
                    key="filter-toolbar"
                    initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-t border-b border-secondary bg-muted/30"
                >
                    <div className={`p-4 ${isMobile ? 'flex flex-col gap-4' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium">Filters</h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-6 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
                            {filterFields.map((field, index) => {
                                return (
                                    <div key={index} className="space-y-2">
                                        {(() => {
                                            switch (field.type) {
                                                case 'input': {
                                                    return <DataGridFilterInput field={field} />;
                                                }
                                                case 'select': {
                                                    return <DataGridFilterSelect field={field} />;
                                                }
                                                case 'checkbox': {
                                                    return <DataGridFilterCheckbox field={field} />;
                                                }
                                                case 'slider': {
                                                    return <DataGridFilterSlider field={field} />;
                                                }
                                                case 'timerange': {
                                                    return <DataGridFilterTimerange field={field} />;
                                                }
                                                case 'radio': {
                                                    return <DataGridFilterRadio field={field} />;
                                                }
                                                default: {
                                                    return null;
                                                }
                                            }
                                        })()}
                                    </div>
                                );
                            })}
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-4 pt-3 border-t border-border">
                                <div className="text-xs text-muted-foreground">
                                    {table.getState().columnFilters.length} filter(s) active
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DataGridFilterToolbar;
