import { useState, useContext } from 'react'
import { useNavigate } from 'react-router'
import AuthContext from '../contexts/AuthContext';
import { Button } from '../components/Button'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    if (user) {
        navigate("/");
    }
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
                if (email == 'test@test.com') {
                    setUser(email);

                    navigate("/");
                } else {
                    console.log("Couldn't log in");
                }
            }
        } catch (error) {
            console.log("Couldn't log in: " + error);
        }
    }

    return (
        <div className="min-h-full flex flex-col justify-center bg-warm-cream antialiased selection:bg-brand-light selection:text-brand">

            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 my-auto">
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

                    <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
                        <div className="max-w-md w-full mx-auto">

                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" opacity="0.15" />
                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" fill="none" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4a3 3 0 00-3 3v1H5a2 2 0 00-2 2v2a2 2 0 002 2h1v5a2 2 0 002 2h8a2 2 0 002-2v-5h1a2 2 0 002-2v-2a2 2 0 00-2-2h-4V7a3 3 0 00-3-3zm-1 4V7a1 1 0 112 0v1h-2zm-5 4h12v-2H6v2zm2 2v5h8v-5H8z" fill="#244D36" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-warm-muted">Presently-konto</span>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-warm-text mb-2">
                                    Logga in
                                </h1>
                                <p className="text-sm sm:text-base text-warm-muted leading-relaxed">
                                    Välkommen tillbaka till dina sparade gåvopoäng och planerade uppvaktningar.
                                </p>
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
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
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
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={type == 'password' ? 'currentColor' : 'grey'}>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        onClick={() => login()}>
                                        <span>Logga in</span>
                                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
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
                                <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
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
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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
