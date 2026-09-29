import type { AddToCartResponse, CartSummary } from '../types/gifts'

export async function getCart(): Promise<CartSummary> {
    const response = await fetch('/api/cart', { credentials: 'include' })
    const payload = await response.json().catch(() => ({})) as Partial<CartSummary> & { message?: string }

    if (!response.ok) throw new Error(payload.message ?? 'Kundvagnen kunde inte hämtas.')

    return {
        items: Array.isArray(payload.items) ? payload.items : [],
        itemCount: Number(payload.itemCount ?? 0),
        pointTotal: Number(payload.pointTotal ?? 0),
    }
}

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

export class CartApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'CartApiError'
        this.status = status
    }
}

export const deleteItem = async (productId: number, quantity: number) => {
    const url = `/api/cart`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            "productId": productId,
            "quantity": quantity
        })
    });
    const data = await response.json();

    if (!response.ok) {
        throw new CartApiError(
            data?.message ?? 'Något gick fel.', response.status
        );
    }
    return data;
};