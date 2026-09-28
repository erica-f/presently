import { ArrowRight, Check } from 'lucide-react'
import type { MembershipGateProps } from '../../types/gifts'
import { Button } from '../Button'

export function MembershipGate({ currentMembership, giftName, requiredLevel, requiredMembership }: MembershipGateProps) {
    const requiredName = requiredMembership?.name ?? `nivå ${requiredLevel}`

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto flex max-w-2xl flex-col gap-4 text-center">
                <h1 className="text-3xl text-foreground sm:text-4xl">Uppgradera till {requiredName}</h1>
                <p className="text-muted-foreground">{giftName} ingår från medlemsnivån {requiredName}. Jämför din nuvarande plan med nivån som krävs.</p>
            </div>

            <div className="mx-auto grid w-full max-w-3xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-5">
                <article className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Din nuvarande plan</p>
                        <h2 className="text-xl text-foreground">{currentMembership?.name ?? 'Inget aktivt medlemskap'}</h2>
                        {currentMembership && <p className="text-sm font-semibold text-foreground">{currentMembership.price.toLocaleString('sv-SE')} kr / mån</p>}
                    </div>
                    {currentMembership ? (
                        <ul className="flex flex-col gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />{currentMembership.monthly_points} poäng per månad</li>
                            <li className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />Tillgång till gåvor upp till nivå {currentMembership.level}</li>
                        </ul>
                    ) : (
                        <p className="text-sm leading-6 text-muted-foreground">Du behöver ett aktivt medlemskap för att välja gåvor.</p>
                    )}
                </article>

                <span className="hidden items-center text-border-strong md:flex" aria-hidden="true"><ArrowRight className="size-5" /></span>

                <article className="flex flex-col gap-6 rounded-2xl border-2 border-primary bg-surface p-5 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Planen som krävs</p>
                        <h2 className="text-xl text-foreground">{requiredName}</h2>
                        {requiredMembership && <p className="text-sm font-semibold text-foreground">{requiredMembership.price.toLocaleString('sv-SE')} kr / mån</p>}
                    </div>
                    <ul className="flex flex-col gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
                        {requiredMembership && <li className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />{requiredMembership.monthly_points} poäng per månad</li>}
                        <li className="flex items-start gap-2"><Check className="size-4 shrink-0 text-primary" aria-hidden="true" />Låser upp {giftName}</li>
                    </ul>
                </article>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:justify-between">
                <Button className="w-full sm:w-auto" href="/gifts" variant="secondary">Tillbaka till gåvor</Button>
                <Button className="w-full sm:w-auto" href={`/checkout/${requiredLevel}`} icon={<ArrowRight className="size-4" />} iconPosition="right">Uppgradera till {requiredName}</Button>
            </div>
        </main>
    )
}