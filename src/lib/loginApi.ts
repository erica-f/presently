
export class LogInError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'LogInError'
        this.status = status
    }
}

export async function logInRequest(email: string, password: string) {
    const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
    })
    const data = await response.json();

    if (!response.ok) {
        throw new LogInError(
            data?.message ?? 'Något gick fel.', response.status
        );
    }
    return data;
}