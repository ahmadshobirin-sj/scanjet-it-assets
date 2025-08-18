import { AppNotificationItem, AppNotificationItemProps } from '@/components/app-notification/app-notification-item';
import { toast as sonnerToast } from 'sonner';

type ToastProps = Omit<AppNotificationItemProps, 'keyToast' | 'toast'>;

const AppToast = (props: ToastProps) => {
    return sonnerToast.custom((id) => <AppNotificationItem keyToast={id} toast={sonnerToast} {...props} />);
};

export default AppToast;
