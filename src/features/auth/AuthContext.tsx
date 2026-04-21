import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { AuthContextType, UserRole, UserProfile } from './types';
export type { UserRole, UserProfile, AuthContextType };
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext<AuthContextType>({
    role: 'participant',
    setRole: () => undefined,
    userName: 'Traveler',
    setUserName: () => undefined,
    uid: null,
    setUid: () => undefined,
    user: null,
    profile: null,
    logout: () => Promise.resolve()
} as AuthContextType);

const KEYS = {
    ROLE: 'junta_user_role',
    NAME: 'junta_user_name',
    UID: 'junta_user_uid',
    PROFILE: 'junta_user_profile'
};

export function AuthProvider({ children }: { children: React.ReactNode; }) {
    const [user] = useState<FirebaseUser | null>(null);
    const isFirstLoad = useRef(true);
    
    // 1. Immediate Hydration from Cache
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        try {
            const saved = localStorage.getItem(KEYS.PROFILE);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    
    const [role, setRoleState] = useState<UserRole>(() => {
        return (localStorage.getItem(KEYS.ROLE) as UserRole) || 'participant';
    });
    
    const [userName, setUserNameState] = useState(() => {
        return localStorage.getItem(KEYS.NAME) || 'Traveler';
    });
    
    const [uid, setUidState] = useState<string | null>(() => {
        return localStorage.getItem(KEYS.UID) || null;
    });

    // Firestore Profile Listener
    useEffect(() => {
        if (!uid) {
            if (!isFirstLoad.current) {
                clearAuthData();
            }
            isFirstLoad.current = false;
            return;
        }

        const profileRef = doc(db, 'users', uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const profileData = {
                    ...data,
                    organizationName: data.organizationName || data.orgName || ''
                } as UserProfile;
                const fullName = `${profileData.firstName} ${profileData.lastName}`;
                
                setProfile(profileData);
                setRoleState(profileData.role || 'participant');
                setUserNameState(fullName);
                
                localStorage.setItem(KEYS.PROFILE, JSON.stringify(profileData));
                localStorage.setItem(KEYS.ROLE, profileData.role);
                localStorage.setItem(KEYS.NAME, fullName);
            }
            isFirstLoad.current = false;
        }, (error) => {
            console.error("Firestore Profile Error:", error);
            isFirstLoad.current = false;
        });
        
        return () => unsubscribeProfile();
    }, [uid]);

    const clearAuthData = () => {
        setProfile(null);
        setRoleState('participant');
        setUserNameState('Traveler');
        setUidState(null);
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    };

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem(KEYS.ROLE, newRole);
    };

    const setUserName = (newName: string) => {
        setUserNameState(newName);
        localStorage.setItem(KEYS.NAME, newName);
    };

    const setUid = (newUid: string | null) => {
        setUidState(newUid);
        if (newUid) localStorage.setItem(KEYS.UID, newUid);
        else localStorage.removeItem(KEYS.UID);
    }

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (e) {
            console.error("Signout error:", e);
        }
        localStorage.clear();
        clearAuthData();
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                setRole,
                userName,
                setUserName,
                uid,
                setUid,
                user,
                profile,
                logout
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
