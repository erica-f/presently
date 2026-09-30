import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { membershipApi } from '../lib/membershipApi'
import { hasActiveMembership } from './membershipStatus'

export default function MembershipProtectedRoute({ children }: { children: React.ReactNode }) {
    const [allowed, setAllowed] = useState<boolean | null>(null)

    useEffect(() => {
        let mounted = true
        void membershipApi.overview().then((overview) => {
            if (mounted) setAllowed(hasActiveMembership(overview))
        }).catch(() => {
            if (mounted) setAllowed(false)
        })
        return () => { mounted = false }
    }, [])

    if (allowed === null) return <main className="grid min-h-[50vh] flex-1 place-items-center text-sm text-muted-foreground">Kontrollerar medlemskap…</main>
    if (!allowed) return <Navigate to="/register/membership" replace />
    return children
}
