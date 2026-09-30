import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/useAuth'
import { profileApi } from '../lib/profileApi'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const auth = useAuth()
    const [profileIsAdmin, setProfileIsAdmin] = useState(false)
    const [hasCheckedProfile, setHasCheckedProfile] = useState(false)

    useEffect(() => {
        let isCurrent = true

        if (!auth.isAdmin && auth.isLoggedIn) {
            void profileApi
                .get()
                .then((profile) => {
                    if (!isCurrent) return
                    if (profile.user.role === 'admin') setProfileIsAdmin(true)
                })
                .catch(() => undefined)
                .finally(() => {
                    if (isCurrent) setHasCheckedProfile(true)
                })
        }

        return () => {
            isCurrent = false
        }
    }, [auth.isAdmin, auth.isLoggedIn])

    const isVerifying = !auth.isAdmin && auth.isLoggedIn && !hasCheckedProfile
    const hasAdminAccess = auth.isAdmin || profileIsAdmin

    if (auth.loading || isVerifying) {
        return (
            <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center py-24 text-muted-foreground">
                <p role="status">Verifierar administratörsbehörighet…</p>
            </main>
        )
    }

    if (!auth.isOnline) {
        return (
            <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
                <div className="rounded-card border border-border bg-surface p-8 shadow-card">
                    <WifiOff className="mx-auto size-10 text-warning" aria-hidden="true" />
                    <h1 className="mt-4 text-2xl font-bold text-foreground font-heading">
                        Du är offline
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Du måste vara ansluten till internet för att administrera systemet. Kontrollera din nätverksanslutning och försök igen.
                    </p>
                    <Button className="mt-6" onClick={() => window.location.reload()}>
                        Försök igen
                    </Button>
                </div>
            </main>
        )
    }

    if (!auth.isLoggedIn) return <Navigate to="/login" replace />
    if (!hasAdminAccess) return <Navigate to="/" replace />

    return <>{children}</>
}
