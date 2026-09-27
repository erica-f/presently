import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Star, Moon, Heart, Infinity, ArrowRight, ArrowLeft } from 'lucide-react'
import { confirmExistence } from '../utils/confirmType'
import { getUser, UserApiError } from '../api/userApi'
import useLoginStatus from '../hooks/useLoginStatus'

const customizeGift = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImprint, setSelectedImprint] = useState('initials');
    const [imprintText, setImprintText] = useState('');
    const [imprintDate, setImprintDate] = useState('');
    const [imprintSymbol, setImprintSymbol] = useState('star');
    const symbolsList = [{ key: 'star', name: 'Stjärna', icon: <Star className="size-4" /> }, { key: 'moon', name: 'Måne', icon: <Moon className="size-4" /> }, { key: 'heart', name: 'Hjärta', icon: <Heart className="size-4" /> }, { key: 'infinity', name: 'Oändlighet', icon: <Infinity className="size-4" /> }];
    const [paperType, setPaperType] = useState('forest');
    const paperList = [{ key: 'forest', name: 'Skogsgrön elegans' }, { key: 'warm', name: 'Varm naturbeige' }, { key: 'minimalist', name: 'Minimalistisk vit' }]
    const [personalMessage, setPersonalMessage] = useState('');
    const [signsUsed, setSignsUsed] = useState(0);
    const location = useLocation().state;
    const gift = location.gift;
    const navigate = useNavigate();
    const handleUnauthorized = useLoginStatus();
    const [userDetails, setUserDetails] = useState({ first_name: '', last_name: '' });
    const [nameToUse, setNameToUse] = useState(userDetails ? userDetails.first_name : '');
    const [isVisible, setIsVisible] = useState(false);
    console.log(gift);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [list] = await getUser();
                setUserDetails(list);
                setNameToUse(list.first_name);
            } catch (err) {
                if (err instanceof UserApiError && err.status === 401) {
                    handleUnauthorized();
                    return
                }
                setError(err instanceof UserApiError ? err.message : 'Kunde inte hämta användaruppgifter');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [handleUnauthorized])


    if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <p className="text-muted-foreground" role="status">Laddar personifiering...</p>
    </main>
    if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <div className="border border-danger/30 bg-surface p-6">
            <h1 className="text-2xl text-foreground">Kunde inte ladda sidan</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
    </main>

    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-[#b89047] bg-[#f5eee1] border border-[#ebdcc1]/70 mb-3">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Signature Personifiering
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a3b2b] tracking-tight mb-2">
                    Sätt din personliga prägel
                </h1>
                <p className="text-sm sm:text-base text-[#68736c]">
                    Skapa ett oförglömligt ögonblick för din mottagare med skräddarsydd gravyr och ett handtryckt hälsningskort.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                <div className="lg:col-span-7 space-y-6">

                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e6ded3] shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <img src={`/` + gift.thumbnail_image_url} alt={gift.name} className="w-16 h-16 rounded-xl object-cover border border-[#e6ded3] shrink-0" />
                            <div className="truncate">
                                <span className="text-[11px] font-semibold text-[#b89047] uppercase tracking-wider">Vald gåva • {gift.point_cost} p</span>
                                <h2 className="text-base font-semibold text-[#1a3b2b] truncate">{gift.name}</h2>
                                {/* <p className="text-xs text-[#68736c] truncate">Till: <strong className="text-[#1a3b2b] font-medium">Elin Sundström</strong>, Storgatan 14B, Göteborg</p> */}
                            </div>
                        </div>
                        <button type="button" className="shrink-0 text-xs font-semibold text-[#244d36] hover:underline px-2 py-1">
                            Ändra
                        </button>
                    </div>
                    {(gift.category_id === 10 || gift.category_id === 14 || gift.category_id === 24) &&
                        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base sm:text-lg font-serif text-[#1a3b2b]">Gravyr</h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#f5eee1] text-[#b89047] border border-[#ebdcc1]">
                                            Ingår i Signature för utvalda produkter
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#68736c]">
                                        Gravering sker i vår ateljé med valfri text eller utvalda symboler.
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#f4efe6] text-[#b89047] flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#1a3b2b] uppercase tracking-wider mb-2">Välj gravyrlayout</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label className={selectedImprint == 'initials' ? "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-[#244d36] bg-[#effcf9]/50 text-center cursor-pointer" : "relative flex flex-col items-center justify-center p-3 rounded-xl border border-[#e6ded3] hover:border-[#244d36]/40 bg-white text-center cursor-pointer"}>
                                            <input type="radio" name="initials" checked={selectedImprint == 'initials'} onChange={() => setSelectedImprint('initials')} className="appearance-none" />
                                            <span className="text-xs font-semibold text-[#1a3b2b]">Initialer + Datum</span>
                                            <span className="text-[11px] text-[#68736c] mt-0.5">E + S / 24.08</span>
                                        </label>
                                        <label className={selectedImprint == 'name-only' ? "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-[#244d36] bg-[#effcf9]/50 text-center cursor-pointer" : "relative flex flex-col items-center justify-center p-3 rounded-xl border border-[#e6ded3] hover:border-[#244d36]/40 bg-white text-center cursor-pointer"}>
                                            <input type="radio" name="name-only" checked={selectedImprint == 'name-only'} onChange={() => setSelectedImprint('name-only')} className="appearance-none" />
                                            <span className="text-xs font-semibold text-[#1a3b2b]">Bara namn</span>
                                            <span className="text-[11px] text-[#68736c] mt-0.5">Max 10 tkn</span>
                                        </label>
                                        <label className={selectedImprint == 'symbols' ? "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-[#244d36] bg-[#effcf9]/50 text-center cursor-pointer" : "relative flex flex-col items-center justify-center p-3 rounded-xl border border-[#e6ded3] hover:border-[#244d36]/40 bg-white text-center cursor-pointer"}>
                                            <input type="radio" name="symbol" checked={selectedImprint == 'symbols'} onChange={() => setSelectedImprint('symbols')} className="appearance-none" />
                                            <span className="text-xs font-semibold text-[#1a3b2b]">Symbol</span>
                                            <span className="text-[11px] text-[#68736c] mt-0.5">Hjärta</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(selectedImprint == 'initials' || selectedImprint == 'name-only') &&
                                        <div>
                                            <label htmlFor="engraving_initials" className="block text-xs font-medium text-[#1a3b2b] mb-1.5">
                                                Rad 1: Initialer eller text
                                            </label>
                                            <input
                                                type="text"
                                                id="engraving_initials"
                                                value={imprintText}
                                                onChange={e => setImprintText(e.target.value)}
                                                maxLength={12}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6cbbe] bg-[#fdfbf7] text-[#1a3b2b] text-sm focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent font-serif text-center"
                                            />
                                        </div>
                                    }
                                    {selectedImprint == 'initials' &&
                                        <div>
                                            <label htmlFor="engraving_date" className="block text-xs font-medium text-[#1a3b2b] mb-1.5">
                                                Rad 2: Datum (valfritt)
                                            </label>
                                            <input
                                                type="text"
                                                id="engraving_date"
                                                value={imprintDate}
                                                onChange={(e) => setImprintDate(e.target.value)}
                                                maxLength={10}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6cbbe] bg-[#fdfbf7] text-[#1a3b2b] text-sm focus:outline-none focus:ring-2 focus:ring-[#244d36] focus:border-transparent text-center"
                                            />
                                        </div>
                                    }
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedImprint == 'symbols' &&
                                        <div className="grid grid-cols-4 gap-3">
                                            {symbolsList.map((symbol) => (
                                                <label className={imprintSymbol == `${symbol.key}` ? "relative flex flex-col items-center justify-center p-2 rounded-xl border-2 border-[#244d36] bg-[#effcf9]/50 text-center cursor-pointer" : "relative flex flex-col items-center justify-center p-2 rounded-xl border border-[#e6ded3] hover:border-[#244d36]/40 bg-white text-center cursor-pointer"} key={symbol.key}>
                                                    <input type="radio" name={symbol.key} checked={imprintSymbol == symbol.key} onChange={() => setImprintSymbol(symbol.key)} className="appearance-none" />
                                                    <span className="text-xs font-semibold flex items-center gap-2">{symbol.icon} {symbol.name} </span>
                                                </label>
                                            ))
                                            }
                                        </div>
                                    }
                                </div>
                                <p className="text-[11px] text-[#68736c]">
                                    ✓ Gravyr kontrolleras och centreras manuellt av guldsmed före paketering.
                                </p>
                            </div>
                        </section>
                    }
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
                                onChange={(e) => { setPersonalMessage(e.target.value), setSignsUsed(e.target.value.length) }}
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

                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                        <button type="button" className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#d6cbbe] hover:bg-[#f4efe6] text-[#1a3b2b] text-sm font-semibold transition text-center" onClick={() => navigate("/gifts")}>
                            <span className="text-xs font-semibold flex items-center gap-2"><ArrowLeft /> Tillbaka till gåvor </span>
                        </button>
                        <button type="button" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#244d36] hover:bg-[#1a3b2b] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2">
                            <span className="text-xs font-semibold flex items-center gap-2">Lägg till i kundvagn <ArrowRight /></span>

                        </button>
                    </div>

                </div>

                <div className="lg:col-span-5 space-y-6">

                    <div className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
                        {(gift.category_id === 10 || gift.category_id === 14 || gift.category_id === 24) &&
                            <div>

                                <span className="text-[11px] font-semibold text-[#b89047] uppercase tracking-wider block mb-3">
                                    Simulerad förhandsvisning
                                </span>

                                <div className="relative rounded-xl overflow-hidden aspect-square bg-[#f4efe6] border border-[#e6ded3] mb-4 group">
                                    <img src={`/` + gift.thumbnail_image_url} alt={gift.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-black/30 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition">
                                            Gravyr simulerad: {selectedImprint == 'initials' ? imprintText + imprintDate : selectedImprint == 'name-only' ? imprintText : confirmExistence(symbolsList.find(symbol => symbol.key == imprintSymbol)).name}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3 bg-[#1a3b2b]/85 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[#b89047]"></span>
                                        Handgraverat i Stockholm
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="p-5 rounded-xl bg-[#fdfbf7] border border-[#e6ded3] relative shadow-inner">
                            <div className="text-center mb-3">
                                <span className="text-[10px] font-serif uppercase tracking-widest text-[#b89047]">Presently Hälsningskort</span>
                                <div className="w-8 h-[1px] bg-[#b89047]/40 mx-auto mt-1"></div>
                            </div>
                            <p className="font-serif italic text-sm text-[#1a3b2b] leading-relaxed text-center px-2">
                                {personalMessage}
                            </p>
                            <div className="mt-4 text-right pr-2">
                                <span className="font-serif text-xs text-[#244d36] font-semibold">— Varma hälsningar, {nameToUse}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#effcf9] border border-[#d2ebe5] space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-[#244d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Presently Signature Garanti
                        </h4>
                        <ul className="text-xs text-[#2f5e43] space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-[#b89047] font-bold">✓</span>
                                <span><strong>Inga dolda kostnader:</strong> Gravyr, premiumpapper och frakt ingår helt i dina {gift.point_cost} poäng.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#b89047] font-bold">✓</span>
                                <span><strong>Diskret leverans:</strong> Paketet anländer till mottagaren i en elegant, omarkerad ytterkartong utan prisangivelser.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#b89047] font-bold">✓</span>
                                <span><strong>Leveranstid:</strong> Skickas inom 1-2 helgfria vardagar med spårbar PostNord-frakt direkt till brevlådan.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>

    )
}

export default customizeGift
