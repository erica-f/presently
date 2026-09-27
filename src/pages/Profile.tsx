import { useCallback, useEffect, useMemo, useState, type ReactNode, type SubmitEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CreditCard, KeyRound, Mail, Pencil, Plus, Trash2, UserRound, X } from 'lucide-react'
import { Button } from '../components/Button'
import { ProfileApiError, normalizePhone, type Contact, type ContactForm, type Gift as GiftRecord, type Overview, type Payment, type Profile as ProfileData, profileApi, validateContactForm } from '../lib/profileApi'

const formatDate = (value: unknown) => {
    if (!value) return 'Inte tillgängligt'
    const date = new Date(String(value))
    return Number.isNaN(date.getTime()) ? 'Inte tillgängligt' : new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(date)
}
const money = (value: unknown, currency = 'SEK') => value === null || value === undefined ? 'Inte tillgängligt' : `${Number(value).toLocaleString('sv-SE')} ${currency}`
const membershipStatus = (value: string | null) => value === 'active' ? 'Aktivt' : value === 'canceled' ? 'Avslutat' : value === 'past_due' ? 'Betalning saknas' : value ?? 'Ej aktivt'
const emptyContact: ContactForm = { firstName: '', lastName: '', email: '', phone: '', address: '', postalCode: '', city: '' }
const sections = [
    { key: 'overview', label: 'Översikt', path: '/profile' },
    { key: 'gifts', label: 'Skickade gåvor', path: '/profile/gifts' },
    { key: 'contacts', label: 'Sparade kontakter', path: '/profile/contacts' },
    { key: 'receipts', label: 'Kvitton', path: '/profile/receipts' },
    { key: 'account', label: 'Konto', path: '/profile/account' },
] as const
type SectionKey = typeof sections[number]['key']

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
    return <section className="border-t border-border py-8" aria-labelledby={`${title}-title`}><div className="mb-5 flex items-center justify-between gap-4"><h2 id={`${title}-title`} className="text-xl text-foreground">{title}</h2>{action}</div>{children}</section>
}

