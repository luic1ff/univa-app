export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
    email: string;
    emailVerifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
