export type NavigationLocation = 'header' | 'footer'

export type SiteNavigationLink = {
    label: string
    path: string
    header: boolean
    footer: boolean
    style: 'link' | 'primary' | 'secondary'
}