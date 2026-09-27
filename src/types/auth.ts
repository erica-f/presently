export interface AuthContextType {
    isLoggedIn: boolean,
    loading: boolean,
    login(): void,
    logout(): void,
    flagLoggedOut(): void
}
