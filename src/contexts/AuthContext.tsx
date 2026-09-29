import { createContext } from 'react'
import type { AuthContextType } from '../types/auth'

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isAdmin: false,
    role: null,
    isOnline: true,
    loading: true,
    login: () => { },
    logout: () => { },
    flagLoggedOut: () => { }
})
