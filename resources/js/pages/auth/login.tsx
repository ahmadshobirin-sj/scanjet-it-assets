import { Head, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';


export default function Login() {

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <Button asChild intent="primary" variant="fill">
                <a href={route('connect')}>Login with your Microsoft Account</a>
            </Button>
        </AuthLayout>
    );
}
