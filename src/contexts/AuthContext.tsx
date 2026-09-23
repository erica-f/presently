import { createContext } from 'react'
type AuthContextType = {
    user: string;
    setUser: (user: string) => void;
};
const AuthContext = createContext<AuthContextType>({user: '', setUser: () => {}});

export default AuthContext;