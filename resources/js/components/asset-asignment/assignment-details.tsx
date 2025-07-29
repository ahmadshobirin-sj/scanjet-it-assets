import { InfoList, InfoListContainer, InfoListContent, InfoListLabel } from '@/components/ui/info-list';
import { formatWithBrowserTimezone } from '@/lib/date';
import { cn } from '@/lib/utils';
import { FC } from 'react';

interface AssignmentDetails extends React.HTMLAttributes<HTMLDivElement> {
    assignAt?: string;
    notes?: string;
}

const AssignmentDetails: FC<AssignmentDetails> = ({ assignAt, notes, className, ...props }) => {
    return (
        <div className={cn('rounded-md border p-4', className)} {...props}>
            <InfoListContainer columns={2}>
                <InfoList direction="column">
                    <InfoListLabel>Assignment Date</InfoListLabel>
                    <InfoListContent>{assignAt ? formatWithBrowserTimezone(assignAt) : '-'}</InfoListContent>
                </InfoList>
                <InfoList direction="column">
                    <InfoListLabel>Notes</InfoListLabel>
                    <InfoListContent>{notes || '-'}</InfoListContent>
                </InfoList>
            </InfoListContainer>
        </div>
    );
};

export default AssignmentDetails;
