import type { AdminMembershipDistributionProps, MembershipDistributionTier } from '../../types/admin'

const defaultTiers: MembershipDistributionTier[] = [
    {
        id: 'simple',
        name: 'Simple',
        tierLabel: 'Basnivå, 100–250 p',
        count: 512,
        percentage: 52,
        description: 'Tillgång till basutbudet bland gåvosortimentet.',
        color: 'sage',
    },
    {
        id: 'plus',
        name: 'Plus',
        tierLabel: 'Premiumnivå, 300–450 p',
        count: 348,
        percentage: 35,
        description: 'Utökat hantverkssortiment och personliga hälsningskort.',
        color: 'primary',
    },
    {
        id: 'signature',
        name: 'Signature',
        tierLabel: 'Exklusiv ateljé, 500+ p',
        count: 122,
        percentage: 13,
        description: 'Skräddarsydd gravyr, handgjorda smycken och exklusiva gåvor.',
        color: 'gold',
    },
]

const colorClasses: Record<MembershipDistributionTier['color'], { bar: string; dot: string }> = {
    sage: {
        bar: 'bg-[#608b73]',
        dot: 'bg-[#608b73]',
    },
    primary: {
        bar: 'bg-primary',
        dot: 'bg-primary',
    },
    gold: {
        bar: 'bg-accent',
        dot: 'bg-accent',
    },
}

export function AdminMembershipDistribution({
    totalActive = 982,
    tiers = defaultTiers,
    className = '',
}: AdminMembershipDistributionProps) {
    return (
        <section aria-labelledby="membership-distribution-title" className={`flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card ${className}`}>
            <div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 id="membership-distribution-title" className="text-xl font-heading font-semibold text-foreground">
                            Medlemskapsfördelning
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Fördelning mellan medlemsnivåer
                        </p>
                    </div>
                    <span className="self-start sm:self-auto text-sm font-medium text-muted-foreground">
                        {totalActive.toLocaleString('sv-SE')} {totalActive === 1 ? 'aktiv' : 'aktiva'}
                    </span>
                </div>

                <div className="mt-6 flex flex-col gap-6">
                    {tiers.map((tier) => {
                        const colors = colorClasses[tier.color]
                        return (
                            <div key={tier.id} className="flex flex-col gap-2">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">
                                            {tier.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {tier.tierLabel}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground sm:text-right">
                                        <strong className="font-semibold text-foreground">{tier.count} {tier.count === 1 ? 'medlem' : 'medlemmar'}</strong>{' '}
                                        ({tier.percentage}%)
                                    </span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                                        style={{ width: `${tier.percentage}%` }}
                                        role="progressbar"
                                        aria-valuenow={tier.percentage}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`${tier.name}: ${tier.percentage}%`}
                                    />
                                </div>

                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {tier.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
