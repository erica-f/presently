
export class UserApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'GiftsApiError'
        this.status = status
    }
}

export const getUser = async () => {
    const url = `/api/user`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new UserApiError(
            data?.message ?? 'Något gick fel.', response.status
        );
    }
    return data;
};
