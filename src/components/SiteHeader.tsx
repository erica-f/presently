import { ChevronDown, LogOut, Menu, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getNavigationLinks } from '../config/siteNavigation'
import { useAuth } from '../contexts/useAuth'
import { cartUpdatedEvent, getCart } from '../lib/cartApi'
import { profileApi } from '../lib/profileApi'

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [profileName, setProfileName] = useState<string | null>(null)
    const [profileRole, setProfileRole] = useState<string | null>(null)
    const [cartCount, setCartCount] = useState(0)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLElement>(null)
    const mobileButtonRef = useRef<HTMLButtonElement>(null)
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const location = useLocation()
    const { isLoggedIn, isAdmin: authIsAdmin, role: authRole, loading, logout } = useAuth()
    const isAdmin = Boolean(authIsAdmin || authRole === 'admin' || profileRole === 'admin')
    const headerLinks = loading ? [] : getNavigationLinks('header', isLoggedIn)
    const menuLinks = headerLinks.filter((link) => link.style === 'link')
    const profileLink = headerLinks.find((link) => link.display === 'profile-menu')
    const cartLink = headerLinks.find((link) => link.display === 'cart-icon')
    const logoutLink = headerLinks.find((link) => link.action === 'logout')
    const actionLinks = headerLinks.filter((link) => link.style !== 'link' && !link.display && !link.action)

    const [prevPathname, setPrevPathname] = useState(location.pathname)
    if (prevPathname !== location.pathname) {
        setPrevPathname(location.pathname)
        setIsProfileOpen(false)
        setIsMobileOpen(false)
    }

    const [prevIsLoggedIn, setPrevIsLoggedIn] = useState(isLoggedIn)
    if (prevIsLoggedIn !== isLoggedIn) {
        setPrevIsLoggedIn(isLoggedIn)
        if (!isLoggedIn) {
            setProfileName(null)
            setProfileRole(null)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) setIsProfileOpen(false)
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(target) &&
                !mobileButtonRef.current?.contains(target)
            ) {
                setIsMobileOpen(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsProfileOpen(false)
                setIsMobileOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const handleProfileMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setIsProfileOpen(true)
    }

    const handleProfileMouseLeave = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = setTimeout(() => {
            setIsProfileOpen(false)
        }, 250)
    }

    useEffect(() => {
        const updateScroll = () => setIsScrolled(window.scrollY > 0)
        updateScroll()
        window.addEventListener('scroll', updateScroll, { passive: true })
        return () => window.removeEventListener('scroll', updateScroll)
    }, [])

    useEffect(() => {
        if (!isLoggedIn) return

        let isCurrent = true
        const updateCartCount = () => void getCart().then((cart) => {
            if (isCurrent) setCartCount(cart.itemCount)
        }).catch(() => undefined)

        void profileApi.get().then((profile) => {
            if (!isCurrent) return
            const name = [profile.user.firstName, profile.user.lastName].filter(Boolean).join(' ')
            setProfileName(name || profile.user.email || 'Mitt konto')
            if (profile.user.role) {
                setProfileRole(profile.user.role)
            }
        }).catch(() => { if (isCurrent) setProfileName('Mitt konto') })
        updateCartCount()
        window.addEventListener(cartUpdatedEvent, updateCartCount)

        return () => {
            isCurrent = false
            window.removeEventListener(cartUpdatedEvent, updateCartCount)
        }
    }, [isLoggedIn])

    return (
        <header className={`sticky top-0 z-50 px-4 transition-all duration-200 motion-reduce:transition-none sm:px-6 lg:px-9 ${isScrolled ? 'pt-1.5' : 'pt-3.5'}`} id="top">
            <div className={`relative mx-auto flex max-w-7xl items-center justify-between rounded-full border py-1.5 pr-3 pl-4 shadow-card transition-all duration-200 motion-reduce:transition-none ${isScrolled ? 'min-h-13 border-border-strong/70 bg-surface/60 hover:bg-surface/80 shadow-lg backdrop-blur-md' : 'min-h-16 border-border bg-surface'}`}>
                <Link aria-label="Presently - till startsidan" className="inline-flex w-fit items-center" to="/">
                    <img alt="Presently" className="block h-10 w-auto" src="/presently-logo.svg" />
                </Link>
                <nav aria-label="Huvudmeny" className="hidden items-center gap-5 md:flex lg:gap-10">
                    {menuLinks.map((item, index) => (
                        <Link className="animate-header-item text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary" key={item.label} style={{ animationDelay: `${index * 50}ms` }} to={item.path}>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="hidden min-h-10 items-center gap-2 md:flex">
                    {actionLinks.map((item, index) => (
                        <Link
                            className={`animate-header-item inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold no-underline transition-colors ${item.style === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : 'text-primary hover:bg-secondary'}`}
                            key={item.label}
                            style={{ animationDelay: `${index * 60}ms` }}
                            to={item.path}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {cartLink && (
                        <Link aria-label={`${cartLink.label}, ${cartCount} varor`} className="animate-header-item relative grid size-10 place-items-center rounded-full text-primary no-underline hover:bg-secondary" style={{ animationDelay: '0ms' }} to={cartLink.path}>
                            <ShoppingBag aria-hidden="true" className="size-5" />
                            {cartCount > 0 && (
                                <span key={cartCount} className="animate-header-badge absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-5 text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {profileLink && (
                        <div ref={profileMenuRef} className="relative" onMouseEnter={handleProfileMouseEnter} onMouseLeave={handleProfileMouseLeave}>
                            <button
                                aria-expanded={isProfileOpen}
                                aria-haspopup="true"
                                aria-label={profileName ? `Profilmeny för ${profileName}` : 'Profilmeny'}
                                className="animate-header-item flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-sm font-semibold text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                style={{ animationDelay: cartLink ? '60ms' : '0ms' }}
                                onClick={() => setIsProfileOpen((prev) => !prev)}
                                type="button"
                            >
                                <UserRound aria-hidden="true" className="size-4 shrink-0" />
                                {profileName ? (
                                    <span key="name" className="animate-header-item max-w-36 truncate">{profileName}</span>
                                ) : (
                                    <>
                                        <span aria-hidden="true" className="h-3.5 w-20 animate-pulse rounded-full bg-primary/15 motion-reduce:animate-none"/>
                                        <span className="sr-only">Laddar profil...</span>
                                    </>
                                )}
                                <ChevronDown aria-hidden="true" className={`size-3.5 shrink-0 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProfileOpen && (
                                <div className="animate-header-dropdown absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-card border border-border bg-surface p-1.5 shadow-card" role="menu">
                                    <Link className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-foreground no-underline hover:bg-secondary" onClick={() => setIsProfileOpen(false)} role="menuitem" to={profileLink.path}>
                                        <UserRound aria-hidden="true" className="size-4" />
                                        {profileLink.label}
                                    </Link>
                                    {isAdmin && (
                                        <Link className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-foreground no-underline hover:bg-secondary" onClick={() => setIsProfileOpen(false)} role="menuitem" to="/admin">
                                            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
                                            Admin
                                        </Link>
                                    )}
                                    {logoutLink && (
                                        <button
                                            className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-secondary"
                                            onClick={() => {
                                                setIsProfileOpen(false)
                                                void logout()
                                            }}
                                            role="menuitem"
                                            type="button"
                                        >
                                            <LogOut aria-hidden="true" className="size-4" />
                                            {logoutLink.label}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="md:hidden">
                    <button
                        ref={mobileButtonRef}
                        aria-expanded={isMobileOpen}
                        aria-label={isMobileOpen ? 'Stäng meny' : 'Öppna meny'}
                        className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-border text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        onClick={() => setIsMobileOpen((prev) => !prev)}
                        type="button"
                    >
                        <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </button>
                    {isMobileOpen && (
                        <nav ref={mobileMenuRef} aria-label="Mobilmeny" className="animate-header-dropdown absolute top-full right-0 left-0 z-10 mt-2 grid origin-top gap-0.5 rounded-2xl border border-border bg-surface p-2.5 shadow-card">
                            {headerLinks.map((item, index) =>
                                item.action === 'logout' ? (
                                    <button
                                        className="animate-header-item flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-foreground hover:bg-secondary"
                                        key={item.label}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        onClick={() => {
                                            setIsMobileOpen(false)
                                            void logout()
                                        }}
                                        type="button"
                                    >
                                        <LogOut aria-hidden="true" className="size-4" />
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link
                                        className="animate-header-item rounded-lg px-3.5 py-2.5 text-foreground no-underline hover:bg-secondary"
                                        key={item.label}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        onClick={() => setIsMobileOpen(false)}
                                        to={item.path}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                            {isAdmin && (
                                <Link
                                    className="animate-header-item flex items-center gap-2 rounded-lg px-3.5 py-2.5 font-medium text-foreground no-underline hover:bg-secondary"
                                    style={{ animationDelay: `${headerLinks.length * 30}ms` }}
                                    onClick={() => setIsMobileOpen(false)}
                                    to="/admin"
                                >
                                    <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
                                    Admin
                                </Link>
                            )}
                        </nav>
                    )}
                </div>
            </div>
        </header>
    )
}