import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGift, getList } from '../api/giftsApi'
import { GiftBreadcrumbs } from '../components/gift-details/GiftBreadcrumbs'
import { GiftPurchasePanel } from '../components/gift-details/GiftPurchasePanel'
import { MembershipGate } from '../components/gift-details/MembershipGate'
import { PageMessage } from '../components/gift-details/PageMessage'
import { ProductGallery } from '../components/gift-details/ProductGallery'
import { SuggestedGifts } from '../components/gift-details/SuggestedGifts'
import { profileApi } from '../lib/profileApi'
import type { GiftInfo, Membership } from '../types/gifts'
import { shuffled, toAssetUrl } from '../utils/giftDetails'

const GiftDetails = () => {
    const { id } = useParams()
    const giftId = Number(id)
    const hasValidId = Number.isInteger(giftId) && giftId > 0
    const [gift, setGift] = useState<GiftInfo | null>(null)
    const [allGifts, setAllGifts] = useState<GiftInfo[]>([])
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [membershipLevel, setMembershipLevel] = useState(0)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [selectedImage, setSelectedImage] = useState(0)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!hasValidId) return

        const fetchGift = async () => {
            try {
                const [giftData, giftList, membershipData, overview, profile] = await Promise.all([
                    getGift(giftId),
                    getList('gifts') as Promise<GiftInfo[]>,
                    getList('memberships') as Promise<Membership[]>,
                    profileApi.overview(),
                    profileApi.get(),
                ])
                setGift(giftData)
                setAllGifts(shuffled(giftList))
                setMemberships(membershipData)
                setCurrentPoints(overview.pointBalance)
                setMembershipLevel(Number(profile.plan?.level ?? 0))
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
        return (gift.product_images ?? []).filter((image): image is string => Boolean(image)).map(toAssetUrl).filter((image, index, allImages) => allImages.indexOf(image) === index)
    }, [gift])

    const suggestedGifts = useMemo(() => {
        if (!gift) return []
        return allGifts.filter((item) => item.id !== gift.id).filter((item) => item.minimum_membership_plan_level <= membershipLevel).slice(0, 3)
    }, [allGifts, gift, membershipLevel])

    if (!hasValidId) return <PageMessage title="Ogiltigt produkt-id" />
    if (loading) return <PageMessage title="Laddar gåvan…" loading />
    if (error || !gift) return <PageMessage title="Kunde inte ladda sidan" description={error} />

    const requiredMembership = memberships.find((membership) => membership.level === gift.minimum_membership_plan_level)
    const currentMembership = memberships.find((membership) => membership.level === membershipLevel)

    if (membershipLevel < gift.minimum_membership_plan_level) return <MembershipGate currentMembership={currentMembership} giftName={gift.name} requiredLevel={gift.minimum_membership_plan_level} requiredMembership={requiredMembership} />

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pt-8 sm:gap-10 sm:px-6 sm:pt-10 lg:px-8">
            <GiftBreadcrumbs giftName={gift.name} />

            <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] lg:gap-14">
                <ProductGallery giftName={gift.name} images={images} selectedImage={selectedImage} onSelectImage={setSelectedImage} />
                <GiftPurchasePanel gift={gift} currentPoints={currentPoints} />
            </div>

            <SuggestedGifts gifts={suggestedGifts} />
        </main>
    )
}

export default GiftDetails