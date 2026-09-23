
export const getList = async (path: string) => {
    try {
        let url = `/api/${path}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        let data = await response.json();
        if (!response.ok) {
            throw new Error(
                data?.message ?? `Kunde inte hämta ${path}`
            );
        }
        return data;

    } catch (error) {
        throw new Error(
            `Kunde inte hämta ${path}`
        );
    }
};
