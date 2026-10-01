import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { membershipApi } from '../lib/membershipApi'
import { Button } from '../components/Button'

export default function MembershipProtectedRoute({ children }: { children: React.ReactNode }) {
    const [allowed, setAllowed] = useState<boolean | null>(null)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let mounted = true
        void membershipApi.status().then((status) => {
            if (mounted) setAllowed(status.active)
        }).catch(() => {
            if (mounted) setError('Medlemskapet kunde inte kontrolleras. Kontrollera anslutningen och försök igen.')
        })
        return () => { mounted = false }
    }, [attempt])

    if (allowed === null && error) return <main className="grid min-h-[50vh] flex-1 place-content-center justify-items-center gap-4 text-sm text-muted-foreground"><p role="alert">{error}</p><Button variant="secondary" onClick={() => { setError(''); setAttempt((value) => value + 1) }}>Försök igen</Button></main>
    if (allowed === null) return <main className="grid min-h-[50vh] flex-1 place-items-center text-sm text-muted-foreground">Kontrollerar medlemskap…</main>
    if (!allowed) return <Navigate to="/register/membership" replace />
    return children
}
