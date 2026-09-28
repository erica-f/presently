import { useState, useEffect } from 'react'
import { Users, Plus, ArrowRight } from 'lucide-react'
import { Button } from '../components/Button';
import { ProfileApiError, type Contact, type ContactForm, type Profile as ProfileData, profileApi, validateContactForm } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";


const CartDelivery = () => {
    const handleUnauthorized = useLoginStatus();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState<Contact[]>();
    const [paperType, setPaperType] = useState('forest');
    const paperList = [{ key: 'forest', name: 'Skogsgrön elegans' }, { key: 'warm', name: 'Varm naturbeige' }, { key: 'minimalist', name: 'Minimalistisk vit' }]
    const [personalMessage, setPersonalMessage] = useState('');
    const [signsUsed, setSignsUsed] = useState(0);
    const [nameToUse, setNameToUse] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const fetchContacts = async () => {
        setLoading(true);
        setError('');
        try {
            const contactList = await profileApi.contacts();
            setContacts(contactList);
        } catch (err) {
            if (err instanceof ProfileApiError && err.status === 401) {
                handleUnauthorized();
                return
            }
            setError(err instanceof ProfileApiError ? err.message : 'Kunde inte ladda gåvor');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchContacts();
    }, [handleUnauthorized])
    console.log(contacts);

    if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <p className="text-muted-foreground" role="status">Laddar kontakter...</p>
    </main>
    if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <div className="border border-danger/30 bg-surface p-6">
            <h1 className="text-2xl text-foreground">Kunde inte hämta kontakter</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
    </main>

    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <header className="text-center max-w-2xl mx-auto mb-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a3b2b] tracking-tight mb-2">
                    Vem vill du skicka till?
                </h1>
                <p className="text-brand-textMuted text-base leading-relaxed">
                    Lägg till personen du vill skicka gåvan till och skriv en personlig hälsning.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                <section className="lg:col-span-7 space-y-6">
                    <div className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                        <div className="flex items-center justify-between pb-5">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-brand-goldBg border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                                    <Users />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-brand-forest">Dina sparade kontakter</h2>
                                    <p className="text-xs text-brand-textMuted">Obegränsad adressbok i Signature</p>
                                </div>
                            </div>

                            <Button variant="ghost" icon={<Plus />}>
                                <span>Lägg till ny kontakt</span>
                            </Button>
                        </div>

                        {/* <!-- Sökfält (vänligt och intuitivt, inte CRM-artat) --> */}
                        {/* <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSubtle">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Sök bland sparade vänner, familj eller kollegor..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfcf9] border border-brand-border rounded-xl text-sm text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all"
                            />
                        </div> */}

                        {/* <!-- Lista över sparade kontaktkort --> */}
                        <div className="space-y-3">
                            {/* <!-- Kontakt 2: Johan Lindqvist --> */}
                            {contacts?.map(contact => (
                                <div className="relative p-4 rounded-xl border border-brand-border bg-white hover:border-brand-forest/40 flex items-start justify-between cursor-pointer transition-all" key={contact.id as number}>
                                    <label className="flex items-start space-x-3.5">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="w-10 h-10 rounded-full bg-brand-sand text-brand-forest font-medium text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                                JL
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-semibold text-brand-textMain">{contact.firstName} {contact.lastName}</h3>
                                                </div>
                                                <p className="text-xs text-brand-textMuted mt-1">{`${contact.address}, ${contact.postalCode} ${contact.city}`}</p>
                                            </div>
                                        </div>
                                        <input type="radio" />
                                    </label>
                                </div>
                            ))}

                        </div>
                        {/* <!-- Signature förmånsnotis --> */}
                        <div className="p-3.5 rounded-xl bg-brand-goldBg/60 border border-brand-gold/20 text-xs text-[#5c4921] flex items-center space-x-2.5">
                            <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Signature-medlemskap: Spara obegränsat antal vänner, födelsedagar och adresser.</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                        {/* <!-- Fäll ut: Ange engångsmottagare --> */}
                        <div className="pt-1">
                            <details className="group border border-brand-border rounded-xl p-3.5 bg-transparent [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-brand-textMuted hover:text-brand-forest select-none">
                                    <span className="flex items-center space-x-2">
                                        <svg className="w-3.5 h-3.5 text-brand-forest group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>Skicka som engångsgåva utan att spara i adressboken</span>
                                    </span>
                                </summary>
                                <div className="mt-3 pt-3 border-t border-brand-borderLight space-y-3">
                                    <input type="text" placeholder="Mottagarens namn" className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs" />
                                    <input type="text" placeholder="Gatuadress" className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder="Postnummer" className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs" />
                                        <input type="text" placeholder="Ort" className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs" />
                                    </div>
                                </div>
                            </details>
                        </div>
                        <div className="pt-1">
                            <details className="group border border-brand-border rounded-xl p-3.5 bg-transparent [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-brand-textMuted hover:text-brand-forest select-none">
                                    <span className="flex items-center space-x-2">
                                        <svg className="w-3.5 h-3.5 text-brand-forest group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>Skicka som engångsgåva utan att spara i adressboken</span>
                                    </span>
                                </summary>
                                <div className="flex items-center justify-between pb-5 mb-6 border-b border-brand-borderLight">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-brand-sand flex items-center justify-center text-brand-forest">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-brand-forest">Mottagarens uppgifter</h2>
                                            <p className="text-xs text-brand-textMuted">Manuell inmatning för denna sändning</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-brand-textSubtle bg-[#f7f5f0] px-2.5 py-1 rounded-md">Engångssändning</span>
                                </div>

                                <form className="space-y-4">
                                    <div>
                                        <label htmlFor="full-name" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                            Mottagarens för- och efternamn *
                                        </label>
                                        <input
                                            type="text"
                                            id="full-name"
                                            value="Elin Sundström"
                                            placeholder="T.ex. Elin Sundström"
                                            className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                            Gatuadress &amp; ev. lägenhetsnummer *
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            value="Storgatan 14B, lgh 1201"
                                            placeholder="T.ex. Storgatan 14B, lgh 1201"
                                            className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="postal-code" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                Postnummer *
                                            </label>
                                            <input
                                                type="text"
                                                id="postal-code"
                                                value="411 24"
                                                placeholder="T.ex. 411 24"
                                                className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="city" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                Ort *
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                value="Göteborg"
                                                placeholder="T.ex. Göteborg"
                                                className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-xl bg-brand-goldBg border border-brand-gold/20 flex items-start space-x-3.5">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-xs leading-relaxed text-[#5c4921]">
                                            <p className="font-medium text-[#483713]">Med Plus kan du spara favoritkontakter.</p>
                                            <p className="mt-0.5 text-[#6c5931]">Som Simple-medlem fyller du smidigt i uppgifterna för varje gåva för hand. Du kan när som helst uppgradera ditt medlemskap.</p>
                                        </div>
                                    </div>
                                </form>
                            </details>
                        </div>

                    </div>

                    <div className="pt-3">
                        <Button
                            icon={<ArrowRight />}
                            iconPosition='right'
                            className="w-full"
                        >
                            <span>Fortsätt till bekräftelse</span>
                        </Button>
                    </div>
                </section>

                <section className="lg:col-span-5 space-y-6">
                    <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-serif text-[#1a3b2b] mb-1">Personlig hälsning</h3>
                                <p className="text-xs sm:text-sm text-[#68736c]">
                                    Trycks på ett matt, präglat bomullskort och läggs i gåvoasken tillsammans med din gåva.
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#f4efe6] text-[#244d36] flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-[#1a3b2b] uppercase tracking-wider mb-2">Kortdesign</label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {paperList.map((type) => (
                                    <label className={paperType == `${type.key}` ? "relative flex flex-col items-center justify-center p-2 rounded-xl border-2 border-[#244d36] bg-[#effcf9]/50 text-center cursor-pointer" : "relative flex flex-col items-center justify-center p-2 rounded-xl border border-[#e6ded3] hover:border-[#244d36]/40 bg-white text-center cursor-pointer"} key={type.key}>
                                        <input type="radio" name={type.key} checked={paperType == type.key} onChange={() => setPaperType(type.key)} className="appearance-none" />
                                        <span className="text-xs font-semibold flex items-center gap-2">{type.name} </span>
                                    </label>
                                ))
                                }
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <label htmlFor="personal_message" className="font-medium text-[#1a3b2b]">Ditt meddelande</label>
                                <span className="font-mono text-[#68736c]" id="char-counter"><span className="font-semibold text-[#1a3b2b]">{signsUsed}</span> / 300 tecken</span>
                            </div>
                            <textarea
                                id="personal_message"
                                rows={4}
                                className="w-full p-4 rounded-xl border border-[#d6cbbe] bg-[#fdfbf7] text-[#1a3b2b] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent font-serif"
                                placeholder="Skriv din hälsning här..."
                                value={personalMessage}
                                onChange={(e) => (setPersonalMessage(e.target.value), setSignsUsed(e.target.value.length))}
                                maxLength={300}
                            />

                            <div className="flex items-center justify-between pt-1 text-xs text-[#68736c]">
                                <span>Avsändare som trycks på kortet: <strong className="text-[#1a3b2b] font-medium">{nameToUse}</strong></span>
                                <button type="button" className="text-[#244d36] hover:underline" onClick={() => setIsVisible(!isVisible)}>Ändra namn</button>
                            </div>
                            <div className={isVisible ? 'flex items-end justify-end' : 'invisible flex justify-end'} >
                                <input type="text" value={nameToUse} onChange={e => setNameToUse(e.target.value)} className="p-2 rounded-xl border border-[#d6cbbe] bg-[#fdfbf7] text-[#1a3b2b] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent font-serif" />
                            </div>
                        </div>
                    </section>
                    <section className="bg-brand-sageBg/50 rounded-2xl p-5 border border-brand-forest/10 space-y-3">
                        <div className="flex items-center space-x-2.5 text-brand-forest font-semibold text-xs uppercase tracking-wider">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Presently Omtanke &amp; Trygghet</span>
                        </div>
                        <p className="text-xs text-brand-textMuted leading-relaxed">
                            Mottagaren ser aldrig priser, kvitton eller poängangivelser. Paketet levereras i en vacker, omärkt ytterkartong med ett förseglat gåvokuvert.
                        </p>
                    </section>
                </section>
            </div >
        </main >

    )
}

export default CartDelivery
