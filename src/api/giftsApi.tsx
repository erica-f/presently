import type { GiftInfo } from '../types/gifts'

export class GiftsApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'GiftsApiError'
        this.status = status
    }
}

export const getList = async (path: string) => {
    const url = `/api/${path}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) {
        throw new GiftsApiError(
            data?.message ?? 'Något gick fel.', response.status
        );
    }
    return data;
};

export const getGift = async (id: number): Promise<GiftInfo> => {
    const response = await fetch(`/api/gifts/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data?.message ?? 'Kunde inte hämta gåvan');

    return data;
};

export const getFeaturedGifts = async () => {
    const response = await fetch('/api/public/featured-gifts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (!response.ok) {
        throw new GiftsApiError(data?.message ?? 'Något gick fel.', response.status)
    }
    return data as import('../types/gifts').FeaturedGift[]
}
