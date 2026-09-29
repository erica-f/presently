import type { AdminOperationalStatusProps, OperationalMetricItem } from '../../types/admin'

const defaultMetrics: OperationalMetricItem[] = [
    {
        id: 'active-products',
        label: 'Aktiva produkter i butik',
        value: '194 st',
    },
    {
        id: 'level-1-products',
        label: 'Produkter för Simple (Nivå 1)',
        value: '65 st',
    },
    {
        id: 'premium-products',
        label: 'Produkter för Plus & Signature (Nivå 2 och 3)',
        value: '129 st',
    },
    {
        id: 'categories-count',
        label: 'Produktkategorier',
        value: '24 st',
    },
    {
        id: 'pending-orders',
        label: 'Pågående gåvobeställningar',
        value: '',
        badge: '2 under packning',
        badgeType: 'warning',
    },
]

export function AdminOperationalStatus({
    metrics = defaultMetrics,
    className = '',
}: AdminOperationalStatusProps) {
    return (
        <section aria-labelledby="operational-status-title" className={`flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card ${className}`}>
            <div className="flex h-full flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                    <h2 id="operational-status-title" className="text-xl font-heading font-semibold text-foreground">
                        Sortiment & status
                    </h2>
                </div>

                <ul className="mt-6 flex flex-1 flex-col justify-between divide-y divide-border border-y border-border">
                    {metrics.map((item) => (
                        <li key={item.id} className="flex flex-1 items-center justify-between py-3.5 text-sm">
                            <span className="text-foreground">{item.label}</span>

                            <span className="font-semibold text-foreground">
                                {item.badge || item.value}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
