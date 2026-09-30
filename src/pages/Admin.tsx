import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Gift, RefreshCw, ShieldCheck, ShoppingBag, Users } from 'lucide-react'
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminNav } from '../components/admin/AdminNav'
import { AdminMembershipDistribution } from '../components/admin/AdminMembershipDistribution'
import { AdminOperationalStatus } from '../components/admin/AdminOperationalStatus'
import { AdminRecentActivity } from '../components/admin/AdminRecentActivity'
import { AdminRecentChanges } from '../components/admin/AdminRecentChanges'
import { AdminStatsGrid } from '../components/admin/AdminStatsGrid'
import { adminApi } from '../lib/adminApi'
import type { AdminOverviewResponse, AdminStatItem, RecentProductChangeItem } from '../types/admin'

const Admin = () => {
    const navigate = useNavigate()
    const [overview, setOverview] = useState<AdminOverviewResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await adminApi.getOverview()
            setOverview(data)
        } catch (err) {
            console.error('Failed to load admin overview:', err)
            setError(err instanceof Error ? err.message : 'Ett oväntat fel inträffade vid hämtning av data.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        adminApi.getOverview()
            .then((data) => {
                if (isMounted) {
                    setOverview(data)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load admin overview:', err)
                    setError(err instanceof Error ? err.message : 'Kunde inte läsa in översiktsdata.')
                    setIsLoading(false)
                }
            })
        return () => {
            isMounted = false
        }
    }, [])

    const handleEditChange = (item: RecentProductChangeItem) => {
        navigate(`/admin/products?edit=${item.id}`)
    }

    const statItems: AdminStatItem[] | undefined = useMemo(() => {
        if (!overview) return undefined

        return [
            {
                id: 'users',
                title: 'Totalt antal användare',
                value: overview.stats.totalUsers.toLocaleString('sv-SE'),
                description: `${overview.stats.totalUsers} registrerade konton i systemet`,
                icon: <Users className="size-5 text-primary/70" aria-hidden="true" />,
            },
            {
                id: 'memberships',
                title: 'Aktiva medlemskap',
                value: overview.stats.activeMemberships.toLocaleString('sv-SE'),
                description: `Simple: ${overview.stats.simpleMemberships} - Plus: ${overview.stats.plusMemberships} - Signature: ${overview.stats.signatureMemberships}`,
                icon: <ShieldCheck className="size-5 text-primary/70" aria-hidden="true" />,
            },
            {
                id: 'gifts',
                title: 'Gåvobeställningar',
                value: `${overview.stats.totalOrders} st`,
                description: `${overview.stats.pendingOrders} under packning, ${overview.stats.completedOrders} slutförda`,
                icon: <Gift className="size-5 text-primary/70" aria-hidden="true" />,
            },
            {
                id: 'products',
                title: 'Aktiva produkter',
                value: `${overview.stats.activeProducts} / ${overview.stats.totalProducts}`,
                description: `${overview.stats.activeProducts} i butik, ${overview.stats.categoriesCount} kategorier`,
                icon: <ShoppingBag className="size-5 text-primary/70" aria-hidden="true" />,
            },
        ]
    }, [overview])

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:px-8">
            <AdminBreadcrumbs />

            <AdminHeader />

            <AdminNav />

            {error && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-card border border-warning/30 bg-accent-muted p-5 text-warning sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle className="size-5 shrink-0 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-warning/40 bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-warning hover:text-warning"
                    >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Försök igen
                    </button>
                </div>
            )}

            {isLoading && !overview ? (
                <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-label="Laddar översikt">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-36 rounded-card border border-border bg-surface/60" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                        <div className="h-64 rounded-card border border-border bg-surface/60" />
                        <div className="h-64 rounded-card border border-border bg-surface/60" />
                    </div>
                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                        <div className="h-80 rounded-card border border-border bg-surface/60" />
                        <div className="h-80 rounded-card border border-border bg-surface/60" />
                    </div>
                </div>
            ) : (
                <>
                    <AdminStatsGrid stats={statItems} />

                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                        <AdminMembershipDistribution totalActive={overview?.distribution.totalActive} tiers={overview?.distribution.tiers} />
                        <AdminOperationalStatus metrics={overview?.operationalStatus.metrics} />
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                        <AdminRecentActivity activities={overview?.recentActivity} />
                        <AdminRecentChanges
                            changes={overview?.recentChanges}
                            onEdit={handleEditChange}
                        />
                    </div>
                </>
            )}
        </main>
    )
}

export default Admin
