import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNavigationLinks } from '../config/siteNavigation'
import { Link } from 'react-router-dom'

const headerLinks = getNavigationLinks('header')
const menuLinks = headerLinks.filter((link) => link.style === 'link')
const actionLinks = headerLinks.filter((link) => link.style !== 'link')

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const updateScroll = () => setIsScrolled(window.scrollY > 0)
        updateScroll()
        window.addEventListener('scroll', updateScroll, { passive: true })
        return () => window.removeEventListener('scroll', updateScroll)
    }, [])

    return (
        <header className={`sticky top-0 z-50 px-4 transition-all duration-200 motion-reduce:transition-none sm:px-6 lg:px-9 ${isScrolled ? 'pt-1.5' : 'pt-3.5'}`} id="top">
            <div className={`relative mx-auto flex max-w-7xl items-center justify-between rounded-full border py-1.5 pr-3 pl-4 shadow-card transition-all duration-200 motion-reduce:transition-none ${isScrolled ? 'min-h-13 border-border-strong/70 bg-surface/60 hover:bg-surface/80 shadow-lg backdrop-blur-md' : 'min-h-16 border-border bg-surface'}`}>
                <Link className="inline-flex w-fit items-center" to="/" aria-label="Presently - till startsidan">
                    <img className="block h-10 w-auto" src="/presently-logo.svg" alt="Presently" />
                </Link>
                <nav className="hidden items-center gap-5 md:flex lg:gap-10" aria-label="Huvudmeny">
                    {menuLinks.map((item) => <Link className="text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary" to={item.path} key={item.label}>{item.label}</Link>)}
                </nav>
                <div className="hidden items-center gap-2 md:flex">
                    {actionLinks.map((item) => (
                        <Link className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold no-underline transition-colors ${item.style === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : 'text-primary hover:bg-secondary'}`} to={item.path} key={item.label}>
                            {item.label}
                        </Link>
                    ))}
                </div>
                <details className="md:hidden">
                    <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-border text-primary [&::-webkit-details-marker]:hidden" aria-label="Öppna meny">
                        <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </summary>
                    <nav className="absolute top-full right-0 left-0 z-10 mt-2 grid gap-0.5 rounded-2xl border border-border bg-surface p-2.5 shadow-card" aria-label="Mobilmeny">
                        {headerLinks.map((item) => <Link className="rounded-lg px-3.5 py-2.5 text-foreground no-underline hover:bg-secondary" to={item.path} key={item.label}>{item.label}</Link>)}
                    </nav>
                </details>
            </div>
        </header>
    )
}
