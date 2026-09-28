import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { GiftInfo } from '../../types/gifts'
import { toAssetUrl } from '../../utils/giftDetails'

export function SuggestedGifts({ gifts }: { gifts: GiftInfo[] }) {
    if (gifts.length === 0) return null

    return (
        <section className="flex flex-col gap-7 border-t border-border py-10 sm:py-12" aria-labelledby="explore-more-title">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl text-foreground sm:text-3xl" id="explore-more-title">Utforska mer</h2>
                    <p className="text-sm text-muted-foreground">Fler gåvor som är tillgängliga med ditt medlemskap.</p>
                </div>
                <Link className="hidden text-sm font-semibold text-primary sm:inline" to="/gifts">Visa alla gåvor</Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gifts.map((gift) => (
                    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface" key={gift.id}>
                        <a className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f1eee7] p-7" href={`/gifts/${gift.id}`}>
                            <img className="block max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-[1.03]" src={toAssetUrl(gift.thumbnail_image_url)} alt={gift.name} />
                        </a>
                        <div className="flex flex-1 flex-col gap-5 p-5">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-base leading-snug text-foreground">{gift.name}</h3>
                                    <span className="shrink-0 text-sm font-semibold text-foreground">{gift.point_cost} p</span>
                                </div>
                                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{gift.description}</p>
                            </div>
                            <a className="inline-flex items-center gap-1 self-start text-sm font-semibold text-primary" href={`/gifts/${gift.id}`}>
                                Visa gåvan <ChevronRight className="size-4" aria-hidden="true" />
                            </a>
                        </div>
                    </article>
                ))}
            </div>

            <Link className="self-start text-sm font-semibold text-primary sm:hidden" to="/gifts">Visa alla gåvor</Link>
        </section>
    )
}