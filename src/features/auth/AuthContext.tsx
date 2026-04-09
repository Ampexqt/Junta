import React, { useState, createContext, useContext } from 'react';
import { AuthContextType, UserRole } from './types';

export type { UserRole };

const AuthContext = createContext<AuthContextType>({
    role: 'participant',
    setRole: () => { /* Default role setter */ },
    userName: 'Juan Dela Cruz',
    setUserName: () => { /* Default userName setter */ }
});


export function AuthProvider({ children }: { children: React.ReactNode; }) {
    const [role, setRole] = useState<UserRole>('participant');
    const [userName, setUserName] = useState('Juan Dela Cruz');

    return (
        <AuthContext.Provider
            value={{
                role,
                setRole,
                userName,
                setUserName
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
