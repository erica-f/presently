export const getMembershipPlans = async () => {
    try {
        let url = `/api/memberships`;
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