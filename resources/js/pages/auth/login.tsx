import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

export default function Login() {
    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <Button asChild intent="primary" variant="fill">
                <a href={route('authorize')}>Login with your Microsoft Account</a>
            </Button>
        </AuthLayout>
    );
}
