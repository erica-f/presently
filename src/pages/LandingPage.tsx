import './LandingPage.css'
import { Button } from '../components/Button'

type Membership = {
  name: 'Simple' | 'Plus' | 'Signature'
  points: number
  description: string
  benefits: string[]
}

type Product = {
  id: string
  name: string
  category: string
  points: number
  tier: 'Simple eller högre' | 'Plus eller högre' | 'Endast Signature'
  imageUrl: string
  description: string
}

// TODO: Replace with API when implemented
const memberships: Membership[] = [
  {
    name: 'Simple',
    points: 100,
    description: 'För mindre vardagsgåvor, kaffe, te och utvalda delikatesser.',
    benefits: ['100 poäng per månad', 'Tillgång till basurvalet', 'Fysiskt hälsningskort ingår'],
  },
  {
    name: 'Plus',
    points: 300,
    description: 'Regelbunden uppvaktning med botanisk hudvård, doftljus och svensk formgivning.',
    benefits: ['300 poäng per månad', 'Tillgång till hela standardsortimentet', 'Förtur till säsongssläpp'],
  },
  {
    name: 'Signature',
    points: 500,
    description: 'Exklusiva set, munblåst glas och hantverk för speciella tillfällen och jubileum.',
    benefits: ['500 poäng per månad', 'Tillgång till alla premiumnivåer', 'Personlig gåvobud och signering'],
  },
]
// TODO: Replace with API when implemented
const exampleProducts: Product[] = [
  {
    id: 'coffee-chocolate',
    name: 'Åre Rost & Havssaltchoklad',
    category: 'Delikatess',
    points: 100,
    tier: 'Simple eller högre',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XrnVppZM3wxo89zV_GRAj4Q-YENFcx8QGGMIEN6x29SsZlBY6ag6P0OJGj1T1h6eP1sYP5uHOl_v0yVSa547VLd4iYVLr78fnLfeOVe_5IGpEWCUIJs-X4ExwDhfnDaoVkfAgop4zaFP_RkV4UFTDWlwB-RFO9vQM2gAhSNz0DXDrg3xcLoWZc89UteUiruY4843EHu3l42IImeXWeAPRmBmomc0LgD3VSCeg5whWH5ZjVUX34J3inYw',
    description: 'Hantverksrostat kaffe tillsammans med prisbelönt svensk havssaltchoklad.',
  },
  {
    id: 'botanica',
    name: 'Botanica Handduo',
    category: 'Vård & Hem',
    points: 300,
    tier: 'Plus eller högre',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XrPL7pmWjzWeKq9O6Jp77BIaQ8o0bgZV7WQeTB1EZXbPaPiRrnPeEhX7TLX6U4HloeW5kpbylB1JTngQzPSsh7gLvEW35fIGFMz1PftXxmGsvDH5QX3S01YudFx4-Z3pNFbDpEqbE9UudOy9Z32F0TlgK1E5Lc650NpDRP3XXnTc5G01BcZMbeviRaN7ECvYL8OSSM-h0yc32TCHC7lkkbNFECNSxzv4kzdwrYYWdJJ7IPdAXTnlcAWfM',
    description: 'Ekologisk handtvål och vårdande lotion med doft av tallbarr och bergamott.',
  },
  {
    id: 'glass-vase',
    name: 'Munblåst Glasvas & Mässing',
    category: 'Skandinavisk Form',
    points: 500,
    tier: 'Endast Signature',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XLKvzBlITWbWQkO0Q2CU0rxpYMUgv2kXNwqDuhgd7KYYC8c8_Q8ZQtxcwJGEH6tklR3P20M6z2-txg4gOBduNn698BdtPEToWUIID37-nncTLkbLfFwSk0VMyEHCAQTZ7P6khYl7Y3XL_XCHBK2QqyFnxOzI4XiSxjeUPwpBUi4d-y0C6MnwUMJTaRrhUUCrVB4KVZ5MBUWfJMrCgekAmMcbxuma4v0kL3IyN8H5a3iYt4sYQRd9cqoeA',
    description: 'Handblåst tonat rökglas tillsammans med gedigen ljusstake i borstad mässing.',
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

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function LandingPage() {
  return (
    <main className="w-full">
      <section aria-labelledby="hero-title" className="landing-section border-b border-border">
        <div className="landing-container grid items-center gap-8 md:grid-cols-12 md:gap-12">
          <div className="space-y-5 md:col-span-7">
            <h1 id="hero-title" className="max-w-xl text-3xl leading-tight tracking-tight text-foreground sm:text-4xl font-bold">
              Skicka gåvor utan krångel.
            </h1>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              Samla gåvopoäng varje månad. Välj noga utvalda kvalitetsprodukter och skicka direkt hem till någon du bryr dig om – precis när det passar dig.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button href="#medlemskap" icon={<ArrowIcon />} iconPosition="right" className="text-sm">
                Kom igång
              </Button>
              <Button href="#sa-fungerar-det" variant="secondary" className="text-sm">
                Se hur det fungerar
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-card border border-border bg-surface md:col-span-5">
            <img
              alt="En inslagen Presently-gåva med ljus och kopp på ett bord"
              className="landing-hero-image"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UyQFkbqinEcUu4Wc8eQZNUPVwPmbRcw1RTgukK-S6Z-Va33ex87whv85L7YOf25Zmn3lTwgO_FxGe0bXA2rrj7w76ldqmL45iO56tji5JwsPHlzfv9LIkQN818Qi5_oTUVsy2TWWE8uXM0fA48OcUk71ZKUzFVN8A5noPu7JC-fliZs0AadYFzAUn98TLBMW5wnBqJ5zxATan3AQNhPBMw8P0z3IwNZzDaRmvR2ouY9nGfh6ylUxJRAho"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="landing-section border-b border-border" id="sa-fungerar-det">
        <div className="landing-container">
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

      <section aria-labelledby="membership-title" className="landing-section border-b border-border" id="medlemskap">
        <div className="landing-container">
          <div className="mb-10 max-w-xl">
            <h2 id="membership-title" className="text-2xl tracking-tight text-foreground font-bold">Hitta din nivå av omtanke</h2>
            <p className="mt-1 text-sm text-muted-foreground">Alltid fri frakt, fin inslagning och personligt kort inkluderat i varje utskick.</p>
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {memberships.map((membership) => (
              <article className={`membership-card ${membership.name === 'Plus' ? 'membership-card-featured' : ''}`} key={membership.name}>
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
                      <li className="flex items-center gap-2" key={benefit}><CheckIcon />{benefit}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  href="#kom-igang"
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

      <section aria-labelledby="gifts-title" className="landing-section border-b border-border" id="gavor">
        <div className="landing-container">
          <div className="mb-10 max-w-xl">
            <h2 id="gifts-title" className="text-2xl tracking-tight text-foreground font-bold">Utvalda gåvoexempel</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ett kurerat sortiment från mindre skandinaviska formgivare och producenter.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {exampleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">{product.category}</span>
                      <span className="text-xs font-bold text-primary">{product.points} p</span>
                    </div>
                    <h3 className="mb-1 text-base text-foreground font-bold">{product.name}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="px-5 pb-5 pt-1">
                    <span className="inline-block rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{product.tier}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="bg-surface-muted px-6 py-14 text-center md:py-16" id="kom-igang">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 id="cta-title" className="text-2xl tracking-tight text-foreground sm:text-3xl font-bold">Börja prenumerera på omtanke</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Välj den nivå som passar dig bäst. Byt nivå eller pausa ditt medlemskap när som helst.</p>
          <div className="pt-2">
            <Button
              href="#medlemskap"
              icon={<ArrowIcon />}
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
