import { useState, useEffect, useRef } from 'react'
import GiftsCard from '../components/GiftsCard'
import { confirmExistence } from '../utils/confirmType'
import type { Membership, UserDetail, GiftInfo, Categories } from '../types/gifts'
import { getGiftsList, getCategoriesList } from '../api/giftsApi'
import { getMembershipPlans } from '../api/generalApi'

const Gifts = () => {
  let [gifts, setGifts] = useState<GiftInfo[]>([]);
  let [allgifts, setAllGifts] = useState<GiftInfo[]>([]);
  let [categories, setCategories] = useState<Categories[]>([]);
  let [memberships, setMemberships] = useState<Membership[]>([]);
  let [loading, setLoading] = useState(true);

  //Scrolling categories
  let [scrolled, setScrolled] = useState(0);
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
    setLoading(true);
    const fetchData = async () => {
      try {
        const list = await getGiftsList();
        setGifts(list);
        setAllGifts(list);
        const categoryList = await getCategoriesList();
        setCategories(categoryList);
        const membershipList = await getMembershipPlans();
        setMemberships(membershipList);
        setLoading(false);
      } catch (error) {
        console.log("Couldn't fetch products: " + error);
      }
    }

    fetchData();
  }, [])

  // Temp data, will be replaced by data fetched from API
  const userDetails: UserDetail = {
    first_name: 'Test',
    user_id: 1,
    membership_id: 2,
    current_points: 200,
  }

  let userMembership = !loading ? confirmExistence(memberships.find(item => item.level == userDetails.membership_id)) : { id: 0, name: '', level: 0 };

  //Filter product by category or membership 
  const filterGifts = (item: number | string, type: string) => {
    let selectedGifts: GiftInfo[] = [];
    if (item == 0) {
      setGifts(allgifts);
    } else {
      if (type == 'category') {
        allgifts.map(gift => {
          if (gift.category_id == item) {
            selectedGifts.push(gift);
          }
        })
      } else {
        allgifts.map(gift => {
          if (gift.minimum_membership_plan_id == item) {
            selectedGifts.push(gift);
          }
        })
      }
      setGifts(selectedGifts);
    }
  }

  return (
    <>
      {loading ?
        <p>loading..</p>
        :
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <section className="mb-10 bg-white border border-[#e4ede7] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-12 w-48 h-48 bg-[#effcf9] rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start sm:items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#244d36] text-[#bb9b56] flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#3b5e4c]">Inloggad som</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#effcf9] text-[#244d36] border border-[#d4ede4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#244d36] mr-1.5"></span>
                    Presently {userMembership.name}
                  </span>
                </div>
                <p className="text-sm text-[#506359] mt-0.5">
                  Du har tillgång till gåvor i nivåerna <strong className="text-[#193927] font-semibold">{confirmExistence(memberships.find(item => item.level == 1)).name}</strong>
                  {
                    userDetails.membership_id == 2 ? <span> och <strong className="text-[#193927] font-semibold">{confirmExistence(memberships.find(item => item.level == 2)).name}</strong>.</span> : userDetails.membership_id == 3 ? <span>, <strong className="text-[#193927] font-semibold">{confirmExistence(memberships.find(item => item.level == 2)).name}</strong> samt <strong className="text-[#193927] font-semibold">{confirmExistence(memberships.find(item => item.level == 3)).name}</strong>.</span> : '.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-[#edf3ef] relative z-10">
              <div className="text-left md:text-right">
                <div className="text-xs font-medium text-[#6b7c73] uppercase tracking-wider">Ditt poängsaldo</div>
                <div className="flex items-baseline md:justify-end gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#193927] tracking-tight">{userDetails.current_points}</span>
                  <span className="text-sm font-semibold text-[#bb9b56]">p</span>
                </div>
              </div>
              <div className="h-9 w-px bg-[#e4ede7] hidden sm:block"></div>
              <a href="#signature-info" className="text-xs font-semibold text-[#244d36] hover:text-[#bb9b56] transition-colors flex items-center gap-1 group py-1.5 px-3 rounded-lg hover:bg-[#effcf9]">
                <span>Om {confirmExistence(memberships.find(item => item.level == 3)).name}-gåvor</span>
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </section>

          <header className="mb-10 text-left max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#193927] tracking-tight mb-3">
              Gåvor
            </h1>
            <p className="text-base sm:text-lg text-[#55695f] leading-relaxed">
              Välj en genomtänkt gåva till någon du bryr dig om. Alla gåvor paketeras för hand i återvunnet premiumpapper med handskrivet kort och levereras direkt till mottagaren.
            </p>
          </header>

          <section className="mb-10 space-y-4">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {scrolled > 0 && <span onClick={() => scrollCategories('left')}>{'<<'}</span>}
              {/* <!-- CATEGORY TABS / CHIPS --> */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" ref={categoryScrollRef} onScroll={handleCategoryScroll}>
                <button className="filter-chip-active px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 bg-white border border-[#e4ede7]" onClick={() => filterGifts(0, 'category')}>
                  <span>Alla gåvor</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{allgifts.length}</span>
                </button>
                {categories.map((category) => (
                  <button className="filter-chip-inactive px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all bg-white border border-[#e4ede7]" id={'cat' + category.id.toString()} onClick={() => filterGifts(category.id, 'category')} key={category.id}>
                    {category.label}
                  </button>
                ))
                }
              </div>
              <span onClick={() => scrollCategories('right')}>{'>>'}</span>

              {/* <!-- SEARCH & POINT TIER FILTER --> */}
              <div className="flex items-center gap-3 shrink-0">
                {/* <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Sök gåva eller hantverkare..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e4ede7] rounded-xl placeholder-[#8a9b91] text-[#1c2922] focus:outline-none focus:ring-2 focus:ring-[#244d36]/20 focus:border-[#244d36] transition-all"
               />
                <svg className="w-4 h-4 text-[#8a9b91] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div> */}

                <div className="relative">
                  <select className="appearance-none bg-white border border-[#e4ede7] text-sm text-[#3f4e46] py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-[#244d36] cursor-pointer" onChange={(e) => filterGifts(e.target.value, 'level')}>
                    <option value="0">Gåvonivå</option>
                    <option value={memberships[0].level}>{memberships[0].name}</option>
                    <option value={memberships[1].level}>{memberships[1].name}</option>
                    <option value={memberships[2].level}>{memberships[2].name}</option>
                  </select>
                  <svg className="w-4 h-4 text-[#6e8076] absolute right-2.5 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {gifts.map((gift) => (
              <GiftsCard userDetails={userDetails} gift={gift} memberships={memberships} category={confirmExistence(categories.find(item => item.id == gift.category_id))} key={gift.id} />
            ))
            }
          </section>
          {userDetails.membership_id < 3 &&

            <section className="mt-16 bg-gradient-to-r from-[#244d36] to-[#173324] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#bb9b56]/10 transform skew-x-12 pointer-events-none"></div>

              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#bb9b56] text-xs font-semibold mb-4 border border-white/10">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Presently Medlemsförmåner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight mb-3">
                  Vill du kunna välja skräddarsydda {confirmExistence(memberships.find(item => item.level == 3)).name}-gåvor?
                </h2>
                <p className="text-sm sm:text-base text-[#d8e5df] leading-relaxed mb-6 font-light">
                  Som <strong className="text-white font-medium">{userMembership.name}-medlem</strong> sparar du dina {userDetails.current_points} poäng säkert varje månad. När du uppgraderar till <strong className="text-[#bb9b56] font-medium">{confirmExistence(memberships.find(item => item.level == 3)).name}</strong> behåller du självklart alla dina intjänade poäng och låser upp handgjord gravyr, obegränsade sparade mottagare och våra mest exklusiva kureringar.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button className="bg-[#bb9b56] hover:bg-[#a88a48] text-[#193927] font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-md flex items-center gap-2">
                    <span>Uppgradera medlemskap</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <a href="#" className="text-sm font-medium text-[#d8e5df] hover:text-white underline underline-offset-4 transition-colors">
                    Jämför alla medlemsnivåer
                  </a>
                </div>
              </div>
            </section>
          }
        </main>
      }
    </>
  )
}

export default Gifts
