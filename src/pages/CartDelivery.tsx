import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowRight, CircleCheckBig, Star, Info } from 'lucide-react'
import { Button } from '../components/Button';
import { ProfileApiError, type Contact, type ContactForm, type Profile as ProfileData, profileApi, validateContactForm } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";
import { confirmExistence } from '../utils/confirmType';
import Headline from '../components/cart/Headline';


const CartDelivery = () => {
    const handleUnauthorized = useLoginStatus();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState<Contact[]>();
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [selectedContact, setSelectedContact] = useState<number>();
    const [paperType, setPaperType] = useState('forest');
    const paperList = [{ key: 'forest', name: 'Skogsgrön elegans' }, { key: 'warm', name: 'Varm naturbeige' }, { key: 'minimalist', name: 'Minimalistisk vit' }]
    const [personalMessage, setPersonalMessage] = useState('');
    const [signsUsed, setSignsUsed] = useState(0);
    const [nameToUse, setNameToUse] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [contactDetails, setContactDetails] = useState<ContactForm>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
    });
    const [savedContactDetails, setSavedContactDetails] = useState<ContactForm>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
    });
    const saveContact = (field: keyof ContactForm, value: string) => {
        setContactDetails(previous => ({
            ...previous,
            [field]: value,
        }));
    };
    const logContact = (contact: Contact) => {
        const { id, ...formValues } = contact;
        setSavedContactDetails(formValues);
    }
    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            setError('');
            try {
                const [contactList, profileData] = await Promise.all([profileApi.contacts(), profileApi.get()]);
                setContacts(contactList);
                setProfile(profileData);
                setNameToUse(profileData.user.firstName);
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
        fetchContacts();
    }, [handleUnauthorized])
    const userMembershipLevel = Number(profile?.plan?.level ?? 0);
    const userMembership = profile?.availablePlans.find(item => item.level == userMembershipLevel);

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
            <Headline headline={"Vem vill du skicka till?"} description={"Lägg till personen du vill skicka gåvan till och skriv en personlig hälsning."} />

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
                                    <p className="text-xs text-brand-textMuted">Obegränsad adressbok i {userMembership?.name}</p>
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

                        <div className="mb-3">
                            {contacts?.map(contact => (
                                <label className={selectedContact == contact.id ? `relative p-4 mb-2 rounded-xl border-2 border-brand-forest bg-[#f9fbf9] flex items-start justify-between cursor-pointer transition-all shadow-sm` : `relative p-4 mb-2 rounded-xl border border-brand-border bg-white hover:border-brand-forest/40 flex items-start justify-between cursor-pointer transition-all`} key={contact.id as number} onClick={() => (setSelectedContact(contact.id as number), logContact(contact))}>
                                    <div className="flex w-full items-center space-x-3.5">
                                        <input type="radio" className="appearance-none" />
                                        <div className="w-10 h-10 rounded-full bg-brand-sand text-brand-forest font-medium text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                            JL
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-sm font-semibold text-brand-textMain">{contact.firstName} {contact.lastName}</h3>
                                            </div>
                                            <p className="text-xs text-brand-textMuted mt-1">{`${contact.address}, ${contact.postalCode} ${contact.city}`}</p>
                                        </div>
                                        {selectedContact == contact.id && <CircleCheckBig />}
                                    </div>
                                </label>
                            ))}
                            <label className={selectedContact == 0 ? `relative p-4 mb-2  rounded-xl border-2 border-brand-forest bg-[#f9fbf9] flex items-start justify-between cursor-pointer transition-all shadow-sm` : `relative p-4 mb-2 rounded-xl border border-brand-border bg-white hover:border-brand-forest/40 flex items-start justify-between cursor-pointer transition-all`} onClick={() => setSelectedContact(0)}>
                                <div className="flex w-full items-center space-x-3.5">
                                    <input type="radio" className="appearance-none" />
                                    <div className="w-10 h-10 rounded-full bg-brand-sand text-brand-forest font-medium text-sm flex items-center justify-center flex-shrink-0 mt-0.5">

                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm font-semibold text-brand-textMain">Engångskontakt (fyll i nedan)</h3>
                                        </div>
                                    </div>
                                    {selectedContact == 0 && <CircleCheckBig />}
                                </div>
                            </label>
                        </div>
                        <div className="p-3.5 rounded-xl bg-brand-goldBg/60 border border-brand-gold/20 text-xs text-[#5c4921] flex items-center space-x-2.5">
                            <Star />
                            {userMembershipLevel == 2 &&
                                <span>{userMembership?.name}-medlemskap: Spara enkelt ner dina tre favoritkontakter. Du kan när som helst uppgradera ditt medlemskap till {confirmExistence(profile?.availablePlans?.find(item => item.level == 3)).name} för obegränsat med kontakter.</span>
                            }
                            {userMembershipLevel == 3 &&
                                <span>{userMembership?.name}-medlemskap: Spara enkelt ner ett obegränsat antal kontakter.</span>
                            }
                        </div>
                    </div>
                    {(selectedContact == 0 || userMembershipLevel == 1) &&
                        <div className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                            <div className="pt-1">
                                <div className="group border border-brand-border rounded-xl p-3.5 bg-transparent">
                                    <div className="flex items-center justify-between pb-5 mb-6 border-b border-brand-borderLight">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-full bg-brand-sand flex items-center justify-center text-brand-forest">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-brand-forest">Mottagarens uppgifter</h2>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-brand-textSubtle bg-[#f7f5f0] px-2.5 py-1 rounded-md">Engångssändning</span>
                                    </div>

                                    <form className="space-y-4">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="first-name" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                    Förnamn *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first-name"
                                                    value={contactDetails.firstName}
                                                    onChange={e => saveContact('firstName', e.target.value)}
                                                    placeholder="Elin"
                                                    className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last-name" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                    Efternamn *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last-name"
                                                    value={contactDetails.lastName}
                                                    onChange={e => saveContact('lastName', e.target.value)}
                                                    placeholder="Sundström"
                                                    className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                Gatuadress &amp; ev. lägenhetsnummer *
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                value={contactDetails.address}
                                                onChange={e => saveContact('address', e.target.value)}
                                                placeholder="Storgatan 14B, lgh 1201"
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
                                                    value={contactDetails.postalCode}
                                                    onChange={e => saveContact('postalCode', e.target.value)}
                                                    placeholder="411 24"
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
                                                    value={contactDetails.city}
                                                    onChange={e => saveContact('city', e.target.value)}
                                                    placeholder="Göteborg"
                                                    className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="phone" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                    Telefonnummer *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="phone"
                                                    value={contactDetails.phone}
                                                    onChange={e => saveContact('phone', e.target.value)}
                                                    placeholder="073 123 456 78"
                                                    className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-xs font-semibold text-brand-textMain uppercase tracking-wider mb-1.5">
                                                    Email *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="email"
                                                    value={contactDetails.email}
                                                    onChange={e => saveContact('email', e.target.value)}
                                                    placeholder="Elin@mail.com"
                                                    className="w-full px-4 py-3 bg-[#fdfcf9] border border-brand-border rounded-xl text-brand-textMain placeholder:text-brand-textSubtle focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                        {userMembershipLevel == 1 &&
                                            <div className="mt-6 p-4 rounded-xl bg-brand-goldBg border border-brand-gold/20 flex items-start space-x-3.5">
                                                <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center flex-shrink-0">
                                                    <Info />
                                                </div>
                                                <div className="text-xs leading-relaxed text-[#5c4921]">
                                                    <p className="font-medium text-[#483713]">Med {confirmExistence(profile?.availablePlans?.find(item => item.level == 2)).name} kan du spara favoritkontakter. Du kan när som helst uppgradera ditt medlemskap.</p>
                                                </div>
                                            </div>
                                        }
                                    </form>
                                </div>
                            </div>

                        </div>}

                    <div className="pt-3">
                        <Link to="/cart/checkout" state={{ deliverTo: selectedContact == 0 ? contactDetails : savedContactDetails, message: { type: paperType, message: personalMessage, signed: nameToUse } }} className={selectedContact == null ? 'pointer-events-none' : (selectedContact == 0 && contactDetails.firstName == '') ? 'pointer-events-none' : ''}>
                            <Button
                                icon={<ArrowRight />}
                                iconPosition='right'
                                className="w-full"
                                disabled={selectedContact == null || (selectedContact == 0 && contactDetails.firstName == '')}
                            >
                                <span>Fortsätt till bekräftelse</span>
                            </Button>
                        </Link>

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
