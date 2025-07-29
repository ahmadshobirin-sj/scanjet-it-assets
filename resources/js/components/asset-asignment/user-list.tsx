import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const UserList = ({ name, email, job_title }: { name?: string; email?: string; job_title?: string }) => {
    return (
        <div className="flex w-full items-center gap-2">
            <Badge size="md" className="p-1.5" intent="info" variant="light">
                <User className="!size-4" />
            </Badge>
            <div className="flex flex-1 flex-col">
                <span className="font-semibold">{name || '-'}</span>
                <span className="text-xs text-muted-foreground">{email || '-'}</span>
            </div>
            <div>
                <Badge intent="info" variant="light">
                    {job_title || 'N/A'}
                </Badge>
            </div>
        </div>
    );
};

export default UserList;
