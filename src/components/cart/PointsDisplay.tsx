import { Info } from 'lucide-react'
import type { CartPoints } from '../../types/cart'

const PointsDisplay = ({ cart, currentPoints, pointsLeft }: CartPoints) => {

    return (
        <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Poängberäkning</span>
            </div>

            <div className="py-5 space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Saldo före sändning</span>
                    <span className="font-semibold text-primary text-base">{currentPoints} p</span>
                </div>

                {cart.map((item) => (
                    <div className="flex items-center justify-between text-sm" key={item.id}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-secondary-foreground font-medium">{item.name}</span>
                        </div>
                        <span className="font-semibold text-danger text-base">-{item.point_total} p</span>
                    </div>
                ))}
                <div className="pt-2 border-t border-border"></div>

                <div className="flex items-center justify-between pt-1">
                    <div>
                        <span className="block text-sm font-bold text-primary">Saldo efter sändning</span>
                        <span className="text-[11px] text-muted-foreground">Dina sparade poäng förfaller aldrig</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl sm:text-2xl font-bold text-primary">{pointsLeft} p</span>
                    </div>
                </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs text-muted-foreground mb-6">
                <div className="flex items-start gap-2">
                    <Info />
                    <span>Detta är en poänginlösen. Inga betalkort eller extra avgifter debiteras.</span>
                </div>
            </div>
        </div>
    )
}

export default PointsDisplay
