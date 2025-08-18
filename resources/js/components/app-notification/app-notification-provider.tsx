import useNotificationStore from '@/stores/use-notification-store';
import { SharedData } from '@/types';
import { Page } from '@inertiajs/core';
import { useEchoNotification } from '@laravel/echo-react';
import { FC, useEffect } from 'react';
import AppToast from '../toast';
import { notificationColorResolver } from './lib';

type AppNotificationProviderProps = Page<SharedData>;

const AppNotificationProvider: FC<AppNotificationProviderProps> = (props) => {
    if (!props.props.auth || !props.props.auth.user) {
        return null;
    }

    return <EchoNotificationHandler {...props} />;
};

const EchoNotificationHandler: FC<AppNotificationProviderProps> = ({ props }) => {
    const { unreadNotificationsCount, auth } = props;
    const { setUnreadNotificationsCount, incrementUnreadNotificationsCount, setNotifications } = useNotificationStore();

    const { leaveChannel } = useEchoNotification(
        `App.Models.User.${auth.user.id}`,
        (notification: any) => {
            if (notification.type === 'App\\Notifications\\AppNotification') {
                incrementUnreadNotificationsCount();
                setNotifications(notification);
            }

            AppToast({
                intent: notificationColorResolver(notification.status),
                message: notification.message,
                description: notification.description,
                isFloating: true,
                duration: 3000,
            });
        },
        ['App.Notifications.AppNotification', 'App.Notifications.AppErrorNotification'],
    );

    useEffect(() => {
        setUnreadNotificationsCount(unreadNotificationsCount);

        return () => {
            leaveChannel();
        };
    }, [unreadNotificationsCount, setUnreadNotificationsCount, leaveChannel]);

    return null;
};

export default AppNotificationProvider;
