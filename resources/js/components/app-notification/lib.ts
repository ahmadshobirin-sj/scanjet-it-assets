export const notificationColorResolver = (status: string): any => {
    let intent = 'secondary';
    switch (status) {
        case 'success':
            intent = 'success';
            break;
        case 'error':
            intent = 'destructive';
            break;
        case 'info':
            intent = 'info';
            break;
        case 'warning':
            intent = 'warning';
            break;
        case 'primary':
            intent = 'primary';
            break;
        default:
            intent = 'secondary';
            break;
    }
    return intent;
};
