import { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../components/Button'
import { getList } from '../api/giftsApi'
import type { Categories, GiftInfo, Membership as GiftMembership } from '../types/gifts'
import { selectRandomItems } from '../utils/selectRandomItems'

type Membership = {
    id: number
    name: 'Simple' | 'Plus' | 'Signature'
    points: number
    description: string
    benefits: string[]
}

type FeaturedProduct = {
    id: number
    name: string
    description: string
    points: number
    category: string
    membership: string
    imageUrl: string
}

// TODO: Replace with API when implemented
const memberships: Membership[] = [
    {
        id: 1,
        name: 'Simple',
        points: 100,
        description: 'Ett basutbud med framför allt matvaror, köksredskap och mindre vardagsprodukter.',
        benefits: ['100 poäng / månad', 'Gåvor markerade level 1', 'Välj mottagare och skicka'],
    },
    {
        id: 2,
        name: 'Plus',
        points: 300,
        description: 'Ett bredare sortiment med kläder, skor, accessoarer, parfym, inredning och fler köksprodukter.',
        benefits: ['300 poäng / månad', 'Gåvor markerade level 1 och 2', 'Spara upp till 3 favoritkontakter'],
    },
    {
        id: 3,
        name: 'Signature',
        points: 500,
        description: 'Premiumutbud med bland annat smartphones, laptops, möbler, fordon och exklusiva klockor.',
        benefits: ['500 poäng / månad', 'Gåvor markerade level 1, 2 och 3', 'Spara obegränsat antal favoritkontakter'],
    },
]
const steps = [
    {
        number: '01',
        title: 'Välj nivå',
        description: 'Välj det medlemskap som passar dina behov. Du kan enkelt uppgradera, nedgradera eller pausa när du vill.',
    },
    {
        number: '02',
        title: 'Samla poäng',
        description: 'Ditt konto fylls automatiskt på varje månad. Oanvända poäng sparas tryggt i ditt saldo utan utgångsdatum.',
    },
    {
        number: '03',
        title: 'Skicka gåva',
        description: 'Välj en fin present ur katalogen och bifoga ett hälsningskort. Vi packar omsorgsfullt och skickar till mottagaren.',
    },
]

function LandingPage() {
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
    const [featuredGiftsLoading, setFeaturedGiftsLoading] = useState(true)
    const [featuredGiftsError, setFeaturedGiftsError] = useState(false)

    useEffect(() => {
        let isCurrent = true

        const loadFeaturedGifts = async () => {
            try {
                const [giftsData, categoriesData, membershipsData] = await Promise.all([
                    getList('gifts') as Promise<GiftInfo[]>,
                    getList('categories') as Promise<Categories[]>,
                    getList('memberships') as Promise<GiftMembership[]>,
                ])
                const products = giftsData
                    .filter((gift) => gift.thumbnail_image_url.trim() !== '')
                    .map((gift) => {
                        const category = categoriesData.find((item) => item.id === gift.category_id)
                        const membership = membershipsData.find((item) => item.level === gift.minimum_membership_plan_level)

                        if (!category || !membership) {
                            return null
                        }

                        return {
                            id: gift.id,
                            name: gift.name,
                            description: gift.description,
                            points: gift.point_cost,
                            category: category.label,
                            membership: membership.name,
                            imageUrl: gift.thumbnail_image_url.startsWith('/') ? gift.thumbnail_image_url : `/${gift.thumbnail_image_url}`,
                        }
                    })
                    .filter((product): product is FeaturedProduct => product !== null)

                if (isCurrent) {
                    setFeaturedProducts(selectRandomItems(products))
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
        <main className="w-full">
            <section aria-labelledby="hero-title" className="border-b border-border py-10 md:py-16">
                <div className="mx-auto grid w-[calc(100%-2rem)] max-w-4xl items-center gap-8 sm:w-[calc(100%-3rem)] md:grid-cols-12 md:gap-12">
                    <div className="space-y-5 md:col-span-7">
                        <h1 id="hero-title" className="max-w-xl text-3xl leading-tight tracking-tight text-foreground sm:text-4xl font-bold">
                            Skicka gåvor utan krångel.
                        </h1>
                        <p className="max-w-2xl leading-relaxed text-muted-foreground">
                            Samla gåvopoäng varje månad. Välj noga utvalda kvalitetsprodukter och skicka direkt hem till någon du bryr dig om – precis när det passar dig.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Button href="#medlemskap" icon={<ArrowRight className="size-4" strokeWidth={1.8} />} iconPosition="right" className="text-sm">
                                Kom igång
                            </Button>
                            <Button href="#sa-fungerar-det" variant="secondary" className="text-sm">
                                Se hur det fungerar
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-card border border-border bg-surface md:col-span-5">
                        <img
                            alt="Inslagna presenter, tända ljus och tekoppar på ett dukat bord"
                            className="block h-60 w-full object-cover md:h-80"
                            src="/images/hero-gift.webp"
                        />
                    </div>
                </div>
            </section>

            <section aria-labelledby="how-title" className="scroll-mt-24 border-b border-border py-10 md:py-16" id="sa-fungerar-det">
                <div className="mx-auto w-[calc(100%-2rem)] max-w-4xl sm:w-[calc(100%-3rem)]">
                    <div className="mb-10 max-w-xl">
                        <h2 id="how-title" className="text-2xl tracking-tight text-foreground font-bold">Så fungerar Presently</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Ett flexibelt sätt att uppvakta vänner, familj och kollegor.</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3 md:divide-x md:divide-border">
                        {steps.map((step) => (
                            <article className="space-y-2 md:px-8 first:md:pl-0 last:md:pr-0" key={step.number}>
                                <span className="text-sm font-bold tracking-wider text-primary">{step.number}</span>
                                <h3 className="text-base text-foreground font-bold">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section aria-labelledby="membership-title" className="scroll-mt-24 border-b border-border py-10 md:py-16" id="medlemskap">
                <div className="mx-auto w-[calc(100%-2rem)] max-w-4xl sm:w-[calc(100%-3rem)]">
                    <div className="mb-10 max-w-xl">
                        <h2 id="membership-title" className="text-2xl tracking-tight text-foreground font-bold">Hitta din nivå av omtanke</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Alltid fri frakt, fin inslagning och personligt kort inkluderat i varje utskick.</p>
                    </div>
                    <div className="grid items-stretch gap-6 md:grid-cols-3">
                        {memberships.map((membership) => (
                            <article className={`flex flex-col justify-between overflow-hidden rounded-control border border-border bg-surface p-6 ${membership.name === 'Plus' ? 'border-primary' : ''}`} key={membership.name}>
                                <div>
                                    <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm text-foreground font-bold">{membership.name}</h3>
                                            {membership.name === 'Plus' && (
                                                <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">Populärast</span>
                                            )}
                                        </div>
                                        <span className="whitespace-nowrap text-sm font-semibold text-primary">{membership.points} p / mån</span>
                                    </div>
                                    <p className="my-4 text-xs leading-relaxed text-muted-foreground">{membership.description}</p>
                                    <ul className="mb-6 space-y-2 text-xs text-muted-foreground">
                                        {membership.benefits.map((benefit) => (
                                            <li className="flex items-center gap-2" key={benefit}><Check aria-hidden="true" className="size-3.5 shrink-0 text-primary" />{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    href={`/checkout/${membership.id}`}
                                    variant={membership.name === 'Plus' ? 'primary' : 'secondary'}
                                    className="w-full"
                                >
                                    Välj {membership.name}
                                </Button>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section aria-labelledby="gifts-title" className="scroll-mt-24 border-b border-border py-10 md:py-16" id="gavor">
                <div className="mx-auto w-[calc(100%-2rem)] max-w-4xl sm:w-[calc(100%-3rem)]">
                    <div className="mb-10 flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-xl">
                            <h2 id="gifts-title" className="text-2xl tracking-tight text-foreground font-bold">Upptäck våra gåvor</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Upptäck gåvor för olika tillfällen och nivåer – välj något som passar dina poäng.</p>
                        </div>
                        <a className="shrink-0 whitespace-nowrap text-sm font-semibold text-primary underline-offset-4 hover:underline sm:mt-1" href="/gifts">Se alla gåvor</a>
                    </div>
                    {featuredGiftsLoading && <p className="text-sm text-muted-foreground">Laddar gåvor...</p>}
                    {!featuredGiftsLoading && featuredGiftsError && <p className="text-sm text-muted-foreground">Gåvorna kunde inte laddas just nu.</p>}
                    {!featuredGiftsLoading && !featuredGiftsError && featuredProducts.length === 0 && <p className="text-sm text-muted-foreground">Det finns inga gåvor att visa just nu.</p>}
                    {!featuredGiftsLoading && !featuredGiftsError && featuredProducts.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-3">
                            {featuredProducts.map((product) => (
                                <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5ede8] bg-white shadow-sm transition-all duration-300 hover:shadow-md" key={product.id}>
                                    <div>
                                        <div className="relative flex aspect-[4/3] overflow-hidden bg-[#f5f1eb]">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="m-auto h-50 w-50 object-contain object-center transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                                                <span className="inline-flex items-center rounded-full bg-[#193927]/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                                                    Presently {product.membership}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 rounded-xl border border-[#e5ede8] bg-white/95 px-3 py-1 shadow-sm backdrop-blur-sm">
                                                <span className="text-base font-bold text-[#193927]">{product.points}</span>
                                                <span className="ml-0.5 text-xs font-semibold text-[#bb9b56]">p</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-1.5 flex items-center justify-between text-xs text-[#708278]">
                                                <span>{product.category}</span>
                                            </div>
                                            <h3 className="line-clamp-1 font-serif text-lg font-semibold text-[#193927] transition-colors group-hover:text-[#244d36]">{product.name}</h3>
                                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#52655c]">{product.description}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section aria-labelledby="cta-title" className="scroll-mt-24 bg-surface-muted px-6 py-14 text-center md:py-16" id="kom-igang">
                <div className="mx-auto max-w-xl space-y-4">
                    <h2 id="cta-title" className="text-2xl tracking-tight text-foreground sm:text-3xl font-bold">Börja prenumerera på omtanke</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">Välj den nivå som passar dig bäst. Byt nivå eller pausa ditt medlemskap när som helst.</p>
                    <div className="pt-2">
                        <Button
                            href="#medlemskap"
                            icon={<ArrowRight className="size-4" strokeWidth={1.8} />}
                            iconPosition="right"
                            className="px-6 py-3 text-sm"
                        >
                            Välj medlemskap
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default LandingPage
