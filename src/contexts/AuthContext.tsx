import { createContext } from 'react'
import type { AuthContextType } from '../types/auth'

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    loading: true,
    login: () => { },
    logout: () => { },
    flagLoggedOut: () => { }
});
