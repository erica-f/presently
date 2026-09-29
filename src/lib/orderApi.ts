import type { OrderResponse, MessageDetails, CartInfo } from "../types/cart"
import type { ContactForm } from '../lib/profileApi'

export async function createOrder(delivery: ContactForm, message: MessageDetails, cart: CartInfo[]): Promise<OrderResponse> {
    const response = await fetch('/api/order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery, message, cart }),
    })
    const payload = await response.json().catch(() => ({})) as Partial<OrderResponse> & { message?: string }

    if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? 'Kunde inte lägga beställningen.')
    }

    return payload as OrderResponse
}