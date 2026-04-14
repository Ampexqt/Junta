import React, { useState, createContext, useContext } from 'react';
import { AuthContextType, UserRole } from './types';

export type { UserRole };

const AuthContext = createContext<AuthContextType>({
    role: 'participant',
    setRole: () => { /* Default role setter */ },
    userName: 'Juan Dela Cruz',
    setUserName: () => { /* Default userName setter */ },
    logout: () => { /* Default logout */ }
});


export function AuthProvider({ children }: { children: React.ReactNode; }) {

    const [role, setRoleState] = useState<UserRole>(() => {
        const storedRole = localStorage.getItem('user_role');
        if (storedRole) return storedRole as UserRole;
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                return user.role || 'participant';
            } catch (e) {
                return 'participant';
            }
        }
        return 'participant';
    });

    const [userName, setUserNameState] = useState(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) return storedName;

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                return user.displayName || user.name || 'Juan Dela Cruz';
            } catch (e) {
                return 'Juan Dela Cruz';
            }
        }
        return 'Juan Dela Cruz';
    });


    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem('user_role', newRole);
    };

    const setUserName = (newName: string) => {
        setUserNameState(newName);
        localStorage.setItem('user_name', newName);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        setRoleState('participant');
        setUserNameState('Juan Dela Cruz');
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                setRole,
                userName,
                setUserName,
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
