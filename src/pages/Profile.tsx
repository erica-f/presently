import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Mail, Pencil, Plus, Trash2, UserRound, X } from 'lucide-react'
import { Button } from '../components/Button'
import { ProfileApiError, type Contact, type ContactForm, type Gift as GiftRecord, type Overview, type Payment, type Profile as ProfileData, profileApi, validateContactForm } from '../lib/profileApi'

const formatDate = (value: unknown) => value ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(String(value))) : '—'
const money = (value: unknown, currency: string) => value === null || value === undefined ? '—' : `${Number(value).toLocaleString('sv-SE')} ${currency}`
const emptyContact = { firstName: '', lastName: '', email: '', phone: '', address: '', postalCode: '', city: '' }

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
    return <section className="border-t border-border py-8" aria-labelledby={`${title}-title`}><div className="mb-5 flex items-center justify-between gap-4"><h2 id={`${title}-title`} className="text-xl text-foreground">{title}</h2>{action}</div>{children}</section>
}

function Profile() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [overview, setOverview] = useState<Overview | null>(null)
    const [gifts, setGifts] = useState<GiftRecord[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [contactForm, setContactForm] = useState<ContactForm>(emptyContact)
    const [editingId, setEditingId] = useState<unknown>(null)
    const [contactMessage, setContactMessage] = useState('')
    const [contactErrors, setContactErrors] = useState<Record<string, string>>({})

    const load = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const [nextProfile, nextOverview, nextGifts, nextContacts, nextPayments] = await Promise.all([
                profileApi.get(), profileApi.overview(), profileApi.gifts(), profileApi.contacts(), profileApi.payments(),
            ])
            setProfile(nextProfile); setOverview(nextOverview); setGifts(nextGifts); setContacts(nextContacts); setPayments(nextPayments)
        } catch (loadError) {
            if (loadError instanceof ProfileApiError && loadError.status === 401) {
                navigate('/login', { replace: true })
                return
            }
            setError(loadError instanceof Error ? loadError.message : 'Profilen kunde inte laddas.')
        } finally { setLoading(false) }
    }, [navigate])

    useEffect(() => {
        const loadTimer = window.setTimeout(() => { void load() }, 0)
        return () => window.clearTimeout(loadTimer)
    }, [load])

    const contactLimit = profile?.plan ? profile.plan.maxSavedContacts : 0
    const contactLimitLabel = contactLimit === null ? 'obegränsat' : `${contacts.length} av ${contactLimit}`
    const contactLimitReached = contactLimit !== null && contacts.length >= contactLimit
    const fullName = useMemo(() => [profile?.user.firstName, profile?.user.lastName].filter(Boolean).join(' ') || 'Din profil', [profile])

    const submitContact = async (event: FormEvent) => {
        event.preventDefault(); setContactMessage(''); setContactErrors({})
        const validationErrors = validateContactForm(contactForm, editingId === 'new')
        if (Object.keys(validationErrors).length) {
            setContactErrors(validationErrors)
            setContactMessage('Kontrollera uppgifterna och försök igen.')
            return
        }
        try {
            if (editingId === 'new') await profileApi.addContact(contactForm)
            else await profileApi.updateContact(editingId, contactForm)
            setContactForm(emptyContact); setEditingId(null); setContactMessage('Kontakten är sparad.'); setContacts(await profileApi.contacts())
        } catch (saveError) { setContactMessage(saveError instanceof Error ? saveError.message : 'Kontakten kunde inte sparas.') }
    }

    const startEdit = (contact: Contact) => { setEditingId(contact.id); setContactErrors({}); setContactMessage(''); setContactForm({ firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone, address: contact.address, postalCode: contact.postalCode, city: contact.city }) }
    const removeContact = async (id: unknown) => {
        if (!window.confirm('Vill du ta bort den här kontakten?')) return
        try { await profileApi.deleteContact(id); setContacts(await profileApi.contacts()) } catch (removeError) { setContactMessage(removeError instanceof Error ? removeError.message : 'Kontakten kunde inte tas bort.') }
    }

    if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]"><p className="text-muted-foreground" role="status">Laddar din profil…</p></main>
    if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]"><div className="border border-danger/30 bg-surface p-6"><h1 className="text-2xl text-foreground">Profilen kunde inte laddas</h1><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => void load()}>Försök igen</Button></div></main>
    if (!profile) return null

    return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 sm:w-[calc(100%-3rem)]">
        <div className="border-b border-border py-10 md:py-14">
            <p className="mb-2 text-sm font-medium text-accent">Mitt Presently</p>
            <div><h1 className="text-3xl text-foreground sm:text-4xl">Hej, {profile.user.firstName || fullName}</h1><p className="mt-2 max-w-xl text-muted-foreground">Här hittar du dina poäng, gåvor, kontakter och betalningar.</p></div>
        </div>

        <Section title="Översikt">
            <div className="grid gap-4 border-b border-border pb-7 sm:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">Kvarvarande poäng</p><p className="mt-1 text-3xl font-bold text-primary">{overview?.pointBalance ?? profile.pointBalance}</p></div>
                <div><p className="text-sm text-muted-foreground">Gåvor denna månad</p><p className="mt-1 text-3xl font-bold text-primary">{overview?.giftsSent ?? 0}</p></div>
                <div><p className="text-sm text-muted-foreground">Poäng använda</p><p className="mt-1 text-3xl font-bold text-primary">{overview?.pointsSpent ?? 0}</p></div>
            </div>
            <div className="mt-6"><p className="font-semibold text-foreground">{profile.plan?.name ?? 'Inget aktivt medlemskap'}</p><p className="text-sm text-muted-foreground">{profile.plan?.monthlyPoints ?? 0} poäng fylls på varje månad</p></div>
        </Section>

        <Section title="Konto"><div id="konto" className="space-y-4"><div className="flex items-start gap-3"><UserRound className="mt-1 size-5 text-accent" /><div><p className="text-sm text-muted-foreground">Namn</p><p className="font-semibold text-foreground">{fullName}</p></div></div><div className="flex items-start gap-3"><Mail className="mt-1 size-5 text-accent" /><div><p className="text-sm text-muted-foreground">E-post</p><p className="font-semibold text-foreground">{profile.user.email || '—'}</p></div></div></div></Section>

        <Section title="Skickade gåvor">
            {gifts.length === 0 ? <p className="text-sm text-muted-foreground">Du har inte skickat några gåvor ännu. När du gör det visas historiken här.</p> : <div className="divide-y divide-border">{gifts.map((gift) => <article className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]" key={String(gift.id)}><div><p className="font-semibold text-foreground">{gift.recipient}</p><p className="text-sm text-muted-foreground">{gift.items.length ? gift.items.map((item) => `${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`).join(', ') : 'Gåva'}</p></div><div className="text-left text-sm sm:text-right"><p className="text-foreground">{formatDate(gift.date)}</p><p className="text-muted-foreground">{gift.status}</p></div></article>)}</div>}
        </Section>

        <Section title="Sparade kontakter" action={<span className="text-sm text-muted-foreground">{contactLimitLabel}</span>}>
            {contactLimitReached && <div className="mb-5 border border-accent/40 bg-accent-muted p-4 text-sm text-foreground">{profile.plan ? 'Ditt medlemskap har nått gränsen för sparade kontakter.' : 'Ett aktivt medlemskap krävs för att spara kontakter.'} Du kommer att kunna uppgradera ditt medlemskap direkt här från profilsidan.</div>}
            {contacts.length === 0 && !editingId && <p className="mb-5 text-sm text-muted-foreground">Spara mottagare du ofta skickar till för en snabbare checkout.</p>}
            <div className="divide-y divide-border">{contacts.map((contact) => <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center" key={String(contact.id)}><div><p className="font-semibold text-foreground">{contact.firstName} {contact.lastName}</p><p className="text-sm text-muted-foreground">{contact.email || contact.phone || 'Ingen kontaktuppgift'}</p></div><div className="flex gap-2"><Button variant="ghost" onClick={() => startEdit(contact)} icon={<Pencil className="size-4" />}>Redigera</Button><Button variant="ghost" onClick={() => void removeContact(contact.id)} icon={<Trash2 className="size-4" />}>Ta bort</Button></div></div>)}</div>
            {!editingId && !contactLimitReached && <Button className="mt-5" variant="secondary" onClick={() => setEditingId('new')} icon={<Plus className="size-4" />}>Lägg till kontakt</Button>}
            {editingId !== null && <form className="mt-6 border-t border-border pt-6" onSubmit={submitContact}><div className="mb-4 flex items-center justify-between"><h3 className="text-base text-foreground">{editingId === 'new' ? 'Ny kontakt' : 'Redigera kontakt'}</h3><button aria-label="Stäng formulär" className="text-muted-foreground hover:text-foreground" onClick={() => { setEditingId(null); setContactForm(emptyContact); setContactErrors({}); setContactMessage('') }} type="button"><X className="size-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">{[['firstName', 'Förnamn'], ['lastName', 'Efternamn'], ['email', 'E-post'], ['phone', 'Telefon'], ['address', 'Adress'], ['postalCode', 'Postnummer'], ['city', 'Ort']].map(([name, label]) => <label className="grid gap-1 text-sm text-foreground" key={name}>{label}<input aria-invalid={Boolean(contactErrors[name])} aria-describedby={contactErrors[name] ? `${name}-error` : undefined} className={`rounded-control border bg-surface px-3 py-2 text-sm ${contactErrors[name] ? 'border-danger' : 'border-border'}`} required={name === 'firstName' || name === 'lastName'} type={name === 'email' ? 'email' : 'text'} maxLength={name === 'firstName' || name === 'lastName' ? 80 : 160} value={contactForm[name as keyof typeof contactForm]} onChange={(event) => { setContactForm({ ...contactForm, [name]: event.target.value }); setContactErrors({ ...contactErrors, [name]: '' }) }} />{contactErrors[name] && <span className="text-xs text-danger" id={`${name}-error`}>{contactErrors[name]}</span>}</label>)}</div>{contactMessage && <p className="mt-4 text-sm text-muted-foreground" role="status">{contactMessage}</p>}<Button className="mt-5" type="submit">Spara kontakt</Button></form>}
        </Section>

        <Section title="Betalningar">
            {payments.length === 0 ? <p className="text-sm text-muted-foreground">Inga betalningskvitton finns ännu.</p> : <div className="divide-y divide-border">{payments.map((payment) => <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center" key={String(payment.id)}><div className="flex items-center gap-3"><CreditCard className="size-5 text-accent" /><div><p className="font-semibold text-foreground">{payment.planName}</p><p className="text-sm text-muted-foreground">{formatDate(payment.date)} · {payment.status}</p></div></div><p className="font-semibold text-foreground">{money(payment.amount, payment.currency)}</p></div>)}</div>}
        </Section>

    </main>
}

export default Profile
