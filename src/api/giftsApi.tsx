
export const getList = async (path: string) => {
    try {
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
            throw new Error(
                data?.message ?? `Kunde inte hämta ${path}`
            );
        }
        return data;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new Error(
            `Kunde inte hämta ${path}`, { cause: err }
        );
    }
};
