import { Button } from './Button';
import { useAuth } from '../contexts/useAuth';
const Logout = () => {
    const auth = useAuth();
    if (auth.isLoggedIn)
        return (
            <div>
                <Button onClick={auth.logout}>Logga ut</Button>
            </div>
        )
}
export default Logout
