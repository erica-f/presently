import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getGift, getList } from '../api/giftsApi'
import { Button } from '../components/Button'
import { profileApi } from '../lib/profileApi'
import type { GiftInfo, Membership } from '../types/gifts'

// Hardcoded. I will have to change this later.
const userMembershipLevel = 2 

const toAssetUrl = (imageUrl: string) => {
    if (/^(?:[a-z]+:)?\/\//i.test(imageUrl) || imageUrl.startsWith('/') || imageUrl.startsWith('data:')) return imageUrl
    return `/${imageUrl}`
}

const GiftDetails = () => {
    const { id } = useParams()
    const giftId = Number(id)
    const hasValidId = Number.isInteger(giftId) && giftId > 0
    const [gift, setGift] = useState<GiftInfo | null>(null)
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [currentPoints, setCurrentPoints] = useState(0)
    const [selectedImage, setSelectedImage] = useState(0)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!hasValidId) return

        const fetchGift = async () => {
            try {
                const [giftData, membershipData, overview] = await Promise.all([
                    getGift(giftId),
                    getList('memberships') as Promise<Membership[]>,
                    profileApi.overview(),
                ])
                setGift(giftData)
                setMemberships(membershipData)
                setCurrentPoints(overview.pointBalance)
                setSelectedImage(0)
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Kunde inte hämta gåvan')
            } finally {
                setLoading(false)
            }
        }

        fetchGift()
    }, [giftId, hasValidId])

    const images = useMemo(() => {
        if (!gift) return []
        return (gift.product_images ?? [])
            .filter((image): image is string => Boolean(image))
            .map(toAssetUrl)
            .filter((image, index, allImages) => allImages.indexOf(image) === index)
    }, [gift])

    if (!hasValidId) return <PageMessage title="Ogiltigt produkt-id" />
    if (loading) return <PageMessage title="Laddar gåvan…" loading />
    if (error || !gift) return <PageMessage title="Kunde inte ladda sidan" description={error} />

    const requiredMembership = memberships.find((membership) => membership.level === gift.minimum_membership_plan_level)
    const membershipName = requiredMembership?.name ?? 'medlemsnivå'
    const hasMembership = userMembershipLevel >= gift.minimum_membership_plan_level
    const hasEnoughPoints = currentPoints >= gift.point_cost
    const canChooseGift = hasMembership && hasEnoughPoints
    const missingPoints = Math.max(0, gift.point_cost - currentPoints)

    const showPreviousImage = () => setSelectedImage((current) => current === 0 ? images.length - 1 : current - 1)
    const showNextImage = () => setSelectedImage((current) => current === images.length - 1 ? 0 : current + 1)

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
            <nav aria-label="Brödsmulor" className="mb-6 flex items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground">
                <Link className="shrink-0 no-underline transition-colors hover:text-primary" to="/">Hem</Link>
                <span aria-hidden="true">/</span>
                <Link className="shrink-0 no-underline transition-colors hover:text-primary" to="/gifts">Gåvor</Link>
                <span aria-hidden="true">/</span>
                <span className="truncate text-foreground" aria-current="page">{gift.name}</span>
            </nav>

            <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] lg:gap-14">
                <section aria-label="Produktbilder" className="min-w-0">
                    <div className="group relative flex aspect-[4/3] min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-[#f1eee7] p-7 sm:p-12">
                        <img className="block max-h-full max-w-full object-contain mix-blend-multiply" src={images[selectedImage]} alt={`${gift.name}${selectedImage > 0 ? `, bild ${selectedImage + 1}` : ''}`} />
                        {images.length > 1 && (
                            <>
                                <button className="absolute left-4 grid size-10 cursor-pointer place-items-center rounded-full border border-border bg-surface/90 text-primary opacity-0 shadow-sm transition-all hover:bg-white group-hover:opacity-100 focus-visible:opacity-100" onClick={showPreviousImage} aria-label="Visa föregående bild">
                                    <ChevronLeft className="size-5" aria-hidden="true" />
                                </button>
                                <button className="absolute right-4 grid size-10 cursor-pointer place-items-center rounded-full border border-border bg-surface/90 text-primary opacity-0 shadow-sm transition-all hover:bg-white group-hover:opacity-100 focus-visible:opacity-100" onClick={showNextImage} aria-label="Visa nästa bild">
                                    <ChevronRight className="size-5" aria-hidden="true" />
                                </button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2" aria-label="Välj produktbild">
                            {images.map((image, index) => (
                                <button className={`flex aspect-square w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-[#f1eee7] p-2 transition-all sm:w-24 ${selectedImage === index ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border-strong'}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`Visa bild ${index + 1} av ${images.length}`} aria-pressed={selectedImage === index} key={image}>
                                    <img className="block max-h-full max-w-full object-contain mix-blend-multiply" src={image} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                </section>

                <section aria-labelledby="gift-title" className="lg:sticky lg:top-24">
                    <h1 id="gift-title" className="max-w-xl text-3xl leading-tight text-foreground sm:text-4xl">{gift.name}</h1>
                    <p className="mt-4 text-lg font-semibold text-foreground">{gift.point_cost} poäng</p>
                    <p className="mt-6 max-w-xl whitespace-pre-line text-[0.95rem] leading-7 text-muted-foreground">{gift.description}</p>

                    <div className="mt-8 border-t border-border pt-6">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-base leading-snug text-foreground">
                                {!hasMembership ? `Den här gåvan kräver ${membershipName}.` : hasEnoughPoints ? 'Du kan välja den här gåvan.' : `Du saknar ${missingPoints} poäng.`}
                            </h2>
                            <span className="shrink-0 text-sm text-muted-foreground">Saldo: {currentPoints} p</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {!hasMembership ? `Uppgradera ditt medlemskap för att låsa upp gåvor på ${membershipName}-nivån. Dina sparade poäng finns kvar.` : hasEnoughPoints ? `${gift.point_cost} poäng dras från ditt saldo när du går vidare med beställningen.` : 'Dina poäng fylls på varje månad och sparas tills du vill använda dem.'}
                        </p>
                        <Button className="mt-5 w-full py-3" disabled={!canChooseGift}>
                            {canChooseGift ? 'Välj gåvan' : !hasMembership ? `Kräver ${membershipName}` : 'Otillräckligt saldo'}
                            {canChooseGift && <ChevronRight className="size-4" aria-hidden="true" />}
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    )
}

const PageMessage = ({ title, description, loading = false }: { title: string, description?: string, loading?: boolean }) => (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-surface p-8">
            <h1 className="text-2xl text-foreground" role={loading ? 'status' : undefined}>{title}</h1>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
            {!loading && <Button className="mt-5" href="/gifts" variant="secondary">Tillbaka till gåvor</Button>}
        </div>
    </main>
)

export default GiftDetails