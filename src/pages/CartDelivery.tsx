import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom';
import { Users, ArrowRight, CircleCheckBig, Star, Info, UserRound, Mail } from 'lucide-react'
import { Button } from '../components/Button';
import { ProfileApiError, type Contact, type ContactForm, type Profile as ProfileData, profileApi } from '../lib/profileApi'
import { getCart } from '../lib/cartApi'
import useLoginStatus from "../hooks/useLoginStatus";
import { confirmExistence } from '../utils/confirmType';
import Headline from '../components/cart/Headline';
import SafetyInfo from '../components/cart/SafetyInfo';


const CartDelivery = () => {
    const handleUnauthorized = useLoginStatus();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [noContacts, setNoContacts] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>();
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [selectedContact, setSelectedContact] = useState<number>();
    const [paperType, setPaperType] = useState('forest');
    const paperColors = paperType == 'forest' ? 'bg-[#5f8971]/70' : paperType == 'warm' ? 'bg-[#e3d9c9]/80' : 'bg-[#fdf9f9]'
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
    function validityCheck(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        const checkV = e.target.checkValidity();

        if (checkV == false) {
            e.target.reportValidity();
        }
    }
    const saveContact = (field: keyof ContactForm, value: string) => {
        setContactDetails(previous => ({
            ...previous,
            [field]: value,
        }));
    };
    const requiredContactFields: (keyof ContactForm)[] = [
        'firstName',
        'lastName',
        'address',
        'postalCode',
        'city',
    ];
    const logContact = (contact: Contact) => {
        const formValues = requiredContactFields.reduce((result, field) => {
            result[field] = contact[field];
            return result;
        }, {} as ContactForm);

        setSavedContactDetails(formValues);
    }

    const oneTimeContactComplete = requiredContactFields.every(
        field => contactDetails[field].trim() !== ''
    );

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            setError('');
            try {
                const [contactList, profileData, cartList] = await Promise.all([profileApi.contacts(), profileApi.get(), getCart()]);
                setContacts(contactList);
                setProfile(profileData);
                setNameToUse(profileData.user.firstName);
                if (cartList.itemCount <= 0) {
                    setNoContacts(true);
                }
                if(profileData?.plan?.level === 1) {
                    setSelectedContact(0);
                }
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

    if (noContacts) return <Navigate to="/cart" />
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
                    {(userMembershipLevel == 2 || userMembershipLevel == 3) &&
                        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
                            <div className="flex items-center justify-between pb-5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full  border border-primary flex items-center justify-center text-brand-gold">
                                        <Users className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-primary">Dina sparade kontakter</h2>
                                        {userMembership?.level == 2 && <p className="text-xs text-muted-foreground">Spara 3 kontakter med {userMembership?.name}</p>}
                                        {userMembership?.level == 3 && <p className="text-xs text-muted-foreground">Obegränsad adressbok i {userMembership?.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                {contacts?.map(contact => (
                                    <label className={selectedContact == contact.id ? `relative p-4 mb-2 rounded-xl border-2 border-primary bg-[#f9fbf9] flex items-start justify-between cursor-pointer transition-all shadow-sm` : `relative p-4 mb-2 rounded-xl border border-border bg-surface hover:border-brand-forest/40 flex items-start justify-between cursor-pointer transition-all`} key={contact.id as number} onClick={() => (setSelectedContact(contact.id as number), logContact(contact))}>
                                        <div className="flex w-full items-center space-x-3.5">
                                            <input type="radio" className="appearance-none" />
                                            <div className="w-10 h-10 rounded-full text-primary font-medium text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-semibold text-primary">{contact.firstName} {contact.lastName}</h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{`${contact.address}, ${contact.postalCode} ${contact.city}`}</p>
                                            </div>
                                            {selectedContact == contact.id && <CircleCheckBig />}
                                        </div>
                                    </label>
                                ))}
                                <label className={selectedContact == 0 ? `relative p-4 mb-2 rounded-xl border-2 border-primary bg-[#f9fbf9] flex items-start justify-between cursor-pointer transition-all shadow-sm` : `relative p-4 mb-2 rounded-xl border border-border bg-surface hover:border-brand-forest/40 flex items-start justify-between cursor-pointer transition-all`} onClick={() => setSelectedContact(0)}>
                                    <div className="flex w-full items-center space-x-3.5">
                                        <input type="radio" className="appearance-none" />
                                        <div className="w-10 h-10 rounded-full text-primary font-medium text-sm flex items-center justify-center flex-shrink-0 mt-0.5">

                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-sm font-semibold text-primary">Engångskontakt (fyll i nedan)</h3>
                                            </div>
                                        </div>
                                        {selectedContact == 0 && <CircleCheckBig />}
                                    </div>
                                </label>
                            </div>
                            <div className="p-3.5 rounded-xl bg-accent/60 border border-accent/20 text-xs text-warning flex items-center space-x-2.5">
                                <Star />
                                {userMembershipLevel == 2 &&
                                    <span>{userMembership?.name}-medlemskap: Spara enkelt ner dina tre favoritkontakter. Du kan när som helst uppgradera ditt medlemskap till {confirmExistence(profile?.availablePlans?.find(item => item.level == 3)).name} för obegränsat med kontakter.</span>
                                }
                                {userMembershipLevel == 3 &&
                                    <span>{userMembership?.name}-medlemskap: Spara enkelt ner ett obegränsat antal kontakter.</span>
                                }
                            </div>
                        </div>
                    }
                    {(selectedContact == 0 || userMembershipLevel == 1) &&
                        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
                            <div className="pt-1">
                                <div className="group border border-primary rounded-xl p-3.5 bg-transparent">
                                    <div className="flex items-center justify-between pb-5 mb-6 border-b border-primary">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-primary">
                                                <UserRound className="size-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-primary">Mottagarens uppgifter</h2>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground bg-surface-muted px-2.5 py-1 rounded-md">Engångssändning</span>
                                    </div>

                                    <form className="space-y-4">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="first-name" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Förnamn *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first-name"
                                                    value={contactDetails.firstName}
                                                    onChange={e => (validityCheck(e), saveContact('firstName', e.target.value))}
                                                    placeholder="Elin"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                    required
                                                    pattern="[A-Öa-ö\-\s]*$"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last-name" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Efternamn *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last-name"
                                                    value={contactDetails.lastName}
                                                    onChange={e => (validityCheck(e), saveContact('lastName', e.target.value))}
                                                    placeholder="Sundström"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                    required
                                                    pattern="[A-Öa-ö\-\s]*$"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                Gatuadress &amp; ev. lägenhetsnummer *
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                value={contactDetails.address}
                                                onChange={e => (validityCheck(e), saveContact('address', e.target.value))}
                                                placeholder="Storgatan 14B, lgh 1201"
                                                className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                required
                                                pattern="[A-Öa-ö0-9\-\s]*$"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="postal-code" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Postnummer *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="postal-code"
                                                    value={contactDetails.postalCode}
                                                    onChange={e => (validityCheck(e), saveContact('postalCode', e.target.value))}
                                                    placeholder="411 24"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                    required
                                                    pattern="[0-9]{3}\s[0-9]{2}"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Ort *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="city"
                                                    value={contactDetails.city}
                                                    onChange={e => (validityCheck(e), saveContact('city', e.target.value))}
                                                    placeholder="Göteborg"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                    required
                                                    pattern="[A-Öa-ö\-\s]*$"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="phone" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Telefonnummer
                                                </label>
                                                <input
                                                    type="phone"
                                                    id="phone"
                                                    value={contactDetails.phone}
                                                    onChange={e => (validityCheck(e), saveContact('phone', e.target.value))}
                                                    placeholder="073 123 456 78"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                    pattern="[0-9]{10}"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={contactDetails.email}
                                                    onChange={e => (validityCheck(e), saveContact('email', e.target.value))}
                                                    placeholder="Elin@mail.com"
                                                    className="w-full px-4 py-3 border border-primary rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                        {userMembershipLevel == 1 &&
                                            <div className="mt-6 p-4 rounded-xl bg-surface-muted border border-primary flex items-start space-x-3.5">
                                                <div className="mt-0.5 w-5 h-5 rounded-full text-warning flex items-center justify-center flex-shrink-0">
                                                    <Info className="stroke-muted-foreground"/>
                                                </div>
                                                <div className="text-xs leading-relaxed text-muted-foreground">
                                                    <p className="font-medium">På en högre nivå kan du spara dina favoritkontakter. Du kan när som helst uppgradera ditt medlemskap.</p>
                                                </div>
                                            </div>
                                        }
                                    </form>
                                </div>
                            </div>

                        </div>}
                    <div className="pt-3">
                        <Link to="/cart/checkout" state={{ deliverTo: selectedContact == 0 ? contactDetails : savedContactDetails, message: { type: paperType, message: personalMessage, signed: nameToUse } }} className={selectedContact == null || (selectedContact == 0 && !oneTimeContactComplete) ? 'pointer-events-none' : ''}>
                            <Button
                                icon={<ArrowRight />}
                                iconPosition='right'
                                className="w-full"
                                disabled={selectedContact == null || (selectedContact == 0 && !oneTimeContactComplete)}
                            >
                                <span>Fortsätt till bekräftelse</span>
                            </Button>
                        </Link>
                    </div>
                </section>

                <section className="lg:col-span-5 space-y-6">
                    <section className="p-6 sm:p-7 rounded-2xl bg-surface border border-border shadow-xs">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base sm:text-lg text-primary mb-1">Personlig hälsning</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Trycks på ett matt, präglat bomullskort och läggs i gåvoasken tillsammans med din gåva.
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-surface-muted text-primary flex items-center justify-center shrink-0">
                                <Mail className="size-4" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Kortdesign</label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {paperList.map((type) => (
                                    <label className={paperType == `${type.key}` ? `relative flex flex-col items-center justify-center p-2 rounded-xl border-2 border-primary ${paperColors} text-center cursor-pointer` : "relative flex flex-col items-center justify-center p-2 rounded-xl border border-border hover:border-[#244d36]/40 bg-surface text-center cursor-pointer"} key={type.key}>
                                        <input type="radio" name={type.key} checked={paperType == type.key} onChange={() => setPaperType(type.key)} className="appearance-none" />
                                        <span className="text-xs font-semibold flex items-center gap-2">{type.name} </span>
                                    </label>
                                ))
                                }
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <label htmlFor="personal_message" className="font-medium text-primary">Ditt meddelande</label>
                                <span className="text-muted-foreground" id="char-counter"><span className="font-semibold text-muted-foreground">{signsUsed}</span> / 300 tecken</span>
                            </div>
                            <textarea
                                id="personal_message"
                                rows={4}
                                className="w-full p-4 rounded-xl border border-border text-muted-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent"
                                placeholder="Skriv din hälsning här..."
                                value={personalMessage}
                                onChange={(e) => (setPersonalMessage(e.target.value), setSignsUsed(e.target.value.length))}
                                maxLength={300}
                            />

                            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                                <span>Avsändare som trycks på kortet: <strong className="text-primary font-medium">{nameToUse}</strong></span>
                                <button type="button" className="text-[#244d36] hover:underline" onClick={() => setIsVisible(!isVisible)}>Ändra namn</button>
                            </div>
                            <div className={isVisible ? 'flex items-end justify-end' : 'invisible flex justify-end'} >
                                <input type="text" value={nameToUse} onChange={e => setNameToUse(e.target.value)} className="p-2 rounded-xl border border-border text-muted-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent" />
                            </div>
                        </div>
                    </section>
                    <SafetyInfo />

                </section>
            </div >
        </main >

    )
}

export default CartDelivery
