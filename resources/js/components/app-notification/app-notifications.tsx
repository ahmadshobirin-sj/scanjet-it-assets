import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useNotificationStore from '@/stores/use-notification-store';
import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { AppNotificationItem } from './app-notification-item';
import { notificationColorResolver } from './lib';

const AppNotifications = () => {
    const { unreadNotificationsCount, notifications } = useNotificationStore();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-6" />
                    <span className="rounded-ful absolute top-0 right-1.5 inline-flex h-4 w-auto min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-4xl bg-destructive px-1 text-xs text-white">
                        <span className="sr-only">Notifications</span>
                        <span>{unreadNotificationsCount}</span>
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full overflow-hidden p-0 sm:w-96">
                <div className="flex w-full flex-col justify-between gap-2 border-b px-4 py-3 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <p className="text-xs text-gray-500">
                            You can view recent temporary updates here. For full history, visit the Notifications page.
                        </p>
                    </div>
                    <div>
                        <Button asChild variant="fill" size="sm">
                            <Link href="/notifications">View All</Link>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col divide-y">
                    {notifications.length === 0 && <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>}
                    {notifications.length > 0 &&
                        notifications.map((notification) => (
                            <AppNotificationItem
                                key={notification.id}
                                message={notification.message}
                                description={notification.description}
                                intent={notificationColorResolver(notification.status)}
                                url={notification.url}
                                isFloating={false}
                            />
                        ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AppNotifications;
