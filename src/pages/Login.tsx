import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/Button'
import { Gift, AtSign, Eye, EyeOff, Lock, LockKeyhole, Star } from 'lucide-react'


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');
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

    return (
        <div className="flex flex-1 flex-col justify-center bg-warm-cream antialiased selection:bg-brand-light selection:text-brand">

            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 my-auto">
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

                    <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
                        <div className="max-w-md w-full mx-auto">

                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand">
                                    <Gift className="size-5 stroke-(--accent)"/>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-warm-muted">Presently-konto</span>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-warm-text mb-2">
                                    Logga in
                                </h1>
                            </div>

                            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-2">
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
                                            className="w-full px-4 py-3 text-sm bg-warm-cream/40 border border-border rounded-xl text-warm-text placeholder:text-warm-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-warm-muted/70">
                                           <AtSign className="size-4"/>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-warm-muted">
                                            Lösenord
                                        </label>
                                        <a href="#glomt-losenord" className="text-xs font-medium text-brand hover:text-brand-dark transition-colors focus:outline-none focus:underline">
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
                                            className="w-full px-4 py-3 text-sm bg-warm-cream/40 border border-border rounded-xl text-warm-text placeholder:text-warm-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            required
                                        />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-warm-muted hover:text-warm-text transition-colors" onClick={toggleVisibility}>
                                            {type == 'password' ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}
                                            
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        onClick={() => login()}>
                                        <span>Logga in</span>
                                        <Lock className="size-4"/>
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center pt-6 border-t border-border/60">
                                <p className="text-sm text-warm-muted">
                                    Har du inget konto?
                                    <a href="#skapa-konto" className="font-semibold text-brand hover:text-brand-dark transition-colors ml-1 focus:outline-none focus:underline">
                                        Skapa konto
                                    </a>
                                </p>
                            </div>

                        </div>

                        <div className="mt-8 pt-4 flex items-center justify-center gap-6 text-xs text-warm-muted/80">
                            <span className="inline-flex items-center gap-1.5">
                                 <LockKeyhole  className="size-3"/>
                                Krypterad inloggning
                            </span>
                            <span className="w-1 h-1 rounded-full bg-warm-muted/40"></span>
                            <span>Svensk gåvoservice</span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-surface-muted border-t lg:border-t-0 lg:border-l border-border p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">

                        <div className="absolute -top-16 -right-16 w-52 h-52 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border/80 group">
                                <img
                                    src="https://lh3.googleusercontent.com/aida/AEtjO1U9x8OdFO7i3rIjIIQJOgl0Gnn13DtS_r3Cs4q2uotDy1RRs3fqMiRteMp--uDenFGMWX0WW7D_wC6EiFtMaFmNMKOuRs-wHXsRnelLU_jBBH5Zd50YXPCFz3OIyMa00QvOwd8a_PhTg8AFizoHVQoZMGcizS2IX42jjw9bVnnb3kfbXSKXTivONeOYJQQe5HWVoFIojmn1K8KzA8E0-G4XMDKLGGie6yrBmwGC8Evg8uqyorGOWKEA7b4"
                                    alt="Presentlys kurerade gåvobord i mjukt morgonljus"
                                    className="w-full h-56 sm:h-64 object-cover transform group-hover:scale-102 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium tracking-wide mb-1">
                                        Månadens gåvoutval
                                    </span>
                                    <p className="text-xs font-medium text-white/95 truncate">
                                        Handplockade delikatesser & skandinavisk keramik
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-border/60">
                                <div className="flex items-center gap-1.5 text-brand-gold mb-2">
                                    <Star className="size-3 fill-(--accent) stroke-(--accent)"/>
                                    <Star className="size-3 fill-(--accent) stroke-(--accent)"/>
                                    <Star className="size-3 fill-(--accent) stroke-(--accent)"/>
                                    <Star className="size-3 fill-(--accent) stroke-(--accent)"/>
                                    <Star className="size-3 fill-(--accent) stroke-(--accent)"/>
                                </div>
                                <p className="text-xs italic text-warm-text leading-relaxed">
                                    ”Presently gör det rofyllt att minnas födelsedagar och alltid ha en vacker gåva redo i tid.”
                                </p>
                            </div>

                            <div className="pt-2">
                                <h2 className="text-sm font-semibold text-warm-text">Skicka gåvor utan krångel.</h2>
                                <p className="text-xs text-warm-muted mt-1 leading-normal">
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
