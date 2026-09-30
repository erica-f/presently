import { Link } from 'react-router-dom'
import type { AdminBreadcrumbItem, AdminBreadcrumbsProps } from '../../types/admin'

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
    const defaultItems: AdminBreadcrumbItem[] = [
        { label: 'Hem', href: '/' },
        { label: 'Administration', href: '/admin' },
        { label: 'Översikt' },
    ]

    const breadcrumbs = items ?? defaultItems

    return (
        <nav aria-label="Brödsmulor" className="flex items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground">
            {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1

                if (isLast || !item.href) {
                    return (
                        <span key={item.label} aria-current={isLast ? 'page' : undefined} className="truncate text-foreground">
                            {item.label}
                        </span>
                    )
                }

                return (
                    <span key={item.label} className="inline-flex items-center gap-2">
                        <Link to={item.href} className="shrink-0 no-underline transition-colors hover:text-primary">
                            {item.label}
                        </Link>
                        <span aria-hidden="true" className="text-border-strong">/</span>
                    </span>
                )
            })}
        </nav>
    )
}