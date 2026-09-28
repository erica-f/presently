import type { AddToCartResponse } from "../types/gifts"

export async function addToCart(productId: number, quantity = 1): Promise<AddToCartResponse> {
    const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    })
    const payload = await response.json().catch(() => ({})) as Partial<AddToCartResponse> & { message?: string }

    if (!response.ok || payload.success !== true) {
        throw new Error(payload.message ?? 'Gåvan kunde inte läggas i kundvagnen.')
    }

    return payload as AddToCartResponse
}