import type { NavigationLocation, SiteNavigationLink } from '../types/navigation'

const siteNavigation: SiteNavigationLink[] = [
    { label: 'Home', path: '/', header: true, footer: true, style: 'link' },
    { label: 'Gåvor', path: '/gifts', header: true, footer: true, style: 'link' },
    { label: 'Något här', path: '/something-here', header: true, footer: true, style: 'link' },
    { label: 'Logga in', path: '/login', header: true, footer: false, style: 'secondary' },
    { label: 'Kom igång', path: '#kom-igang', header: true, footer: false, style: 'primary' },
]

export function getNavigationLinks(location: NavigationLocation) {
    return siteNavigation.filter((link) => link[location])
}

// This file has to be rewritten a bit, together with the SiteHeader and SiteFooter components, as this is mainly just placeholders and I didn't know what the actual navigation would be.