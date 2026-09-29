import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AdminRecentActivityProps, RecentGiftActivityItem } from '../../types/admin'

const defaultActivities: RecentGiftActivityItem[] = [
    {
        id: '1',
        recipient: 'Elin Lindqvist',
        city: 'Stockholm',
        membershipLevel: 'Signature',
        giftName: 'Graverat smycke i borstat guld',
        points: 500,
        timestamp: 'Idag 11:20',
        status: 'Under packning',
    },
    {
        id: '2',
        recipient: 'Marcus Berg',
        city: 'Göteborg',
        membershipLevel: 'Plus',
        giftName: 'Ekologiskt Handvårdskit & Linnehandduk',
        points: 300,
        timestamp: 'Igår 16:45',
        status: 'Skickad',
    },
    {
        id: '3',
        recipient: 'Sofia Holm',
        city: 'Malmö',
        membershipLevel: 'Simple',
        giftName: 'Svenskt Hantverkskaffe & Havssaltschoklad',
        points: 150,
        timestamp: '25 feb 14:10',
        status: 'Levererad',
    },
    {
        id: '4',
        recipient: 'Johan Ek',
        city: 'Uppsala',
        membershipLevel: 'Plus',
        giftName: 'Munblåst Glasvas & Mässingsljusstake',
        points: 350,
        timestamp: '22 feb 09:30',
        status: 'Levererad',
    },
]

export function AdminRecentActivity({
    activities = defaultActivities,
    historyUrl = '/admin',
}: AdminRecentActivityProps) {
    return (
        <section
            aria-labelledby="recent-activity-title"
            className="flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card"
        >
            <div>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 id="recent-activity-title" className="text-xl font-heading font-semibold text-foreground">
                            Senaste gåvoaktivitet
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Senast registrerade gåvoutskick i systemet
                        </p>
                    </div>
                </div>

                <div className="mt-6 divide-y divide-border border-y border-border">
                    {activities.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Inga gåvoutskick registrerade ännu.
                        </p>
                    ) : (
                        activities.map((item) => (
                            <article key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{item.recipient}</span>
                                        <span>-</span>
                                        <span>{item.city}</span>
                                        <span>-</span>
                                        <span>{item.membershipLevel}</span>
                                    </div>

                                    <p className="text-sm font-medium text-foreground">
                                        {item.giftName}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {item.points} p - {item.timestamp}
                                    </p>
                                </div>

                                <div className="shrink-0 self-start sm:self-center">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {item.status}
                                    </span>
                                </div>
                            </article>
                        )))}
                </div>
            </div>

            <div className="mt-4 pt-3 text-center">
                <Link to={historyUrl} className="inline-flex items-center gap-1.5 text-sm font-semibold text-link transition-colors hover:underline">
                    Visa all gåvohistorik
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}
