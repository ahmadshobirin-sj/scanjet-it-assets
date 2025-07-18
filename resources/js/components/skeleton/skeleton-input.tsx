import { GroupFormField, GroupFormItem } from '@/components/ui/group-form'
import { Skeleton } from '@/components/ui/skeleton'
import { FC } from 'react';

type SkeletonInputProps = {
    withLabel?: boolean;
}
const SkeletonInput: FC<SkeletonInputProps> = ({ withLabel = true }) => {
    return (
        <GroupFormItem>
            <GroupFormField>
                {
                    withLabel ? <Skeleton className="h-3 w-[180px] rounded-sm" /> : null
                }

                <Skeleton className="h-9 rounded-sm" />
            </GroupFormField>
        </GroupFormItem>
    )
}

export default SkeletonInput
