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
        setLoading(true);
        const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        if (response.status == 500) {
            console.log("Unable to log out: " + response.status);
            alert('Utloggning misslyckades.')
        } else if (response.status == 401) {
            alert('Ingen aktiv inloggning hittad');
        } else {
            setIsLoggedIn(false);
        }
        setLoading(false);
    }
    const flagLoggedOut = () => {
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
        <AuthContext.Provider value={{ loading, isLoggedIn, login, logout, flagLoggedOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider