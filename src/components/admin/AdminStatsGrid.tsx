import { Gift, ShieldCheck, ShoppingBag, Users } from 'lucide-react'
import type { AdminStatItem, AdminStatsGridProps } from '../../types/admin'

const defaultStats: AdminStatItem[] = [
    {
        id: 'users',
        title: 'Totalt antal användare',
        value: '1 248',
        description: 'Registrerade konton i systemet',
        icon: <Users className="size-5 text-primary/70" aria-hidden="true" />,
    },
    {
        id: 'memberships',
        title: 'Aktiva medlemskap',
        value: '982',
        description: 'Simple: 512 - Plus: 348 - Signature: 122',
        icon: <ShieldCheck className="size-5 text-primary/70" aria-hidden="true" />,
    },
    {
        id: 'gifts',
        title: 'Skickade gåvor',
        value: '342 st',
        description: 'Hanterade och levererade gåvor',
        icon: <Gift className="size-5 text-primary/70" aria-hidden="true" />,
    },
    {
        id: 'products',
        title: 'Aktiva produkter',
        value: '21 / 24',
        description: '21 aktiva i butik, 8 med ateljégravyr',
        icon: <ShoppingBag className="size-5 text-primary/70" aria-hidden="true" />,
    },
]

export function AdminStatsGrid({ stats = defaultStats }: AdminStatsGridProps) {
    return (
        <section aria-label="Nyckeltal och statistik" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {stats.map((stat) => (
                <article key={stat.id} className="flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all sm:p-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-secondary/60">
                            {stat.icon}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </span>
                    </div>

                    <div className="mt-4">
                        <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {stat.value}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {stat.description}
                        </p>
                    </div>
                </article>
            ))}
        </section>
    )
}