import { createContext, useContext, useState, useEffect } from 'react'
import type { AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    loading: true,
    login: () => { },
    logout: () => { },
    checkStatus: async () => { }
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/session', { credentials: 'include' });
            const data = await res.json();
            setIsLoggedIn(data.loggedIn ?? false);
        } catch {
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };
    const login = () => {
        setIsLoggedIn(true);
    }
    const logout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        setIsLoggedIn(false);
    }
    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ loading, isLoggedIn, login, logout, checkStatus }}>
            {children}
        </AuthContext.Provider>
    )


}

export default AuthProvider

export const useAuth = () => {
    return useContext(AuthContext)
}
