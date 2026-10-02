import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft, UserStar, ChevronDown, Star, ArrowRight } from 'lucide-react'
import GiftsCard from '../components/GiftsCard'
import { confirmExistence } from '../utils/confirmType'
import type { Membership, GiftInfo, Categories } from '../types/gifts'
import { getList } from '../lib/giftsApi'
import { Button } from '../components/Button'
import useLoginStatus from "../hooks/useLoginStatus";
import { ProfileApiError, profileApi, type Profile as ProfileData } from '../lib/profileApi'

const Gifts = () => {
  const handleUnauthorized = useLoginStatus();
  const [error, setError] = useState('');
  const [gifts, setGifts] = useState<GiftInfo[]>([]);
  const [allgifts, setAllGifts] = useState<GiftInfo[]>([]);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [level, setLevel] = useState<number | string>(0);
  const [selectedCat, setSelectedCat] = useState<number | string>(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [cartPoints, setCartPoints] = useState(0)

  //divide products in pages
  const [currentPage, setCurrentPage] = useState(1);
  const numberOfPages = Math.ceil(gifts.length / 24);
  const currentItems = gifts.slice((currentPage - 1) * 24, currentPage * 24);
  const pages = [...Array(numberOfPages).keys()];

  //Scrolling categories
  const [scrolled, setScrolled] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    categoryScrollRef.current?.scrollBy({
      left: direction === 'right' ? 300 : -300,
      behavior: 'smooth',
    });
  };
  const handleCategoryScroll = () => {
    setScrolled(categoryScrollRef.current?.scrollLeft ?? 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [list, categoryList, membershipList, profileData, cartData] = await Promise.all([getList('gifts'), getList('categories'), getList('memberships'), profileApi.get(), getList('cart')]);
        setGifts(list);
        setAllGifts(list);
        setCategories(categoryList);
        setMemberships(membershipList);
        setProfile(profileData);
        setCartPoints(cartData.pointTotal);
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
    fetchData();
  }, [handleUnauthorized])

  const userMembershipId = Number(profile?.plan?.level ?? 0);
  const userMembership = !loading && !error ? confirmExistence(memberships.find(item => item.level == userMembershipId)) : { id: 0, name: '', level: 0 };
  const pointsLeft = profile?.pointBalance ? profile?.pointBalance - cartPoints : 0

  //Filter product by category or membership 
  const filterGifts = (item: number | string, type: string) => {
    const selectedGifts: GiftInfo[] = [];

    if (type == 'category') {
      if (item == 0) {
        setGifts(allgifts);
        setLevel(0);
      } else {
        allgifts.map(gift => {
          if (gift.category_id == item || item == 0) {
            if (gift.minimum_membership_plan_level == level || level == 0) {
              selectedGifts.push(gift);
            }
          }
        })
        setGifts(selectedGifts);
      }
    } else {
      allgifts.map(gift => {
        if (gift.category_id == selectedCat || selectedCat == 0) {
          if (gift.minimum_membership_plan_level == item || item == 0) {
            selectedGifts.push(gift);
          }
        }
      })
      setGifts(selectedGifts);
    }
    setCurrentPage(1);
  }

  if (loading) return <main className="grid min-h-[50vh] flex-1 place-items-center text-sm text-muted-foreground">
    <p className="text-muted-foreground" role="status">Laddar gåvor…</p>
  </main>
  if (error) return <main className="grid min-h-[50vh] flex-1 place-items-center text-sm">
    <div className="border border-danger/30 bg-surface p-6">
      <h1 className="text-2xl text-foreground">Kunde inte hämta in gåvor</h1>
      <p className="mt-2 text-muted-foreground">{error}</p>
    </div>
  </main>

  return (
    <main className="w-full max-w-7xl mx-auto mb-8 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
      <section className="mb-10 bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-12 w-48 h-48 bg-ring/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-inner">
            <UserStar className="size-5 stroke-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">Inloggad som</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ring/40 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-active mr-1.5"></span>
                Presently {userMembership.name}
              </span>
            </div>
            <p className="text-sm text-[#506359] mt-0.5">
              Du har tillgång till gåvor i nivåerna <strong className="text-foreground font-semibold">{confirmExistence(memberships.find(item => item.level == 1)).name}</strong>
              {
                userMembershipId == 2 ? <span> och <strong className="text-foreground font-semibold">{confirmExistence(memberships.find(item => item.level == 2)).name}</strong>.</span> : userMembershipId == 3 ? <span>, <strong className="text-foreground font-semibold">{confirmExistence(memberships.find(item => item.level == 2)).name}</strong> samt <strong className="text-foreground font-semibold">{confirmExistence(memberships.find(item => item.level == 3)).name}</strong>.</span> : '.'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border relative z-10">
          <div className="text-left md:text-right">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tillgängliga poäng</div>
            <div className="flex items-baseline md:justify-end gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">{pointsLeft} / {profile?.pointBalance}</span>
              <span className="text-sm font-semibold text-accent">p</span>
            </div>
            <span className="text-xs text-muted-foreground" >{cartPoints} poäng används av gåvor i kundvagnen</span>
          </div>
          <div className="h-9 w-px bg-[#e4ede7] hidden sm:block"></div>
          {userMembershipId < 3 &&
            <a href="#signature-info" className="text-xs font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1 group py-1.5 px-3 rounded-lg">
              <span>Om {confirmExistence(memberships.find(item => item.level == 3)).name}-gåvor</span>
              <ChevronRight className="size-4" />
            </a>
          }
        </div>
      </section>

      <header className="mb-10 text-left max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary tracking-tight mb-3">
          Gåvor
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Välj en genomtänkt gåva till någon du bryr dig om. Alla gåvor paketeras för hand i återvunnet premiumpapper med handskrivet kort och levereras direkt till mottagaren.
        </p>
      </header>

      <section className="mb-10 space-y-4">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {scrolled > 0 && <button className="py-2 px-1" onClick={() => scrollCategories('left')}><ChevronLeft className="size-4" strokeWidth={1.8} /></button>}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" ref={categoryScrollRef} onScroll={handleCategoryScroll}>
            <Button variant={selectedCat == 0 ? 'primary' : 'secondary'} className="whitespace-nowrap cursor-pointer" onClick={() => { setSelectedCat(0); filterGifts(0, 'category') }}>
              <span>Alla gåvor</span>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{allgifts.length}</span>
            </Button>
            {categories.map((category) => (
              <Button variant={selectedCat == category.id ? 'primary' : 'secondary'} className="whitespace-nowrap cursor-pointer" id={'cat' + category.id.toString()} onClick={() => { setSelectedCat(category.id); filterGifts(category.id, 'category') }} key={category.id}>
                <span>{category.label}</span>
              </Button>
            ))
            }
          </div>
          <button className="py-2 px-1" onClick={() => scrollCategories('right')}><ChevronRight className="size-4" strokeWidth={1.8} /></button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <select className="appearance-none bg-surface border border-border text-sm text-primary py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-ring cursor-pointer" onChange={(e) => { setLevel(e.target.value); filterGifts(e.target.value, 'level') }} value={level}>
                <option value="0">Gåvonivå</option>
                <option value="1">{confirmExistence(memberships.find(item => item.level == 1)).name}</option>
                <option value="2">{confirmExistence(memberships.find(item => item.level == 2)).name}</option>
                <option value="3">{confirmExistence(memberships.find(item => item.level == 3)).name}</option>
              </select>
              <ChevronDown className="size-4 w-4 h-4 text-[#6e8076] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
      {currentItems.length > 0 ?
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {
            currentItems.map((gift) => (
              <GiftsCard userMembershipId={userMembershipId} userCurrentPoints={pointsLeft} gift={gift} memberships={memberships} category={confirmExistence(categories.find(item => item.id == gift.category_id))} key={gift.id} />
            ))
          }
        </section>
        :
        <div className="w-full mb-10 bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm ">Inga gåvor matchar ditt filter.</div>
      }
      {pages.length > 1 &&
        <section className="mb-10 mt-10">
          <div className="flex">
            <Button icon={<ChevronLeft />} onClick={() => currentPage >= 2 && setCurrentPage(currentPage - 1)}>
              Föregående
            </Button>
            {pages.map(page => (
              <Button
                variant={currentPage == page + 1 ? 'primary' : 'secondary'}
                className="ml-1 cursor-pointer ml-2 mr-2"
                onClick={() => setCurrentPage(page + 1)}
                key={page + 1}
              >
                {page + 1}
              </Button>
            ))}
            <Button icon={<ChevronRight />} iconPosition='right' onClick={() => currentPage <= pages.length - 1 && setCurrentPage(currentPage + 1)}>
              Nästa
            </Button>
          </div>
        </section>
      }
      {userMembershipId < 3 &&
        <section className="mt-16 bg-gradient-to-r from-[#244d36] to-[#173324] rounded-3xl p-8 sm:p-10 text-primary-foreground relative overflow-hidden shadow-lg" id="signature-info">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#bb9b56]/10 transform skew-x-12 pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-semibold mb-4 border border-white/10">
              <Star className="size-3 fill-accent stroke-accent" />
              <span>Presently Medlemsförmåner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary-foreground tracking-tight mb-3">
              Vill du kunna välja skräddarsydda {confirmExistence(memberships.find(item => item.level == 3)).name}-gåvor?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-6 font-light">
              Som <strong className="font-medium">{userMembership.name}-medlem</strong> sparar du dina {profile?.pointBalance} poäng säkert varje månad. När du uppgraderar till <strong className="text-accent font-medium">{confirmExistence(memberships.find(item => item.level == 3)).name}</strong> behåller du självklart alla dina intjänade poäng och låser upp tillgång till obegränsade sparade mottagare samt våra mest exklusiva kureringar.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a href="/checkout/3">
                <button className="bg-accent hover:bg-warning font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-md flex items-center gap-2" >
                  <span>Uppgradera medlemskap</span>
                  <ArrowRight className="size-4" />
                </button>
              </a>
              <a href="/#medlemskap" className="text-sm font-medium text-primary-foreground hover:text-white underline underline-offset-4 transition-colors">
                Jämför alla medlemsnivåer
              </a>
            </div>
          </div>
        </section>
      }
    </main>
  )
}

export default Gifts
