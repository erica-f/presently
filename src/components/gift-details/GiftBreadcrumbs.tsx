import { Link } from 'react-router-dom'

export function GiftBreadcrumbs({ giftName }: { giftName: string }) {
    return (
        <nav aria-label="Brödsmulor" className="flex items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground">
            <Link className="shrink-0 no-underline transition-colors hover:text-primary" to="/">Hem</Link>
            <span aria-hidden="true">/</span>
            <Link className="shrink-0 no-underline transition-colors hover:text-primary" to="/gifts">Gåvor</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-foreground" aria-current="page">{giftName}</span>
        </nav>
    )
}