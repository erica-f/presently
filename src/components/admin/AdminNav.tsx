import { Gift, LayoutDashboard, ShoppingBag, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { AdminNavTab } from '../../types/admin'

const adminTabs: AdminNavTab[] = [
    {
        id: 'overview',
        label: 'Översikt',
        href: '/admin',
        icon: LayoutDashboard,
        isActive: (pathname) => pathname === '/admin' || pathname === '/admin/',
    },
    {
        id: 'orders',
        label: 'Gåvohistorik',
        href: '/admin/orders',
        icon: Gift,
        isActive: (pathname) => pathname.startsWith('/admin/orders'),
    },
    {
        id: 'users',
        label: 'Medlemmar',
        href: '/admin/users',
        icon: Users,
        isActive: (pathname) => pathname.startsWith('/admin/users'),
    },
    {
        id: 'products',
        label: 'Produkter',
        href: '/admin/products',
        icon: ShoppingBag,
        isActive: (pathname) => pathname.startsWith('/admin/products'),
    }
]

export function AdminNav() {
    const location = useLocation()

    return (
        <nav aria-label="Administrationskategorier" className="flex w-full items-center gap-1 overflow-x-auto border-b border-border text-sm">
            <div className="flex min-w-max items-center gap-2">
                {adminTabs.map((tab) => {
                    const active = tab.isActive(location.pathname)
                    const Icon = tab.icon

                    return (
                        <Link key={tab.id} to={tab.href} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}`}>
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            <span>{tab.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}