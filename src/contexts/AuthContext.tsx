import { createContext } from 'react'
type AuthContextType = {
    user: any;
    setUser: (user: any) => void;
};
const AuthContext = createContext<AuthContextType>({user: null, setUser: () => {}});

export default AuthContext;