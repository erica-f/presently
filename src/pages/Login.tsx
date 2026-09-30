import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/Button'
import { Gift, AtSign, Eye, EyeOff, LockKeyhole, Star, ArrowRight } from 'lucide-react'
import { getFeaturedGifts } from '../lib/giftsApi'
import type { FeaturedGift } from '../types/gifts'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedGift[]>([])
    const [featuredGiftsLoading, setFeaturedGiftsLoading] = useState(true)
    const [featuredGiftsError, setFeaturedGiftsError] = useState(false)
    const navigate = useNavigate();
    const auth = useAuth()

    const toggleVisibility = () => {
        if (type === 'password') {
            setType('text')
        } else {
            setType('password')
        }
    }
    async function login() {
        try {
            const login = {
                email: email,
                password: password
            }
            const url = `/api/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(login)
            });
            const data = await response.json();
            if (data.success) {
                auth.login();
                navigate("/");
            }
        } catch (error) {
            console.log("Couldn't log in: " + error);
        }
    }

    useEffect(() => {
        let isCurrent = true

        const loadFeaturedGifts = async () => {
            try {
                const products = await getFeaturedGifts()
                if (isCurrent) {
                    setFeaturedProducts(products)
                }
            } catch {
                if (isCurrent) {
                    setFeaturedGiftsError(true)
                }
            } finally {
                if (isCurrent) {
                    setFeaturedGiftsLoading(false)
                }
            }
        }

        void loadFeaturedGifts()

        return () => {
            isCurrent = false
        }
    }, [])

    return (
        <div className="flex flex-1 flex-col justify-center bg-warm-cream antialiased selection:bg-brand-light selection:text-brand">

            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 my-auto">
                <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

                    <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
                        <div className="max-w-md w-full mx-auto">

                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-primary">
                                    <Gift className="size-5 stroke-accent" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presently-konto</span>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-2">
                                    Logga in
                                </h1>
                            </div>

                            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                                        E-postadress
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="namn@exempel.se"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 text-sm bg-surface-muted border border-border rounded-xl text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                                            <AtSign className="size-4" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Lösenord
                                        </label>
                                        <a href="#glomt-losenord" className="text-xs font-medium text-primary hover:text-brand-dark transition-colors focus:outline-none focus:underline">
                                            Glömt lösenord?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={type}
                                            id="password"
                                            name="password"
                                            placeholder="••••••••••••"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 text-sm bg-surface-muted border border-border rounded-xl text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            required
                                        />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-muted-foreground transition-colors" onClick={toggleVisibility}>
                                            {type == 'password' ? <Eye className="size-4" /> : <EyeOff className="size-4" />}

                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        onClick={() => login()}>
                                        <span>Logga in</span>
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center pt-6 border-t border-border/60">
                                <p className="text-sm text-muted-foreground">
                                    Har du inget konto?
                                    <a href="#skapa-konto" className="font-semibold text-primary hover:text-primary-hover transition-colors ml-1 focus:outline-none focus:underline">
                                        Skapa konto
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <LockKeyhole className="size-3" />
                                Krypterad inloggning
                            </span>
                            <span className="w-1 h-1 rounded-full text-muted-foreground"></span>
                            <span>Svensk gåvoservice</span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-surface-muted border-t lg:border-t-0 lg:border-l border-border p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-52 h-52 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            {featuredGiftsLoading && <p className="text-sm text-muted-foreground">Laddar gåvor...</p>}
                            {!featuredGiftsLoading && featuredGiftsError && <p className="text-sm text-muted-foreground">Gåvorna kunde inte laddas just nu.</p>}
                            {!featuredGiftsLoading && !featuredGiftsError && featuredProducts.length === 0 && <p className="text-sm text-muted-foreground">Det finns inga gåvor att visa just nu.</p>}
                            {!featuredGiftsLoading && !featuredGiftsError && featuredProducts.length > 0 && (
                                <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5ede8] bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                                    <div>
                                        <div className="relative flex aspect-[4/3] overflow-hidden bg-[#f5f1eb]">
                                            <img
                                                src={featuredProducts[0].imageUrl}
                                                alt={featuredProducts[0].name}
                                                className="m-auto h-50 w-50 object-contain object-center transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                                                <span className="inline-flex items-center rounded-full bg-[#193927]/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                                                    Gåvoutval
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 rounded-xl border border-[#e5ede8] bg-white/95 px-3 py-1 shadow-sm backdrop-blur-sm">
                                                <span className="text-base font-bold text-[#193927]">{featuredProducts[0].points}</span>
                                                <span className="ml-0.5 text-xs font-semibold text-[#bb9b56]">p</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-1.5 flex items-center justify-between text-xs text-[#708278]">
                                                <span>{featuredProducts[0].category}</span>
                                            </div>
                                            <h3 className="line-clamp-1 text-lg font-semibold text-[#193927] transition-colors group-hover:text-[#244d36]">{featuredProducts[0].name}</h3>
                                        </div>
                                    </div>
                                </article>
                            )}
                        </div>

                        <div className="relative z-10 mt-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-[#f5f1eb] backdrop-blur-sm border border-border">
                                <div className="flex items-center gap-1.5 text-foreground mb-2">
                                    <Star className="size-3 fill-accent stroke-accent" />
                                    <Star className="size-3 fill-accent stroke-accent" />
                                    <Star className="size-3 fill-accent stroke-accent" />
                                    <Star className="size-3 fill-accent stroke-accent" />
                                    <Star className="size-3 fill-accent stroke-accent" />
                                </div>
                                <p className="text-xs italic text-muted-foreground leading-relaxed">
                                    ”Presently gör det rofyllt att minnas födelsedagar och alltid ha en vacker gåva redo i tid.”
                                </p>
                            </div>

                            <div className="pt-2">
                                <h2 className="text-sm font-semibold text-primary">Skicka gåvor utan krångel.</h2>
                                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                                    Dina månatliga poäng brinner aldrig inne och sparas tryggt i ditt konto månad efter månad.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

        </div>

    )
}

export default Login
