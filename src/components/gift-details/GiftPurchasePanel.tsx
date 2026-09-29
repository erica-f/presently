import { RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import type { GiftPurchasePanelProps } from '../../types/gifts'
import { AddToCartButton } from '../cart/AddToCartButton'

export function GiftPurchasePanel({ gift, currentPoints, cartPointTotal, onCartPointTotalChange }: GiftPurchasePanelProps) {
    const availablePoints = Math.max(0, currentPoints - cartPointTotal)
    const hasEnoughPoints = availablePoints >= gift.point_cost
    const missingPoints = Math.max(0, gift.point_cost - availablePoints)

    return (
        <section aria-labelledby="gift-title" className="flex flex-col gap-7 sm:gap-8">
            <div className="flex max-w-xl flex-col gap-4">
                <h1 id="gift-title" className="text-3xl leading-tight text-foreground sm:text-4xl">{gift.name}</h1>
                <p className="text-lg font-semibold text-foreground">{gift.point_cost} poäng</p>
                <p className="whitespace-pre-line text-[0.95rem] leading-7 text-muted-foreground">{gift.description}</p>
            </div>

            <div className="flex flex-col gap-5 border-t border-border pt-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <h2 className="text-base leading-snug text-foreground">
                            {hasEnoughPoints ? 'Du kan välja den här gåvan.' : `Du saknar ${missingPoints} poäng.`}
                        </h2>
                        <span className="shrink-0 text-sm text-muted-foreground">Tillgängligt: {availablePoints} p</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {cartPointTotal > 0 ? `${cartPointTotal} poäng används redan av gåvor i kundvagnen.` : hasEnoughPoints ? `${gift.point_cost} poäng dras från ditt saldo när du går vidare med beställningen.` : 'Dina poäng fylls på varje månad och sparas tills du vill använda dem.'}
                    </p>
                </div>

                <AddToCartButton className="w-full py-3" disabled={!hasEnoughPoints} productId={gift.id} onAdded={(result) => onCartPointTotalChange(result.pointTotal)} />

                <ul className="divide-y divide-border border-y border-border text-sm text-muted-foreground">
                    <li className="flex items-start gap-3 py-3"><Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />Beräknad leverans inom 3 arbetsdagar.</li>
                    <li className="flex items-start gap-3 py-3"><RotateCcw className="size-4 shrink-0 text-primary" aria-hidden="true" />14 dagars ångerrätt för varor som inte specialanpassats.</li>
                    <li className="flex items-start gap-3 py-3"><ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />3 års reklamationsrätt.</li>
                </ul>
            </div>
        </section>
    )
}