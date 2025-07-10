import { UserRole } from "@/types/model";

export class UserRoleStyle {
    static getIntent(role: UserRole): string {
        switch (role) {
            case 'Admin':
                return 'success';
            case 'Super Admin':
                return 'primary';
            case 'Inactive':
                return 'secondary';
            default:
                return 'warning';
        }
    }
}
