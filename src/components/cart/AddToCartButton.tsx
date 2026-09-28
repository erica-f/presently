import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { addToCart } from '../../lib/cartApi'
import type { AddToCartButtonProps } from '../../types/gifts'
import { Button } from '../Button'

export function AddToCartButton({ productId, disabled = false, className = '', label = 'Välj gåvan' }: AddToCartButtonProps) {
    const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')
    const [error, setError] = useState('')

    const handleAddToCart = async () => {
        setStatus('adding')
        setError('')
        try {
            await addToCart(productId)
            setStatus('added')
        } catch (requestError) {
            setStatus('idle')
            setError(requestError instanceof Error ? requestError.message : 'Gåvan kunde inte läggas i kundvagnen.')
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Button className={className} disabled={disabled || status !== 'idle'} onClick={() => void handleAddToCart()}>
                {disabled ? 'Otillräckligt saldo' : status === 'adding' ? 'Lägger till…' : status === 'added' ? 'Tillagd i kundvagnen' : label}
                {!disabled && status === 'idle' && <ChevronRight className="size-4" aria-hidden="true" />}
            </Button>
            {error && <p className="text-sm text-danger" role="alert">{error}</p>}
            {status === 'added' && <p className="text-sm text-success" role="status">Gåvan har lagts till i kundvagnen.</p>}
        </div>
    )
}