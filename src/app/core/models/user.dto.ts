export type UserRole = 'Salesperson' | 'Store Manager' | 'System Admin';

export interface UserDto {
    email: string;
    role: UserRole;
    token: string;
}