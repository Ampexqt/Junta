export type UserRole = 'participant' | 'organizer' | 'admin';

export type AuthContextType = {
    role: UserRole;
    setRole: (role: UserRole) => void;
    userName: string;
    setUserName: (name: string) => void;
    uid: string | null;
    logout: () => void;
};
