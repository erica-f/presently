import { useAuth } from "../contexts/useAuth";
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

const useLoginStatus = () => {
    const { flagLoggedOut } = useAuth();
    const navigate = useNavigate();

    const handleUnathorized = useCallback(() => {
        flagLoggedOut();
        navigate('/login', { replace: true });
    }, [flagLoggedOut, navigate]);
    return handleUnathorized
}
export default useLoginStatus