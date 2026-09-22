
export const getGiftsList = async () => {
    try {
        let url = `/api/gifts`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let data = await response.json();
        return data;
    } catch (error) {
        console.log("something went wrong: " + error);
    }
};


export const getCategoriesList = async () => {
    try {
        let url = `/api/categories`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let data = await response.json();
        return data;
    } catch (error) {
        console.log("something went wrong: " + error);
    }
};