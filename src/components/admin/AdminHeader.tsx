import { Plus } from 'lucide-react'
import { Button } from '../Button'
import type { AdminHeaderProps } from '../../types/admin'

export function AdminHeader({
    title = 'Översikt',
    description = 'Operativ sammanfattning av användare, aktiva medlemskap, gåvoaktivitet och produktkatalog.',
    onAddProduct,
}: AdminHeaderProps) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex max-w-2xl flex-col gap-2">
                <h1 className="text-3xl leading-tight text-foreground sm:text-4xl font-heading font-bold">
                    {title}
                </h1>
                <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button variant="primary" icon={<Plus className="size-4" />} onClick={onAddProduct}>
                    Lägg till produkt
                </Button>
            </div>
        </header>
    )
}