import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'participant' | 'organizer' | 'admin';

export type UserProfile = {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    phone?: string;
    organizationName?: string;
    isVerified?: boolean;
    gender?: string;
    birthday?: string;
    photoURL?: string;
    kycStatus?: 'pending' | 'verified' | 'rejected' | 'none';
    validIdUrl?: string;
    selfieUrl?: string;
    lastOrgNameUpdate?: string;
    organizationLogo?: string;
    
    // Gamification - Participant
    xp?: number;
    level?: number;
    badges?: string[];
    streak?: number;
    
    // Gamification - Organizer
    organizerPoints?: number;
    organizerTier?: number;
    organizerBadges?: string[];
};

export type AuthContextType = {
    role: UserRole;
    setRole: (role: UserRole) => void;
    userName: string;
    setUserName: (name: string) => void;
    uid: string | null;
    setUid: (uid: string | null) => void;
    user: FirebaseUser | null;
    profile: UserProfile | null;
    logout: () => void;
};
