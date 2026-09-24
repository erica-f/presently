import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGift } from '../api/giftsApi'
import type { GiftInfo } from '../types/gifts'

const GiftDetails = () => {
    const { id } = useParams()
    const giftId = Number(id)
    const hasValidId = Number.isInteger(giftId) && giftId > 0
    const [gift, setGift] = useState<GiftInfo | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!hasValidId) return

        const fetchGift = async () => {
            try {
                setGift(await getGift(giftId))
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Kunde inte hämta gåvan')
            } finally {
                setLoading(false)
            }
        }

        fetchGift()
    }, [giftId, hasValidId])

    if (!hasValidId) return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">Ogiltigt produkt-id</main>
    if (loading) return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">Laddar gåvan…</main>
    if (error || !gift) return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">{error}</main>

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
            <h1>{gift.name}</h1>
            <p className="mt-3 text-muted-foreground">{gift.description}</p>
        </main>
    )
}

export default GiftDetails