import { ShieldCheck } from 'lucide-react'

const SafetyInfo = () => {
    return (

        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck className='size-3.5' />
                <span>Presently Trygghet & Diskretion</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Inga fakturor eller priser syns någonsin för mottagaren. Du får en bekräftelse och spårningslänk direkt när paketet lämnar Stockholmsateljén.
            </p>
        </div>
    )
}

export default SafetyInfo
