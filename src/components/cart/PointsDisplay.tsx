import { Info } from 'lucide-react'
import type { CartPoints } from '../../types/cart'

const PointsDisplay = ({ cart, currentPoints, pointsLeft }: CartPoints) => {

    return (
        <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ded3]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a3b2b]">Poängberäkning</span>
            </div>

            <div className="py-5 space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[#68736c]">Saldo före sändning</span>
                    <span className="font-semibold text-[#1a3b2b] text-base">{currentPoints} p</span>
                </div>

                {cart.map((item) => (
                    <div className="flex items-center justify-between text-sm" key={item.id}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#1a3b2b] font-medium">{item.name}</span>
                        </div>
                        <span className="font-semibold text-[#9e3a2b] text-base">-{item.point_total} p</span>
                    </div>
                ))}
                <div className="pt-2 border-t border-[#e6ded3]"></div>

                <div className="flex items-center justify-between pt-1">
                    <div>
                        <span className="block text-sm font-bold text-[#1a3b2b]">Saldo efter sändning</span>
                        <span className="text-[11px] text-[#68736c]">Dina sparade poäng förfaller aldrig</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl sm:text-2xl font-bold text-[#244d36]">{pointsLeft} p</span>
                    </div>
                </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f4efe6] border border-[#e6ded3] text-xs text-[#68736c] mb-6">
                <div className="flex items-start gap-2">
                    <Info />
                    <span>Detta är en poänginlösen. Inga betalkort eller extra avgifter debiteras. Gåvan graveras och paketeras omsorgsfullt så fort du bekräftar.</span>
                </div>
            </div>
        </div>
    )
}

export default PointsDisplay
