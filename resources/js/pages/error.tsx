import { Button } from '@/components/ui/button';
import { Wave } from '@/components/wave';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { MoveLeft, RefreshCcw } from 'lucide-react';

const ErrorPage = ({ status }: { status: number }) => {
    const { props } = usePage<SharedData>();
    const title = {
        401: '401: Unauthorized',
        403: '403: Forbidden',
        404: '404: Page Not Found',
        419: '419: Page Expired',
        503: '503: Service Unavailable',
    }[status];

    const description = {
        401: 'Sorry, you are not authorized to access this page. Please login.',
        403: 'Sorry, you are forbidden from accessing this page.',
        404: 'Sorry, the page you are looking for could not be found.',
        419: 'Sorry, your session has expired. Please refresh the page.',
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
    }[status];

    const handleReload = () => {
        window.location.reload();
    };

    const handleBackHome = () => {
        if (props.auth.user) {
            router.visit('/');
        } else {
            router.visit('/login');
        }
    };

    return (
        <div className="relative">
            <Head title={title} />
            <div className="flex h-screen items-center justify-center p-4">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
                    <p className="mt-1 text-base font-medium sm:mt-3">{description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {status === 404 ? (
                            <Button leading={<MoveLeft />} onClick={handleBackHome}>
                                Go back to home
                            </Button>
                        ) : (
                            <>
                                <Button intent="warning" onClick={handleReload} leading={<RefreshCcw />}>
                                    Reload page
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full">
                <Wave backgroundColor="bg-white" waveColor="#004e8c" />
            </div>
        </div>
    );
};

export default ErrorPage;
