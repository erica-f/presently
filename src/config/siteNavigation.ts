import type { NavigationLocation, SiteNavigationLink } from '../types/navigation'

const siteNavigation: SiteNavigationLink[] = [
    { label: 'Hem', path: '/', header: false, footer: true, style: 'link' },
    { label: 'Gåvor', path: '/gifts', header: true, footer: true, style: 'link', onlyLoggedIn: true },
    { label: 'Logga in', path: '/login', header: true, footer: false, style: 'secondary', onlyLoggedOut: true },
    { label: 'Kom igång', path: '/#kom-igang', header: true, footer: false, style: 'primary', onlyLoggedOut: true },
    { label: 'Profil', path: '/profile', header: true, footer: false, style: 'secondary', onlyLoggedIn: true, display: 'profile-menu' },
    { label: 'Kundvagn', path: '/cart', header: true, footer: false, style: 'secondary', onlyLoggedIn: true, display: 'cart-icon' },
    { label: 'Logga ut', path: '#logout', header: true, footer: false, style: 'secondary', onlyLoggedIn: true, action: 'logout' },
]

export function getNavigationLinks(location: NavigationLocation, isLoggedIn?: boolean) {
    return siteNavigation.filter((link) => {
        if (!link[location]) return false
        if (isLoggedIn === undefined) return true
        if (link.onlyLoggedIn && !isLoggedIn) return false
        if (link.onlyLoggedOut && isLoggedIn) return false
        return true
    })
}