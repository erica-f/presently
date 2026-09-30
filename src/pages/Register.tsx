import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/useAuth'

type RegistrationFields = { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }
type FieldErrors = Partial<Record<keyof RegistrationFields, string>>

export default function Register() {
    const auth = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [fields, setFields] = useState<RegistrationFields>({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = useState<FieldErrors>({})
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const update = (name: keyof RegistrationFields, value: string) => {
        setFields((current) => ({ ...current, [name]: value }))
        setErrors((current) => ({ ...current, [name]: undefined }))
        setMessage('')
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (submitting) return
        setSubmitting(true)
        setErrors({})
        setMessage('')
        try {
            const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(fields) })
            const data = await response.json().catch(() => ({})) as { error?: string; fields?: FieldErrors }
            if (!response.ok) {
                setErrors(data.fields ?? {})
                setMessage(data.error ?? 'Kontot kunde inte skapas just nu.')
                return
            }
            await auth.login()
            const requestedPlan = searchParams.get('plan')
            navigate(`/register/membership${requestedPlan ? `?plan=${encodeURIComponent(requestedPlan)}` : ''}`, { replace: true })
        } catch {
            setMessage('Nätverksfel. Försök igen.')
        } finally {
            setSubmitting(false)
        }
    }

    const input = (name: keyof RegistrationFields, label: string, type = 'text', autoComplete: string = name) => (
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-warm-muted" htmlFor={name}>
            {label}
            <input id={name} name={name} type={type} autoComplete={autoComplete} value={fields[name]} onChange={(event) => update(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} className="w-full rounded-xl border border-border bg-warm-cream/40 px-4 py-3 text-sm font-normal normal-case tracking-normal text-warm-text placeholder:text-warm-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" required />
            {errors[name] && <span id={`${name}-error`} className="text-xs font-normal normal-case tracking-normal text-danger">{errors[name]}</span>}
        </label>
    )

    return <div className="min-h-full flex flex-col justify-center bg-warm-cream antialiased selection:bg-brand-light selection:text-brand">
        <main className="mx-auto my-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid min-h-[580px] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white shadow-sm lg:grid-cols-12">
                <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 lg:p-14">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-brand">✦</div><span className="text-xs font-semibold uppercase tracking-wider text-warm-muted">Presently-konto</span></div>
                        <div className="mb-8"><p className="mb-3 text-sm font-medium text-brand">Steg 1 av 2</p><h1 className="mb-2 text-3xl font-bold tracking-tight text-warm-text sm:text-4xl">Skapa konto</h1><p className="text-sm leading-relaxed text-warm-muted sm:text-base">Skapa ditt konto och välj sedan det medlemskap som passar dig.</p></div>
                        <form className="grid gap-5" onSubmit={submit} noValidate>
                            <div className="grid gap-5 sm:grid-cols-2">{input('firstName', 'Förnamn', 'text', 'given-name')}{input('lastName', 'Efternamn', 'text', 'family-name')}</div>
                            {input('email', 'E-postadress', 'email', 'email')}
                            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-warm-muted" htmlFor="password">Lösenord<div className="relative"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={128} value={fields.password} onChange={(event) => update('password', event.target.value)} aria-invalid={Boolean(errors.password)} className="w-full rounded-xl border border-border bg-warm-cream/40 px-4 py-3 pr-12 text-sm font-normal normal-case tracking-normal text-warm-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" required /><button type="button" className="absolute inset-y-0 right-0 px-4 text-warm-muted" aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{errors.password && <span className="text-xs font-normal normal-case tracking-normal text-danger">{errors.password}</span>}</label>
                            {input('confirmPassword', 'Bekräfta lösenord', showPassword ? 'text' : 'password', 'new-password')}
                            {message && <p className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{message}</p>}
                            <Button className="w-full" disabled={submitting} type="submit" icon={<ArrowRight className="size-4" />} iconPosition="right">{submitting ? 'Skapar konto…' : 'Fortsätt till medlemskap'}</Button>
                        </form>
                        <div className="mt-8 border-t border-border/60 pt-6 text-center"><p className="text-sm text-warm-muted">Har du redan ett konto? <Link className="ml-1 font-semibold text-brand hover:text-brand-dark" to="/login">Logga in</Link></p></div>
                    </div>
                </div>
                <div className="relative flex flex-col justify-between overflow-hidden border-t border-border bg-surface-muted p-8 sm:p-10 lg:col-span-5 lg:border-t-0 lg:border-l">
                    <div className="relative z-10 overflow-hidden rounded-2xl border border-border/80 shadow-sm"><img src="/images/hero-gift.webp" alt="Presenter på ett dukat bord" className="h-56 w-full object-cover sm:h-64" /></div>
                    <div className="relative z-10 mt-8 space-y-4"><div className="rounded-2xl border border-border/60 bg-white/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-brand">Redo när du behöver</p><p className="mt-2 text-sm leading-relaxed text-warm-muted">Samla poäng varje månad och ha en omtänksam gåva nära till hands.</p></div><p className="text-xs leading-relaxed text-warm-muted">Du väljer medlemskap i nästa steg. Det går att byta nivå senare från din profil.</p></div>
                </div>
            </div>
        </main>
    </div>
}
