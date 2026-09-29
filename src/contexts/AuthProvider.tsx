import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [role, setRole] = useState<string | null>(null)
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true)
    const [loading, setLoading] = useState(true)
    const [authCheckCounter, setAuthCheckCounter] = useState(0)

    const login = () => {
        setAuthCheckCounter((count) => count + 1)
    }

    const logout = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' })
            if (response.status === 500) {
                console.log('Unable to log out: ' + response.status)
                alert('Utloggning misslyckades.')
            } else if (response.status === 401) {
                alert('Ingen aktiv inloggning hittad')
            } else {
                setIsLoggedIn(false)
                setIsAdmin(false)
                setRole(null)
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setLoading(false)
        }
    }

    const flagLoggedOut = () => {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setRole(null)
    }

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        let isCurrent = true

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/session', { credentials: 'include' })
                if (!res.ok) {
                    if (isCurrent) {
                        setIsLoggedIn(false)
                        setIsAdmin(false)
                        setRole(null)
                    }
                    return
                }
                const data = await res.json()
                if (!isCurrent) return

                const loggedIn = Boolean(data.loggedIn)
                let userRole = (data.role ?? (data.isAdmin ? 'admin' : null)) as string | null

                if (loggedIn && userRole !== 'admin') {
                    try {
                        const profileRes = await fetch('/api/profile', { credentials: 'include' })
                        if (profileRes.ok) {
                            const profileData = await profileRes.json()
                            if (profileData?.user?.role) userRole = profileData.user.role
                        }
                    } catch { /* empty */ }
                }

                if (isCurrent) {
                    const finalRole = userRole ?? 'user'
                    const isUserAdmin = loggedIn && (finalRole === 'admin' || Boolean(data.isAdmin))
                    setIsLoggedIn(loggedIn)
                    setRole(loggedIn ? finalRole : null)
                    setIsAdmin(isUserAdmin)
                }
            } catch {
                if (isCurrent) {
                    setIsLoggedIn(false)
                    setIsAdmin(false)
                    setRole(null)
                }
            } finally {
                if (isCurrent) {
                    setLoading(false)
                }
            }
        }

        void checkStatus()

        return () => {
            isCurrent = false
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [authCheckCounter])

    return (
        <AuthContext.Provider
            value={{
                loading,
                isLoggedIn,
                isAdmin,
                role,
                isOnline,
                login,
                logout,
                flagLoggedOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider