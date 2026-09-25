
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
