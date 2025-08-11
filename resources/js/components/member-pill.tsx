import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import React, { memo, useMemo } from 'react';

interface UserDetail {
    label: string;
    value: string | React.ReactNode;
}

const memberPillVariants = cva(
    'cursor-pointer inline-flex items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            intent: {
                primary: 'focus:ring-primary',
                secondary: 'focus:ring-secondary',
                destructive: 'focus:ring-destructive',
                warning: 'focus:ring-warning',
                success: 'focus:ring-success',
                info: 'focus:ring-info',
            },
            variant: {
                fill: '',
                outline: '',
                light: '',
                ghost: '',
            },
            size: {
                sm: 'px-2 py-1 text-xs',
                md: 'px-3 py-1.5 text-sm',
                lg: 'px-4 py-2 text-base',
            },
        },
        compoundVariants: [
            // Fill styles
            {
                intent: 'primary',
                variant: 'fill',
                className: 'bg-primary text-primary-foreground hover:bg-primary/90',
            },
            {
                intent: 'secondary',
                variant: 'fill',
                className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            },
            {
                intent: 'destructive',
                variant: 'fill',
                className: 'bg-destructive text-white hover:bg-destructive/90',
            },
            {
                intent: 'warning',
                variant: 'fill',
                className: 'bg-warning text-white hover:bg-warning/90',
            },
            {
                intent: 'success',
                variant: 'fill',
                className: 'bg-success text-white hover:bg-success/90',
            },
            {
                intent: 'info',
                variant: 'fill',
                className: 'bg-info text-white hover:bg-info/90',
            },

            // Outline styles
            {
                intent: 'primary',
                variant: 'outline',
                className: 'border border-primary text-primary bg-transparent hover:bg-primary/10',
            },
            {
                intent: 'secondary',
                variant: 'outline',
                className: 'border border-secondary text-secondary-foreground bg-transparent hover:bg-secondary/10',
            },
            {
                intent: 'destructive',
                variant: 'outline',
                className: 'border border-destructive text-destructive bg-transparent hover:bg-destructive/10',
            },
            {
                intent: 'warning',
                variant: 'outline',
                className: 'border border-warning text-warning hover:bg-warning/5',
            },
            {
                intent: 'success',
                variant: 'outline',
                className: 'border border-success text-success hover:bg-success/5',
            },
            {
                intent: 'info',
                variant: 'outline',
                className: 'border border-info text-info hover:bg-info/5',
            },

            // Light styles
            {
                intent: 'primary',
                variant: 'light',
                className: 'bg-primary/10 border-primary text-primary hover:bg-primary/20',
            },
            {
                intent: 'secondary',
                variant: 'light',
                className: 'bg-secondary/10 border-secondary text-secondary-foreground hover:bg-secondary/20',
            },
            {
                intent: 'destructive',
                variant: 'light',
                className: 'bg-destructive/10 border-desctructive text-destructive hover:bg-destructive/20',
            },
            {
                intent: 'warning',
                variant: 'light',
                className: 'bg-warning/10 border-warning text-warning hover:bg-warning/20',
            },
            {
                intent: 'success',
                variant: 'light',
                className: 'bg-success/10 border-success text-success hover:bg-success/20',
            },
            {
                intent: 'info',
                variant: 'light',
                className: 'bg-info/10 border-info text-info hover:bg-info/20',
            },

            // Ghost styles
            {
                intent: 'primary',
                variant: 'ghost',
                className: 'text-primary hover:bg-primary/10',
            },
            {
                intent: 'secondary',
                variant: 'ghost',
                className: 'text-secondary-foreground hover:bg-secondary/10',
            },
            {
                intent: 'destructive',
                variant: 'ghost',
                className: 'text-destructive hover:bg-destructive/10',
            },
            {
                intent: 'warning',
                variant: 'ghost',
                className: 'text-warning hover:bg-warning/10',
            },
            {
                intent: 'success',
                variant: 'ghost',
                className: 'text-success hover:bg-success/10',
            },
            {
                intent: 'info',
                variant: 'ghost',
                className: 'text-info hover:bg-info/10',
            },
        ],
        defaultVariants: {
            intent: 'primary',
            variant: 'outline',
            size: 'md',
        },
    },
);

interface MemberPillProps extends React.HTMLAttributes<HTMLButtonElement>, VariantProps<typeof memberPillVariants> {
    user: UserDetail[];
    text: string;
    avatarUrl?: string;
    showText?: boolean;
    className?: string;
    transform?: (detail: UserDetail, key: string) => Partial<UserDetail>;
}

const MemberPillComponent: React.FC<MemberPillProps> = ({
    user,
    text,
    avatarUrl,
    showText = true,
    className,
    intent,
    variant,
    size,
    transform,
    ...props
}) => {
    const initials = useInitials();

    const transformedUser = useMemo(
        () =>
            user.map((detail) => {
                if (!transform) return detail;

                const transformedValue = transform(detail, detail.label.toString());
                return {
                    ...detail,
                    ...transformedValue,
                };
            }),
        [user, transform],
    );

    const avatarInitials = useMemo(() => initials(text || 'User'), [text, initials]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className={cn(memberPillVariants({ intent, variant, size, className }))} {...props}>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={avatarUrl} alt={typeof text === 'string' ? text : 'User avatar'} />
                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">{avatarInitials}</AvatarFallback>
                    </Avatar>
                    {showText && text && <span className="ml-2 text-sm font-medium">{text}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="sm:w-80" align="start">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 border-b pb-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl} alt={typeof text === 'string' ? text : 'User avatar'} />
                            <AvatarFallback className="bg-muted text-base text-muted-foreground">{avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div>{text && typeof text === 'string' && <h4 className="text-sm font-semibold">{text}</h4>}</div>
                    </div>

                    {transformedUser && transformedUser.length > 0 && (
                        <div className="space-y-2">
                            {transformedUser.map((detail, index) => (
                                <div key={index} className="grid grid-cols-2 justify-between gap-2 text-sm break-words">
                                    <span className="text-muted-foreground">{detail.label}</span>
                                    {typeof detail.value === 'string' ? <span className="font-medium">{detail.value || '-'}</span> : detail.value}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const MemberPill = memo(MemberPillComponent);

export default MemberPill;
