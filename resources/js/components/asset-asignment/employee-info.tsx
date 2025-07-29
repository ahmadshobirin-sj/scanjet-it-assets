import { Badge } from '@/components/ui/badge';
import { InfoList, InfoListContainer, InfoListContent, InfoListGroup, InfoListLabel } from '@/components/ui/info-list';
import { cn } from '@/lib/utils';
import { FC } from 'react';

interface EmployeeInfoProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string;
    job_title?: string;
    email?: string;
}

const EmployeeInfo: FC<EmployeeInfoProps> = ({ name, job_title, email, className, ...props }) => {
    return (
        <div className={cn('rounded-md border p-4', className)} {...props}>
            <InfoListContainer hasGroups>
                <InfoListGroup title="Employee information" columns={2}>
                    <InfoList direction="column">
                        <InfoListLabel>Name</InfoListLabel>
                        <InfoListContent>{name || '-'}</InfoListContent>
                    </InfoList>
                    <InfoList direction="column">
                        <InfoListLabel>Job title</InfoListLabel>
                        <InfoListContent>
                            <Badge intent="info" variant="light">
                                {job_title || 'N/A'}
                            </Badge>
                        </InfoListContent>
                    </InfoList>
                    <InfoList direction="column">
                        <InfoListLabel>Email</InfoListLabel>
                        <InfoListContent>{email}</InfoListContent>
                    </InfoList>
                </InfoListGroup>
            </InfoListContainer>
        </div>
    );
};

export default EmployeeInfo;
