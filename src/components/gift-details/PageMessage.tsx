import { Button } from '../Button'
import type { PageMessageProps } from '../../types/gifts'

export function PageMessage({ title, description, loading = false }: PageMessageProps) {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <h1 className="text-2xl text-foreground" role={loading ? 'status' : undefined}>{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
                {!loading && <Button className="w-full sm:w-auto" href="/gifts" variant="secondary">Tillbaka till gåvor</Button>}
            </div>
        </main>
    )
}