import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = () => {
        setLoading(false);
        setIsLoggedIn(true);
    }
    const logout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        setLoading(false);
        setIsLoggedIn(false);
    }

    useEffect(() => {
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
        checkStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ loading, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider