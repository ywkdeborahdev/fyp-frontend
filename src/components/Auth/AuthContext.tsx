import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (auth: boolean) => void;
    userGroup: number | null;
    setUserGroup: (group: number | null) => void;
    username: string | null;
    setUsername: (name: string | null) => void;
    useremail: string | null;
    setUseremail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userGroup, setUserGroup] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [useremail, setUseremail] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setAuthenticated: setIsAuthenticated,
            userGroup,
            setUserGroup,
            username,
            setUsername,
            useremail,
            setUseremail
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};