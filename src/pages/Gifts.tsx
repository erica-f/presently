import { useState } from 'react'
import GiftsCard from '../components/GiftsCard'
import { confirmExistence } from '../utils/confirmType'
import type { Membership, UserDetail, GiftInfo, Categories } from '../types/gifts'

const Gifts = () => {
  const giftInfo: GiftInfo[] = [
    {
      id: 1,
      name: 'Hantverkskaffe &amp; Chokladtryffel',
      description: 'Mellanrostat ekologiskt singelkaffe från skånska mikrorosterier, parat med handrullade havssaltstryfflar i fin ask.',
      point_cost: 100,
      minimum_membership_plan_id: 1,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1U_gA67PDRHx4wahnTqHoEebeqkxKYl_KCFQtnCF6G_jo-RLOSIucJKl8W6ZYEb4ACPVSWvPptaQJmVxIi8NzFBi9gur9PAVo8fbulxknX_MwNt707-thjqeU3Or5EXTQochoReZbloX54skybLllvvOVXIxDuttMaUP3I6IB85R7JUMSWGO0wpdcIl_N77XbfPOrq_t2NtItIsTZVB3tjGa4aAkbKbNkOeUqNRwRzJ5CF7oBMW6UfY2g',
      category: 1,
    },
    {
      id: 2,
      name: 'Botanisk Handvård & Linnehandduk',
      description: 'Ekologisk handtvål och vårdande lotion i bärnstensglas med doft av tallbarr och bergamott, ackompanjerad av tvättat linne.',
      point_cost: 300,
      minimum_membership_plan_id: 2,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1X_ESMlrV15WJacIiZEfZ12P5yH-uJbv7_ikXpP5USNEfrTPQmKHXUdM-Rq59Lo_HM_eXCJChe7Sz4DKlvv84lFE1AvCmlxoVGjqnJwSj6Tpbe5Pha3tpfKV_NijZr93ZuFoGb5F8A9_hkbGb4bUCOImldWLsFfTA1NXhk05cJsU5EAmuwBl9-NcEErnjj1GwHbHGAbofgSRRWvVQ0cWEPmM_CXVDRSKGEZAxHx9vRZ090ifzEcHvRFxuA',
      category: 2
    },
    {
      id: 3,
      name: 'Munblåst Vas & Mässingsljusstake',
      description: 'Skandinavisk inredningsfavorit i rökfärgat glas med massiv mässingshållare och två handstöpta herrgårdsljus.',
      point_cost: 500,
      minimum_membership_plan_id: 2,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1VYKwiYSEJDViTck3MjDzWbTb8FacATmbjRHELlqKcY8ZkuGJaj2FDj-iZ6mqJ5scVj9l0sstMtgeQhbYZfLJgwZW0z2Q7OaC0NHaPsVh7VaGt8YrXHs-Du-H6r75p4g9lDX1rLxrvmaeyDTDy1HT0MlCxQtmrku_iSg5T_BsjOTdLRJI7BumrQn_ns5BWe-Bslmjv9ojh-vcWUwAUAsnESE5Tkr_3yFSMNzwWI0kVzPmIbh2UQe04wTS4',
      category: 2
    },
    {
      id: 4,
      name: 'Presently Signature Exklusiv Gåvobox',
      description: 'Skräddarsydd gåva med personligt handgraverat monogram eller hälsning på svenskt läder och handgjord keramikkopp.',
      point_cost: 500,
      minimum_membership_plan_id: 3,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1U9x8OdFO7i3rIjIIQJOgl0Gnn13DtS_r3Cs4q2uotDy1RRs3fqMiRteMp--uDenFGMWX0WW7D_wC6EiFtMaFmNMKOuRs-wHXsRnelLU_jBBH5Zd50YXPCFz3OIyMa00QvOwd8a_PhTg8AFizoHVQoZMGcizS2IX42jjw9bVnnb3kfbXSKXTivONeOYJQQe5HWVoFIojmn1K8KzA8E0-G4XMDKLGGie6yrBmwGC8Evg8uqyorGOWKEA7b4',
      category: 3
    },
  ]
  let [gifts, setGifts] = useState(giftInfo);

  // Temp data, will be replaced by data fetched from API
  const userDetails: UserDetail = {
    first_name: 'Test',
    user_id: 1,
    membership_id: 3,
    current_points: 500,
  }
  // Temp data, will be replaced by data fetched from API

  const membership: Membership[] = [
    {
      name: 'Simple',
      id: 1,
    },
    {
      name: 'Plus',
      id: 2
    },
    {
      name: 'Signature',
      id: 3
    },
  ]
  // Temp data, will be replaced by data fetched from API



  const categories: Categories[] = [
    {
      name: 'Godis',
      id: 1,
      label: 'Choklad & godsaker'
    },
    {
      name: 'home',
      label: 'Hem & livsstil',
      id: 2
    },
    {
      name: 'personal',
      label: 'Personligt & Handgjort',
      id: 3
    }
  ]
  let userMembership = confirmExistence(membership.find(item => item.id == userDetails.membership_id));

  const filterGifts = (item: number | string, type: string) => {
    let selectedGifts: GiftInfo[] = [];
    console.log(type);
    if (item == 0) {
      setGifts(giftInfo);
    } else {
      if (type == 'category') {
        giftInfo.map(gift => {
          if (gift.category == item) {
            selectedGifts.push(gift);
          }
        })
      } else {
        giftInfo.map(gift => {
          if (gift.minimum_membership_plan_id == item) {
            selectedGifts.push(gift);
          }
        })
      }
      setGifts(selectedGifts);
    }
  }


  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
      <section className="mb-10 bg-white border border-[#e4ede7] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-12 w-48 h-48 bg-[#effcf9] rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#244d36] text-[#bb9b56] flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              Du har tillgång till gåvor i nivåerna <strong className="text-[#193927] font-semibold">Simple</strong>
              {
                userDetails.membership_id == 2 ? <span> och <strong className="text-[#193927] font-semibold">Plus</strong>.</span> : userDetails.membership_id == 3 ? <span>, <strong className="text-[#193927] font-semibold">Plus</strong> samt <strong className="text-[#193927] font-semibold">Premium</strong>.</span> : '.'
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
            <span>Om Signature-gåvor</span>
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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

          {/* <!-- CATEGORY TABS / CHIPS --> */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 ">
            <button className="filter-chip-active px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 bg-white border border-[#e4ede7]" onClick={() => filterGifts(0, 'category')}>
              <span>Alla gåvor</span>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{giftInfo.length}</span>
            </button>
            {categories.map((category) => (
              <button className="filter-chip-inactive px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all bg-white border border-[#e4ede7]" onClick={() => filterGifts(category.id, 'category')} key={category.id}>
                {category.label}
              </button>
            ))
            }
          </div>

          {/* <!-- SEARCH & POINT TIER FILTER --> */}
          <div className="flex items-center gap-3 shrink-0">
            {/* <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Sök gåva eller hantverkare..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e4ede7] rounded-xl placeholder-[#8a9b91] text-[#1c2922] focus:outline-none focus:ring-2 focus:ring-[#244d36]/20 focus:border-[#244d36] transition-all"
               />
                <svg className="w-4 h-4 text-[#8a9b91] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div> */}

            <div className="relative">
              <select className="appearance-none bg-white border border-[#e4ede7] text-sm text-[#3f4e46] py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-[#244d36] cursor-pointer" onChange={(e) => filterGifts(e.target.value, 'level')}>
                <option value="0">Gåvonivå</option>
                <option value={membership[0].id}>{membership[0].name}</option>
                <option value={membership[1].id}>{membership[1].name}</option>
                <option value={membership[2].id}>{membership[2].name}</option>
              </select>
              <svg className="w-4 h-4 text-[#6e8076] absolute right-2.5 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {gifts.map((gift) => (
          <GiftsCard userDetails={userDetails} gift={gift} membership={membership} category={confirmExistence(categories.find(item => item.id == gift.category))} key={gift.id} />
        ))
        }
      </section>
      {userDetails.membership_id < 3 &&

        <section id="signature-info" className="mt-16 bg-gradient-to-r from-[#244d36] to-[#173324] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#bb9b56]/10 transform skew-x-12 pointer-events-none"></div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#bb9b56] text-xs font-semibold mb-4 border border-white/10">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Presently Medlemsförmåner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight mb-3">
              Vill du kunna välja skräddarsydda Signature-gåvor?
            </h2>
            <p className="text-sm sm:text-base text-[#d8e5df] leading-relaxed mb-6 font-light">
              Som <strong className="text-white font-medium">{userMembership.name}-medlem</strong> sparar du dina {userDetails.current_points} poäng säkert varje månad. När du uppgraderar till <strong className="text-[#bb9b56] font-medium">Signature</strong> behåller du självklart alla dina intjänade poäng och låser upp handgjord gravyr, obegränsade sparade mottagare och våra mest exklusiva kureringar.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-[#bb9b56] hover:bg-[#a88a48] text-[#193927] font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-md flex items-center gap-2">
                <span>Uppgradera medlemskap</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
  )
}

export default Gifts
