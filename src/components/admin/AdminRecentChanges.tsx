import { ArrowRight, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AdminRecentChangesProps, RecentProductChangeItem } from '../../types/admin'

const defaultChanges: RecentProductChangeItem[] = [
    {
        id: '1',
        title: 'Graverat smycke i borstat guld',
        sku: 'Art.nr: 7012',
        category: 'Smycken & Accessoarer',
        tier: 'Signature',
        points: 500,
        hasEngraving: true,
        timestamp: '21 feb, 15:10',
        status: 'Aktiv',
    },
    {
        id: '2',
        title: 'Munblåst Glasvas & Mässingsljusstake',
        sku: 'Art.nr: 4089',
        category: 'Inredning & Hantverk',
        tier: 'Plus',
        points: 350,
        timestamp: '20 feb, 11:25',
        status: 'Aktiv',
    },
    {
        id: '3',
        title: 'Ekologiskt Handvårdskit & Linnehandduk',
        sku: 'Art.nr: 3021',
        category: 'Kroppsvård & Textil',
        tier: 'Plus',
        points: 300,
        timestamp: '18 feb, 14:10',
        status: 'Aktiv',
    },
    {
        id: '4',
        title: 'Svenskt Hantverkskaffe & Havssaltschoklad',
        sku: 'Art.nr: 1045',
        category: 'Delikatesser & Skafferi',
        tier: 'Simple',
        points: 150,
        timestamp: '16 feb, 09:30',
        status: 'Utkast',
    },
]

export function AdminRecentChanges({
    changes = defaultChanges,
    onEdit,
    manageAllUrl = '/admin/products',
}: AdminRecentChangesProps) {
    return (
        <section aria-labelledby="recent-products-title" className="flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 id="recent-products-title" className="text-xl font-heading font-semibold text-foreground">
                            Senaste produktändringar
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Senast uppdaterade produkter i butik och sortiment
                        </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                        {changes.length} st produkter
                    </span>
                </div>

                <div className="mt-6 divide-y divide-border border-y border-border">
                    {changes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Inga produkter hittades i sortimentet.
                        </p>
                    ) : (
                        changes.map((item) => (
                            <article key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                        {item.tier && (
                                            <>
                                                <span className="font-medium text-foreground">{item.tier}</span>
                                                <span>-</span>
                                            </>
                                        )}
                                        <span className="font-medium text-foreground">
                                            {item.points} p
                                        </span>
                                        {item.hasEngraving && (
                                            <>
                                                <span>-</span>
                                                <span>Gravyr</span>
                                            </>
                                        )}
                                        <span>-</span>
                                        <span>{item.timestamp}</span>
                                    </div>

                                    <p className="truncate text-sm font-medium text-foreground">
                                        {item.title}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {item.sku} - {item.category}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {item.status}
                                    </span>

                                    <button type="button" onClick={() => onEdit?.(item)} className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary active:bg-secondary/40">
                                        <Pencil className="size-3 text-muted-foreground" aria-hidden="true" />
                                        <span>Redigera</span>
                                    </button>
                                </div>
                            </article>
                        )))}
                </div>
            </div>

            <div className="mt-4 pt-3 text-center">
                <Link to={manageAllUrl} className="inline-flex items-center gap-1.5 text-sm font-semibold text-link transition-colors hover:underline">
                    Hantera hela sortimentet & katalogen
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}