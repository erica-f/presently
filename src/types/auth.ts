export interface AuthContextType {
    isLoggedIn: boolean
    isAdmin: boolean
    role: string | null
    isOnline: boolean
    loading: boolean
    login(): void
    logout(): void
    flagLoggedOut(): void
}
