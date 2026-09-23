import { useContext } from 'react'
import UserContext from '../contexts/AuthContext';
import { Button } from './Button';

const Logout = () => {
    const { setUser } = useContext(UserContext);
    async function logout(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        try {
            await fetch(`/api/logout`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({})
            });
            setUser(null);
        } catch (error) {
            console.log("Couldn't log out: " + error);
        }
    }
    return (
        <div>
            <Button onClick={(e) => logout(e)}>Logga ut</Button>
        </div>
    )
}

export default Logout
