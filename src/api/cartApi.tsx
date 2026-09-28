
export class CartApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'CartApiError'
        this.status = status
    }
}

export const updateCart = async (productId: number, quantity: number) => {
    const url = `/api/cart`;
    const response = await fetch(url, {
        method: 'POST',
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