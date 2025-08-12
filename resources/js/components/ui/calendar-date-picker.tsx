import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
    startOfWeek,
    endOfWeek,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    startOfDay,
    endOfDay,
} from "date-fns";
import { toDate, formatInTimeZone } from "date-fns-tz";
import { DateRange } from "react-day-picker";
import { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

interface CalendarDatePickerProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    id?: string;
    className?: string;
    date: DateRange;
    closeOnSelect?: boolean;
    numberOfMonths?: 1 | 2;
    yearsRange?: number;
    onDateSelect: (range: { from: Date; to: Date }) => void;
    intent?: VariantProps<typeof Button>["intent"];
    variant?: VariantProps<typeof Button>["variant"];
    calendarClassName?: string;
    withTime?: boolean;
}

export const CalendarDatePicker = React.forwardRef<
    HTMLButtonElement,
    CalendarDatePickerProps
>(
    (
        {
            id = "calendar-date-picker",
            className,
            date,
            closeOnSelect = false,
            numberOfMonths = 2,
            yearsRange = 100,
            onDateSelect,
            variant,
            calendarClassName,
            ...props
        },
        ref
    ) => {
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [selectedRange, setSelectedRange] = React.useState<string | null>(
            numberOfMonths === 2 ? "This Year" : "Today"
        );
        const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(
            date?.from
        );
        const [yearFrom, setYearFrom] = React.useState<number | undefined>(
            date?.from?.getFullYear()
        );
        const [monthTo, setMonthTo] = React.useState<Date | undefined>(
            numberOfMonths === 2 ? date?.to : date?.from
        );
        const [yearTo, setYearTo] = React.useState<number | undefined>(
            numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
        );

        // Time state
        const [timeFrom, setTimeFrom] = React.useState<string>(date?.from ? formatInTimeZone(date.from, Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm') : '00:00');
        const [timeTo, setTimeTo] = React.useState<string>(date?.to ? formatInTimeZone(date.to, Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm') : '23:59');

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const {
            withTime = false,
        } = props;

        const handleClose = () => setIsPopoverOpen(false);

        const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

        const selectDateRange = (from: Date, to: Date, range: string) => {
            const startDate = startOfDay(toDate(from, { timeZone }));
            const endDate =
                numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate;
            onDateSelect({ from: startDate, to: endDate });
            setSelectedRange(range);
            setMonthFrom(from);
            setYearFrom(from.getFullYear());
            setMonthTo(to);
            setYearTo(to.getFullYear());
            if (closeOnSelect) {
                setIsPopoverOpen(false);
            }
        };

        const handleDateSelect = (range: DateRange | undefined) => {
            if (range) {
                let from = startOfDay(toDate(range.from as Date, { timeZone }));
                let to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from;
                if (numberOfMonths === 1) {
                    if (range.from !== date.from) {
                        to = from;
                    } else {
                        from = startOfDay(toDate(range.to as Date, { timeZone }));
                    }
                }
                onDateSelect({ from, to });
                setMonthFrom(from);
                setYearFrom(from.getFullYear());
                setMonthTo(to);
                setYearTo(to.getFullYear());
            }
            setSelectedRange(null);
        };

        const handleMonthChange = (newMonthIndex: number, part: string) => {
            setSelectedRange(null);
            if (part === "from") {
                if (yearFrom !== undefined) {
                    if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
                    const newMonth = new Date(yearFrom, newMonthIndex, 1);
                    const from =
                        numberOfMonths === 2
                            ? startOfMonth(toDate(newMonth, { timeZone }))
                            : date?.from
                                ? new Date(
                                    date.from.getFullYear(),
                                    newMonth.getMonth(),
                                    date.from.getDate()
                                )
                                : newMonth;
                    const to =
                        numberOfMonths === 2
                            ? date.to
                                ? endOfDay(toDate(date.to, { timeZone }))
                                : endOfMonth(toDate(newMonth, { timeZone }))
                            : from;
                    if (from <= to) {
                        onDateSelect({ from, to });
                        setMonthFrom(newMonth);
                        setMonthTo(date.to);
                    }
                }
            } else {
                if (yearTo !== undefined) {
                    if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
                    const newMonth = new Date(yearTo, newMonthIndex, 1);
                    const from = date.from
                        ? startOfDay(toDate(date.from, { timeZone }))
                        : startOfMonth(toDate(newMonth, { timeZone }));
                    const to =
                        numberOfMonths === 2
                            ? endOfMonth(toDate(newMonth, { timeZone }))
                            : from;
                    if (from <= to) {
                        onDateSelect({ from, to });
                        setMonthTo(newMonth);
                        setMonthFrom(date.from);
                    }
                }
            }
        };

        const handleYearChange = (newYear: number, part: string) => {
            setSelectedRange(null);
            if (part === "from") {
                if (years.includes(newYear)) {
                    const newMonth = monthFrom
                        ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
                        : new Date(newYear, 0, 1);
                    const from =
                        numberOfMonths === 2
                            ? startOfMonth(toDate(newMonth, { timeZone }))
                            : date.from
                                ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
                                : newMonth;
                    const to =
                        numberOfMonths === 2
                            ? date.to
                                ? endOfDay(toDate(date.to, { timeZone }))
                                : endOfMonth(toDate(newMonth, { timeZone }))
                            : from;
                    if (from <= to) {
                        onDateSelect({ from, to });
                        setYearFrom(newYear);
                        setMonthFrom(newMonth);
                        setYearTo(date.to?.getFullYear());
                        setMonthTo(date.to);
                    }
                }
            } else {
                if (years.includes(newYear)) {
                    const newMonth = monthTo
                        ? new Date(newYear, monthTo.getMonth(), 1)
                        : new Date(newYear, 0, 1);
                    const from = date.from
                        ? startOfDay(toDate(date.from, { timeZone }))
                        : startOfMonth(toDate(newMonth, { timeZone }));
                    const to =
                        numberOfMonths === 2
                            ? endOfMonth(toDate(newMonth, { timeZone }))
                            : from;
                    if (from <= to) {
                        onDateSelect({ from, to });
                        setYearTo(newYear);
                        setMonthTo(newMonth);
                        setYearFrom(date.from?.getFullYear());
                        setMonthFrom(date.from);
                    }
                }
            }
        };

        const today = new Date();

        const years = Array.from(
            { length: yearsRange + 1 },
            (_, i) => today.getFullYear() - yearsRange / 2 + i
        );

        const dateRanges = [
            { label: "Today", start: today, end: today },
            { label: "Yesterday", start: subDays(today, 1), end: subDays(today, 1) },
            {
                label: "This Week",
                start: startOfWeek(today, { weekStartsOn: 1 }),
                end: endOfWeek(today, { weekStartsOn: 1 }),
            },
            {
                label: "Last Week",
                start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
                end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
            },
            { label: "Last 7 Days", start: subDays(today, 6), end: today },
            {
                label: "This Month",
                start: startOfMonth(today),
                end: endOfMonth(today),
            },
            {
                label: "Last Month",
                start: startOfMonth(subDays(today, today.getDate())),
                end: endOfMonth(subDays(today, today.getDate())),
            },
            { label: "This Year", start: startOfYear(today), end: endOfYear(today) },
            {
                label: "Last Year",
                start: startOfYear(subDays(today, 365)),
                end: endOfYear(subDays(today, 365)),
            },
        ];

        const formatWithTz = (date: Date, fmt: string) =>
            formatInTimeZone(date, timeZone, fmt);

        // Time formatting utilities
        const formatTime = (time: string) => {
            if (!time) return '';

            return time;
        };

        const parseTimeToDate = (date: Date, time: string): Date => {
            const [hours, minutes] = time.split(':').map(Number);
            const newDate = new Date(date);
            newDate.setHours(hours, minutes, 0, 0);
            return newDate;
        };

        const handleTimeChange = (time: string, type: 'from' | 'to') => {
            if (type === 'from') {
                setTimeFrom(time);
                if (date?.from) {
                    const newFrom = parseTimeToDate(date.from, time);
                    onDateSelect({ from: newFrom, to: date.to || newFrom });
                }
            } else {
                setTimeTo(time);
                if (date?.to) {
                    const newTo = parseTimeToDate(date.to, time);
                    onDateSelect({ from: date.from || new Date(), to: newTo });
                }
            }
        };

        const renderTimePicker = (type: 'from' | 'to') => {
            const currentTime = type === 'from' ? timeFrom : timeTo;

            return (
                <div className="flex items-center gap-2 w-full">
                    <span className="text-sm font-medium">{numberOfMonths > 1 ? type === 'from' ? 'From:' : 'To:' : 'Time:'}</span>
                    <input
                        type="time"
                        value={currentTime}
                        onChange={(e) => handleTimeChange(e.target.value, type)}
                        className="px-2 py-1 border rounded text-sm w-full"
                    />
                </div>
            );
        };

        const renderDateWithTime = () => {
            if (!date?.from) return <span>Pick a date</span>;

            const fromDate = withTime ? parseTimeToDate(date.from, timeFrom) : date.from;
            const toDate = withTime && date.to ? parseTimeToDate(date.to, timeTo) : date.to;

            const fromFormatted = formatWithTz(fromDate, "dd LLL, y");
            const fromTimeFormatted = withTime ? ` ${formatTime(timeFrom)}` : '';

            if (toDate && numberOfMonths === 2) {
                const toFormatted = formatWithTz(toDate, "dd LLL, y");
                const toTimeFormatted = withTime ? ` ${formatTime(timeTo)}` : '';

                return (
                    <>
                        <span>{fromFormatted}{fromTimeFormatted}</span>
                        {" - "}
                        <span>{toFormatted}{toTimeFormatted}</span>
                    </>
                );
            }

            return <span>{fromFormatted}{fromTimeFormatted}</span>;
        };

        return (
            <>
                <style>
                    {`
            .date-part {
              touch-action: none;
            }
            .time-picker {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-top: 0.5rem;
              padding: 0.5rem;
              border-top: 1px solid #e5e7eb;
            }
            .time-input {
              padding: 0.25rem 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.25rem;
              font-size: 0.875rem;
            }
          `}
                </style>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            ref={ref}
                            {...props}
                            variant={variant}
                            onClick={handleTogglePopover}
                            suppressHydrationWarning
                            className={cn("w-auto justify-start text-left flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none shadow-xs disabled:opacity-50", className)}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>
                                {renderDateWithTime()}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    {isPopoverOpen && (
                        <PopoverContent
                            id={id}
                            className="w-auto"
                            align="center"
                            avoidCollisions={true}
                            onInteractOutside={handleClose}
                            onEscapeKeyDown={handleClose}
                            style={{
                                maxHeight: "var(--radix-popover-content-available-height)",
                                overflowY: "auto",
                            }}
                        >
                            <div className="flex">
                                {numberOfMonths === 2 && (
                                    <div className="hidden md:flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                                        {dateRanges.map(({ label, start, end }) => (
                                            <Button
                                                key={label}
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "justify-start hover:bg-primary/90 hover:text-background",
                                                    selectedRange === label &&
                                                    "bg-primary text-background hover:bg-primary/90 hover:text-background"
                                                )}
                                                onClick={() => {
                                                    selectDateRange(start, end, label);
                                                    setMonthFrom(start);
                                                    setYearFrom(start.getFullYear());
                                                    setMonthTo(end);
                                                    setYearTo(end.getFullYear());
                                                }}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2 ml-3">
                                            <Select
                                                onValueChange={(value) => {
                                                    handleMonthChange(months.indexOf(value), "from");
                                                    setSelectedRange(null);
                                                }}
                                                value={
                                                    monthFrom ? months[monthFrom.getMonth()] : undefined
                                                }
                                            >
                                                <SelectTrigger className="flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month, idx) => (
                                                        <SelectItem key={idx} value={month}>
                                                            {month}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                onValueChange={(value) => {
                                                    handleYearChange(Number(value), "from");
                                                    setSelectedRange(null);
                                                }}
                                                value={yearFrom ? yearFrom.toString() : undefined}
                                            >
                                                <SelectTrigger className="flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year, idx) => (
                                                        <SelectItem key={idx} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {numberOfMonths === 2 && (
                                            <div className="flex gap-2">
                                                <Select
                                                    onValueChange={(value) => {
                                                        handleMonthChange(months.indexOf(value), "to");
                                                        setSelectedRange(null);
                                                    }}
                                                    value={
                                                        monthTo ? months[monthTo.getMonth()] : undefined
                                                    }
                                                >
                                                    <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                                                        <SelectValue placeholder="Month" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {months.map((month, idx) => (
                                                            <SelectItem key={idx} value={month}>
                                                                {month}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Select
                                                    onValueChange={(value) => {
                                                        handleYearChange(Number(value), "to");
                                                        setSelectedRange(null);
                                                    }}
                                                    value={yearTo ? yearTo.toString() : undefined}
                                                >
                                                    <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                                                        <SelectValue placeholder="Year" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((year, idx) => (
                                                            <SelectItem key={idx} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={monthFrom}
                                            month={monthFrom}
                                            onMonthChange={setMonthFrom}
                                            selected={date}
                                            onSelect={handleDateSelect}
                                            numberOfMonths={numberOfMonths}
                                            showOutsideDays={false}
                                            className={cn(calendarClassName)}
                                        />
                                    </div>
                                    {withTime && (
                                        <div className="time-picker">
                                            <div className="flex flex-col gap-2 md:flex-row md:gap-4 w-full">
                                                {renderTimePicker('from')}
                                                {numberOfMonths === 2 && renderTimePicker('to')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    )}
                </Popover>
            </>
        );
    }
);

CalendarDatePicker.displayName = "CalendarDatePicker";