function MembershipCard({ profile, onUpgrade, onCancel, actionMessage, actionBusy }: { profile: ProfileData; onUpgrade: (planId: unknown) => void; onCancel: () => void; actionMessage: string; actionBusy: boolean }) {
    const { plan, membership } = profile
    return <div className="border border-primary bg-primary p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-accent">Ditt medlemskap</p><h3 className="mt-2 text-xl text-primary-foreground">{plan?.name ?? 'Inget aktivt medlemskap'}</h3></div><span className="border border-accent/50 px-2 py-1 text-xs text-accent">{membershipStatus(membership.status)}</span></div>
        {plan ? <>
            <p className="mt-3 text-sm text-primary-foreground/80">{plan.monthlyPoints} poäng fylls på varje månad.</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-primary-foreground/20 pt-4"><div><p className="text-xs text-primary-foreground/70">Månadspris</p><p className="mt-1 font-semibold">{money(plan.monthlyPrice, plan.currency ?? 'SEK')}</p></div><div><p className="text-xs text-primary-foreground/70">Nästa betalning</p><p className="mt-1 font-semibold">{formatDate(membership.nextPaymentDate)}</p><p className="text-xs text-primary-foreground/70">{money(membership.nextPaymentAmount, membership.currency ?? plan.currency ?? 'SEK')}</p></div></div>
            <ul className="mt-5 space-y-2 border-t border-primary-foreground/20 pt-4 text-xs text-primary-foreground/80"><li>✓ {plan.monthlyPoints} poäng per månad</li><li>✓ {plan.maxSavedContacts === null ? 'Obegränsade' : plan.maxSavedContacts} sparade kontakter</li><li>✓ Gåvor enligt medlemsnivå {String(plan.level ?? '—')}</li></ul>
            {membership.cancelAtPeriodEnd && <p className="mt-4 border border-accent/50 bg-primary-foreground/10 p-3 text-xs">Medlemskapet avslutas {formatDate(membership.cancellationEffectiveDate || membership.periodEnd)}. Dina förmåner gäller till dess.</p>}
            {actionMessage && <p className="mt-4 text-xs text-accent" role="status">{actionMessage}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-3"><Button className="!bg-primary-foreground !text-primary hover:!bg-primary-foreground/90" disabled={actionBusy} onClick={() => onUpgrade(plan.id)} icon={<ArrowRight className="size-4" />}>Hantera medlemskap</Button>{!membership.cancelAtPeriodEnd && membership.operations.cancel && <Button className="!border-primary-foreground/30 !text-primary-foreground hover:!bg-primary-foreground/10" disabled={actionBusy} variant="ghost" onClick={onCancel}>Säg upp medlemskap</Button>}</div>
        </> : <p className="mt-4 text-sm text-primary-foreground/80">Välj en nivå för att börja samla poäng och skicka gåvor.</p>}
    </div>
}

function Profile() {
    const navigate = useNavigate()
    const { section } = useParams<{ section?: string }>()
    const activeSection: SectionKey = sections.some((item) => item.key === section) ? section as SectionKey : 'overview'
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
    const [contactSaving, setContactSaving] = useState(false)
    const [membershipMessage, setMembershipMessage] = useState('')
    const [membershipBusy, setMembershipBusy] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordBusy, setPasswordBusy] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    const load = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const [nextProfile, nextOverview, nextGifts, nextContacts, nextPayments] = await Promise.all([profileApi.get(), profileApi.overview(), profileApi.gifts(), profileApi.contacts(), profileApi.payments()])
            setProfile(nextProfile); setOverview(nextOverview); setGifts(nextGifts); setContacts(nextContacts); setPayments(nextPayments)
        } catch (loadError) {
            if (loadError instanceof ProfileApiError && loadError.status === 401) { navigate('/login', { replace: true }); return }
            setError(loadError instanceof Error ? loadError.message : 'Profilen kunde inte laddas.')
        } finally { setLoading(false) }
    }, [navigate])

    useEffect(() => {
        const timer = window.setTimeout(() => { void load() }, 0)
        return () => window.clearTimeout(timer)
    }, [load])

    useEffect(() => {
        if (!toastMessage) return
        const timer = window.setTimeout(() => setToastMessage(''), 6000)
        return () => window.clearTimeout(timer)
    }, [toastMessage])

    const contactLimit = profile?.plan ? profile.plan.maxSavedContacts : 0
    const contactLimitLabel = contactLimit === null ? 'Obegränsat' : `${contacts.length} av ${contactLimit}`
    const contactLimitReached = contactLimit !== null && contacts.length >= contactLimit
    const fullName = useMemo(() => [profile?.user.firstName, profile?.user.lastName].filter(Boolean).join(' ') || 'Din profil', [profile])

    const submitContact = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault(); setContactMessage(''); setContactErrors({})
        const normalized = { ...contactForm, phone: normalizePhone(contactForm.phone) }
        const validationErrors = validateContactForm(normalized, editingId === 'new')
        if (Object.keys(validationErrors).length) { setContactErrors(validationErrors); setContactMessage('Kontrollera uppgifterna och försök igen.'); return }
        setContactSaving(true)
        try {
            if (editingId === 'new') await profileApi.addContact(normalized); else await profileApi.updateContact(editingId, normalized)
            setContactForm(emptyContact); setEditingId(null); setContactMessage('Kontakten är sparad.'); setContacts(await profileApi.contacts())
        } catch (saveError) { setContactMessage(saveError instanceof Error ? saveError.message : 'Kontakten kunde inte sparas.') }
        finally { setContactSaving(false) }
    }

    const startEdit = (contact: Contact) => { setEditingId(contact.id); setContactErrors({}); setContactMessage(''); setContactForm({ firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: contact.phone, address: contact.address, postalCode: contact.postalCode, city: contact.city }) }
    const removeContact = async (id: unknown) => {
        if (!window.confirm('Vill du ta bort den här kontakten?')) return
        try { await profileApi.deleteContact(id); setContacts(await profileApi.contacts()) } catch (removeError) { setContactMessage(removeError instanceof Error ? removeError.message : 'Kontakten kunde inte tas bort.') }
    }

    const startMembershipAction = async (planId: unknown) => {
        setMembershipBusy(true); setMembershipMessage('')
        try { await profileApi.startCheckout(planId) } catch (actionError) { setMembershipMessage(actionError instanceof Error ? actionError.message : 'Betalningshantering är inte tillgänglig ännu.') }
        finally { setMembershipBusy(false) }
    }
    const cancelMembership = async () => {
        if (!window.confirm('Vill du säga upp ditt medlemskap vid slutet av den betalda perioden?')) return
        setMembershipBusy(true); setMembershipMessage('')
        try { await profileApi.cancelMembership(true) } catch (actionError) { setMembershipMessage(actionError instanceof Error ? actionError.message : 'Uppsägningen kunde inte genomföras.') }
        finally { setMembershipBusy(false) }
    }
    const changePassword = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault(); setPasswordMessage('')
        if (passwordForm.newPassword.length < 8) { setPasswordMessage('Det nya lösenordet måste vara minst 8 tecken.'); return }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordMessage('De nya lösenorden matchar inte.'); return }
        if (passwordForm.currentPassword === passwordForm.newPassword) { setPasswordMessage('Det nya lösenordet måste skilja sig från det nuvarande.'); return }
        setPasswordBusy(true)
        try {
            await profileApi.changePassword(passwordForm)
            setPasswordMessage('')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPasswordDialogOpen(false)
            setToastMessage('Lösenordet är uppdaterat.')
        } catch (passwordError) { setPasswordMessage(passwordError instanceof Error ? passwordError.message : 'Lösenordet kunde inte uppdateras.') }
        finally { setPasswordBusy(false) }
    }

    if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-6xl flex-1 py-16 sm:w-[calc(100%-3rem)]"><p className="text-muted-foreground" role="status">Laddar ditt Presently…</p></main>
    if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-6xl flex-1 py-16 sm:w-[calc(100%-3rem)]"><div className="border border-danger/30 bg-surface p-6"><h1 className="text-2xl text-foreground">Profilen kunde inte laddas</h1><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-5" onClick={() => void load()}>Försök igen</Button></div></main>
    if (!profile) return null

    const overviewView = <>
        <Section title="Översikt"><div className="grid gap-4 sm:grid-cols-3"><div className="border border-border bg-surface p-5"><p className="text-sm text-muted-foreground">Tillgängliga gåvopoäng</p><p className="mt-2 text-3xl font-bold text-primary">{overview?.pointBalance ?? profile.pointBalance} <span className="text-base font-normal">p</span></p></div><div className="border border-border bg-surface p-5"><p className="text-sm text-muted-foreground">Gåvor denna månad</p><p className="mt-2 text-3xl font-bold text-primary">{overview?.giftsSent ?? 0}</p></div><div className="border border-border bg-surface p-5"><p className="text-sm text-muted-foreground">Poäng använda</p><p className="mt-2 text-3xl font-bold text-primary">{overview?.pointsSpent ?? 0}</p></div></div></Section>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Section title="Poänghistorik & aktivitet">{overview?.giftsSent ? <p className="text-sm text-muted-foreground">Din aktivitet och gåvohistorik visas i de andra vyerna.</p> : <p className="text-sm text-muted-foreground">Ingen aktivitet ännu. När du skickar din första gåva visas den här.</p>}<Link className="mt-5 inline-flex text-sm font-semibold text-link" to="/profile/gifts">Visa skickade gåvor <ArrowRight className="ml-1 size-4" /></Link></Section><Section title="Senast skickade gåvor">{gifts.length ? gifts.slice(0, 3).map((gift) => <div className="flex justify-between gap-4 border-b border-border py-3 last:border-0" key={String(gift.id)}><div><p className="font-semibold text-foreground">{gift.recipient}</p><p className="text-sm text-muted-foreground">{formatDate(gift.date)}</p></div><span className="text-sm text-muted-foreground">{gift.status}</span></div>) : <p className="text-sm text-muted-foreground">Inga skickade gåvor ännu.</p>}</Section></div>
    </>

    const giftsView = <Section title="Skickade gåvor" action={<span className="text-sm text-muted-foreground">{gifts.length} totalt</span>}>{gifts.length === 0 ? <p className="text-sm text-muted-foreground">Du har inte skickat några gåvor ännu. När du gör det visas historiken här.</p> : <div className="divide-y divide-border">{gifts.map((gift) => <article className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]" key={String(gift.id)}><div><p className="font-semibold text-foreground">{gift.recipient}</p><p className="text-sm text-muted-foreground">{gift.items.length ? gift.items.map((item) => `${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`).join(', ') : 'Gåva'}</p></div><div className="text-left text-sm sm:text-right"><p className="text-foreground">{formatDate(gift.date)}</p><p className="text-muted-foreground">{gift.status}</p></div></article>)}</div>}</Section>

    const contactsView = <Section title="Sparade kontakter" action={<span className="text-sm text-muted-foreground">{contactLimitLabel}</span>}>
        {contactLimitReached && <div className="mb-5 border border-accent/40 bg-accent-muted p-4 text-sm text-foreground">{profile.plan ? 'Ditt medlemskap har nått gränsen för sparade kontakter.' : 'Ett aktivt medlemskap krävs för att spara kontakter.'}</div>}
        {contacts.length === 0 && !editingId && <p className="mb-5 text-sm text-muted-foreground">Spara mottagare du ofta skickar till för en snabbare checkout.</p>}
        <div className="divide-y divide-border">{contacts.map((contact) => <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center" key={String(contact.id)}><div><p className="font-semibold text-foreground">{contact.firstName} {contact.lastName}</p><p className="text-sm text-muted-foreground">{contact.email || contact.phone || 'Ingen kontaktuppgift'}</p></div><div className="flex gap-2"><Button variant="ghost" onClick={() => startEdit(contact)} icon={<Pencil className="size-4" />}>Redigera</Button><Button variant="ghost" onClick={() => void removeContact(contact.id)} icon={<Trash2 className="size-4" />}>Ta bort</Button></div></div>)}</div>
        {!editingId && !contactLimitReached && <Button className="mt-5" variant="secondary" onClick={() => setEditingId('new')} icon={<Plus className="size-4" />}>Lägg till kontakt</Button>}
        {editingId !== null && <form className="mt-6 border-t border-border pt-6" onSubmit={submitContact}><div className="mb-4 flex items-center justify-between"><h3 className="text-base text-foreground">{editingId === 'new' ? 'Ny kontakt' : 'Redigera kontakt'}</h3><button aria-label="Stäng formulär" className="text-muted-foreground hover:text-foreground" onClick={() => { setEditingId(null); setContactForm(emptyContact); setContactErrors({}); setContactMessage('') }} type="button"><X className="size-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">{[['firstName', 'Förnamn'], ['lastName', 'Efternamn'], ['email', 'E-post'], ['phone', 'Telefon'], ['address', 'Adress'], ['postalCode', 'Postnummer'], ['city', 'Ort']].map(([name, label]) => <label className="grid gap-1 text-sm text-foreground" key={name}>{label}<input aria-invalid={Boolean(contactErrors[name])} aria-describedby={contactErrors[name] ? `${name}-error` : undefined} className={`rounded-control border bg-surface px-3 py-2 text-sm ${contactErrors[name] ? 'border-danger' : 'border-border'}`} required={name === 'firstName' || name === 'lastName'} type={name === 'email' ? 'email' : 'text'} maxLength={name === 'firstName' || name === 'lastName' ? 80 : 160} value={contactForm[name as keyof ContactForm]} onChange={(event) => { setContactForm({ ...contactForm, [name]: event.target.value }); setContactErrors({ ...contactErrors, [name]: '' }) }} />{contactErrors[name] && <span className="text-xs text-danger" id={`${name}-error`}>{contactErrors[name]}</span>}</label>)}</div>{contactMessage && <p className="mt-4 text-sm text-muted-foreground" role="status">{contactMessage}</p>}<Button className="mt-5" disabled={contactSaving} type="submit">{contactSaving ? 'Sparar…' : 'Spara kontakt'}</Button></form>}
    </Section>

    const receiptsView = <Section title="Kvitton & betalningar">{payments.length === 0 ? <p className="text-sm text-muted-foreground">Inga betalningskvitton finns ännu.</p> : <div className="divide-y divide-border">{payments.map((payment) => <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center" key={String(payment.id)}><div className="flex items-center gap-3"><CreditCard className="size-5 text-accent" /><div><p className="font-semibold text-foreground">{payment.planName}</p><p className="text-sm text-muted-foreground">{formatDate(payment.date)} · {payment.status}</p>{payment.receiptNumber && <p className="font-mono text-[11px] text-muted-foreground">{payment.receiptNumber}</p>}</div></div><p className="font-semibold text-foreground">{money(payment.amount, payment.currency)}</p></div>)}</div>}</Section>

    const accountView = <>
        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]"><div><Section title="Personuppgifter" action={<Button variant="secondary" onClick={() => { setPasswordDialogOpen(true); setPasswordMessage('') }} icon={<KeyRound className="size-4" />}>Ändra lösenord</Button>}><div className="space-y-4"><div className="flex items-start gap-3"><UserRound className="mt-1 size-5 text-accent" /><div><p className="text-sm text-muted-foreground">Namn</p><p className="font-semibold text-foreground">{fullName}</p></div></div><div className="flex items-start gap-3"><Mail className="mt-1 size-5 text-accent" /><div><p className="text-sm text-muted-foreground">E-post</p><p className="font-semibold text-foreground">{profile.user.email || 'Inte tillgängligt'}</p></div></div></div></Section></div><div><MembershipCard profile={profile} onUpgrade={(planId) => void startMembershipAction(planId)} onCancel={() => void cancelMembership()} actionMessage={membershipMessage} actionBusy={membershipBusy} /></div></div>
        <Section title="Tillgängliga medlemskap"><div className="grid gap-4 md:grid-cols-3">{profile.availablePlans.length ? profile.availablePlans.map((plan) => <article className="border border-border bg-surface p-5" key={String(plan.id)}><div className="flex items-start justify-between gap-3"><h3 className="text-base text-foreground">{plan.name}</h3><span className="text-sm font-semibold text-primary">{money(plan.monthlyPrice, plan.currency ?? 'SEK')}</span></div><p className="mt-2 text-sm text-muted-foreground">{plan.monthlyPoints} poäng per månad.</p><p className="mt-2 text-sm text-muted-foreground">{plan.maxSavedContacts === null ? 'Obegränsade' : plan.maxSavedContacts} sparade kontakter.</p><Button className="mt-4" variant={String(profile.plan?.id) === String(plan.id) ? 'secondary' : 'primary'} disabled={String(profile.plan?.id) === String(plan.id) || membershipBusy} onClick={() => void startMembershipAction(plan.id)}>{String(profile.plan?.id) === String(plan.id) ? 'Nuvarande nivå' : 'Välj nivå'}</Button></article>) : <p className="text-sm text-muted-foreground">Medlemskapsalternativ är inte tillgängliga just nu.</p>}</div></Section>
        {passwordDialogOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPasswordDialogOpen(false) }}><div aria-labelledby="password-dialog-title" aria-modal="true" className="w-full max-w-md border border-border bg-surface p-6 shadow-lg" role="dialog"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl text-foreground" id="password-dialog-title">Ändra lösenord</h2><p className="mt-1 text-sm text-muted-foreground">Använd minst 8 tecken och välj ett lösenord du inte använder någon annanstans.</p></div><button aria-label="Stäng dialog" className="text-muted-foreground hover:text-foreground" onClick={() => setPasswordDialogOpen(false)} type="button"><X className="size-5" /></button></div><form className="mt-6 grid gap-4" onSubmit={changePassword}><input aria-hidden="true" autoComplete="username" className="hidden" tabIndex={-1} type="text" value={profile.user.email} readOnly /><label className="block text-sm text-foreground"><span className="block">Nuvarande lösenord</span><input autoComplete="current-password" className="mt-1 block w-full rounded-control border border-border bg-surface px-3 py-2" required type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label><label className="block text-sm text-foreground"><span className="block">Nytt lösenord</span><input autoComplete="new-password" className="mt-1 block w-full rounded-control border border-border bg-surface px-3 py-2" minLength={8} required type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label><label className="block text-sm text-foreground"><span className="block">Upprepa nytt lösenord</span><input autoComplete="new-password" className="mt-1 block w-full rounded-control border border-border bg-surface px-3 py-2" minLength={8} required type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label>{passwordMessage && <p className="text-sm text-danger" role="alert">{passwordMessage}</p>}<div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={() => setPasswordDialogOpen(false)}>Avbryt</Button><Button disabled={passwordBusy} type="submit">{passwordBusy ? 'Uppdaterar…' : 'Uppdatera lösenord'}</Button></div></form></div></div>}
    </>

    const view = activeSection === 'overview' ? overviewView : activeSection === 'gifts' ? giftsView : activeSection === 'contacts' ? contactsView : activeSection === 'receipts' ? receiptsView : accountView
    const pageDescription = activeSection === 'overview' ? 'Här ser du ditt saldo, din aktivitet och dina senaste gåvor.' : activeSection === 'account' ? 'Hantera dina uppgifter, ditt medlemskap och ditt lösenord.' : ''
    return <main className="mx-auto w-[calc(100%-2rem)] max-w-6xl flex-1 sm:w-[calc(100%-3rem)]">
        <header className="border-b border-border py-10 md:py-14"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-3xl text-foreground sm:text-4xl">{activeSection === 'account' ? 'Konto' : activeSection === 'overview' ? 'Översikt' : sections.find((item) => item.key === activeSection)?.label}</h1>{pageDescription && <p className="mt-2 max-w-xl text-muted-foreground">{pageDescription}</p>}</div><div className="text-sm text-muted-foreground">{fullName}</div></div></header>
        <nav className="flex gap-5 overflow-x-auto border-b border-border py-4" aria-label="Mitt Presently"><div className="flex min-w-max gap-5">{sections.map((item) => <Link className={`border-b-2 pb-3 text-sm transition-colors ${activeSection === item.key ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`} aria-current={activeSection === item.key ? 'page' : undefined} to={item.path} key={item.key}>{item.label}</Link>)}</div></nav>
        {view}
        {toastMessage && <div className="fixed right-4 bottom-4 z-[70] flex max-w-sm items-center gap-4 border border-success bg-success px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg" role="status"><span>{toastMessage}</span><button aria-label="Stäng notifiering" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setToastMessage('')} type="button"><X className="size-4" /></button></div>}
    </main>
}

export default Profile
