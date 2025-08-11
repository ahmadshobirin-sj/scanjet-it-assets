import { InfoList, InfoListContainer, InfoListContent, InfoListLabel } from '@/components/ui/info-list';
import { formatWithBrowserTimezone } from '@/lib/date';
import { cn } from '@/lib/utils';
import { FC } from 'react';

interface AssignmentDetails extends React.HTMLAttributes<HTMLDivElement> {
    assignAt?: string;
    returnAt?: string;
    notes?: string;
}

const AssignmentDetails: FC<AssignmentDetails> = ({ assignAt, returnAt, notes, className, ...props }) => {
    return (
        <div className={cn('rounded-md border p-4', className)} {...props}>
            <InfoListContainer columns={2}>
                {assignAt && (
                    <InfoList direction="column">
                        <InfoListLabel>Assigned At</InfoListLabel>
                        <InfoListContent>{formatWithBrowserTimezone(assignAt)}</InfoListContent>
                    </InfoList>
                )}
                {returnAt && (
                    <InfoList direction="column">
                        <InfoListLabel>Returned At</InfoListLabel>
                        <InfoListContent>{formatWithBrowserTimezone(returnAt)}</InfoListContent>
                    </InfoList>
                )}
                <InfoList direction="column">
                    <InfoListLabel>Notes</InfoListLabel>
                    <InfoListContent>{notes || '-'}</InfoListContent>
                </InfoList>
            </InfoListContainer>
        </div>
    );
};

export default AssignmentDetails;
