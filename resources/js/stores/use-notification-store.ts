import { AppNotification } from '@/types/model';
import { create } from 'zustand';

interface NotificationStore {
    unreadNotificationsCount: number;
    setUnreadNotificationsCount: (count: number) => void;
    incrementUnreadNotificationsCount: (inc?: number) => void;
    notifications: AppNotification[];
    setNotifications: (notification: AppNotification) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadNotificationsCount: 0,
    setUnreadNotificationsCount: (count: number) => set({ unreadNotificationsCount: count }),
    incrementUnreadNotificationsCount: (inc = 1) => set((state) => ({ unreadNotificationsCount: state.unreadNotificationsCount + inc })),
    setNotifications: (notification: AppNotification) => set((state) => ({ notifications: [...state.notifications, notification] })),
}));

export default useNotificationStore;
