import { useAuth } from "../contexts/useAuth";
import { useNavigate } from 'react-router-dom'

const useLoginStatus = () => {
    const { flagLoggedOut } = useAuth();
    const navigate = useNavigate();

    const handleUnathorized = () => {
        flagLoggedOut();
        navigate('/login', { replace: true });
    }
    return handleUnathorized
}
export default useLoginStatus