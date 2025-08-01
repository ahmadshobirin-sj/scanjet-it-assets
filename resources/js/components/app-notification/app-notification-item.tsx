import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { cva } from 'class-variance-authority';
import { AlertTriangle, Bell, CheckCircle, Circle, Info, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type AppNotificationType = 'success' | 'destructive' | 'info' | 'warning' | 'primary' | 'secondary';

type AppNotificationEvent = {
    name: string;
    intent?: AppNotificationType;
    onClick?: (transformIsRead: () => void, transformIsUnread: () => void) => void | Promise<void>;
};

interface AppNotificationItemProps {
    message: string;
    description?: string;
    datetime?: string;
    icon?: React.ReactNode;
    events?: AppNotificationEvent[];
    intent?: AppNotificationType;
    isFloating?: boolean;
    isRead?: boolean;
    cancelButton?: boolean;
    keyToast?: string | number;
    toast?: typeof toast;
    url?: string | null;
    duration?: number;
    markAsRead?: () => void | Promise<void>;
    markAsUnread?: () => void | Promise<void>;
    className?: string;
}

const notificationStyles = cva('flex items-center gap-2 p-3 bg-background', {
    variants: {
        intent: {
            success: '',
            destructive: '',
            info: '',
            warning: '',
            primary: '',
            secondary: '',
        },
    },
    defaultVariants: {
        intent: 'primary',
    },
});

const AppNotificationItemButton = cva(
    'inline-flex items-center cursor-pointer justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-xs',
    {
        variants: {
            intent: {
                success: 'text-success hover:text-success/80',
                destructive: 'text-destructive hover:text-destructive/80',
                info: 'text-info hover:text-info/80',
                warning: 'text-warning hover:text-warning/80',
                primary: 'text-primary hover:text-primary/80',
                secondary: 'text-secondary hover:text-secondary/80',
            },
        },
        defaultVariants: {
            intent: 'primary',
        },
    },
);

const iconWrapperStyles = cva('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center', {
    variants: {
        intent: {
            success: 'bg-success/10 text-success',
            destructive: 'bg-destructive/10 text-destructive',
            info: 'bg-info/10 text-info',
            warning: 'bg-warning/10 text-warning',
            primary: 'bg-primary/10 text-primary',
            secondary: 'bg-secondary text-secondary-foreground',
        },
    },
    defaultVariants: {
        intent: 'primary',
    },
});

const defaultIcons = {
    success: <CheckCircle className="size-4" />,
    destructive: <XCircle className="size-4" />,
    info: <Info className="size-4" />,
    warning: <AlertTriangle className="size-4" />,
    primary: <Bell className="size-4" />,
    secondary: <Circle className="size-4" />,
};

export const AppNotificationItem: React.FC<AppNotificationItemProps> = ({
    message,
    description,
    datetime,
    icon,
    events = [],
    intent,
    isFloating = true,
    toast,
    keyToast,
    cancelButton = false,
    url,
    duration,
    isRead = false,
    markAsRead,
    markAsUnread,
    className,
}) => {
    const [hasRead, setHasRead] = useState(isRead);

    const transformIsRead = () => {
        if (!hasRead) setHasRead(true);
    };

    const transformIsUnread = () => {
        if (hasRead) setHasRead(false);
    };

    const internalEvents = useMemo<AppNotificationEvent[]>(() => {
        const allEvents = [...events];
        if (!hasRead && markAsRead) {
            allEvents.push({
                name: 'Mark as Read',
                intent: 'success',
                onClick: async () => {
                    await markAsRead();
                    setHasRead(true);
                },
            });
        }
        if (hasRead && markAsUnread) {
            allEvents.push({
                name: 'Mark as Unread',
                intent: 'warning',
                onClick: async () => {
                    await markAsUnread();
                    setHasRead(false);
                },
            });
        }
        return allEvents;
    }, [events, hasRead, markAsRead, markAsUnread]);

    const [loadingStates, setLoadingStates] = useState<boolean[]>(Array(internalEvents.length).fill(false));

    useEffect(() => {
        setLoadingStates(Array(internalEvents.length).fill(false));
    }, [internalEvents.length]);

    // Auto-dismiss toast after duration if no event is loading or clicked
    useEffect(() => {
        if (!isFloating) return;
        if (!duration) return;

        // If any event is loading, do not auto-dismiss
        if (loadingStates.some((loading) => loading)) return;

        const timer = setTimeout(() => {
            toast?.dismiss(keyToast);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, loadingStates, toast, keyToast]);

    const handleButtonClick = async (event: AppNotificationEvent, index: number) => {
        if (!event.onClick) return;

        setLoadingStates((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });

        try {
            const result = event.onClick(transformIsRead, transformIsUnread);
            if (result instanceof Promise) await result;
        } catch (error) {
            console.error('Error executing button action:', error);
        } finally {
            setLoadingStates((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });

            setTimeout(() => {
                toast?.dismiss(keyToast);
            }, 300);
        }
    };

    const notificationIntent = intent || 'primary';
    const displayIcon = icon || defaultIcons[notificationIntent];

    return (
        <div
            className={notificationStyles({
                intent: notificationIntent,
                className: cn(
                    isFloating && 'min-w-80 rounded-md shadow-sm transition-all hover:shadow-md',
                    !isFloating && 'rounded-none shadow-none',
                    (description || internalEvents.length > 0 || url) && 'items-start',
                    !isFloating ? markAsRead && !hasRead && 'border-l-3 border-info bg-info/5' : '',
                    className,
                ),
            })}
        >
            {cancelButton && (
                <button
                    className="absolute -top-1 -left-1.5 cursor-pointer rounded-full bg-white text-gray-500 hover:text-gray-700"
                    onClick={() => toast?.dismiss(keyToast)}
                >
                    <XCircle className="size-4" />
                </button>
            )}

            <div className={iconWrapperStyles({ intent: notificationIntent })}>{displayIcon}</div>

            <div className="flex-1">
                <h4 className={cn('text-sm', description && 'font-semibold')}>{message}</h4>

                {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
                {datetime && <p className="mt-2 text-xs text-gray-500">{datetime}</p>}

                {(url || internalEvents.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {url && (
                            <Link href={url} target="_blank" rel="noopener noreferrer" className={AppNotificationItemButton({ intent: 'info' })}>
                                Show Details
                            </Link>
                        )}
                        {internalEvents.map((event, index) => {
                            // hide "Mark as Read" if already read
                            if (hasRead && event.name.toLowerCase().includes('mark as read')) return null;
                            // hide "Mark as Unread" if not read
                            if (!hasRead && event.name.toLowerCase().includes('mark as unread')) return null;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleButtonClick(event, index)}
                                    disabled={loadingStates[index]}
                                    className={AppNotificationItemButton({ intent: event.intent })}
                                >
                                    {loadingStates[index] ? 'Loading...' : event.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
