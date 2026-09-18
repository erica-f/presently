import  GiftsCard from '../components/GiftsCard'

type Membership = {
  name: 'Simple' | 'Plus' | 'Signature'
  id: number
}
type UserDetail = {
  first_name: string
  user_id: number
  membership_name: string
  membership_id: number
  current_points: number
}
type ProductInfo = {
  id: number
  name: string
  description: string
  point_cost: number
  minimum_membership_plan_id: number,
  thumbnail_img_url: string
  category: string
}

const Gifts = () => {

  // Temp data, will be replaced by data fetched from API
  const userDetails: UserDetail = {
    first_name: 'Test',
    user_id: 1,
    membership_name: 'Plus',
    membership_id: 2,
    current_points: 420,
  }
  // Temp data, will be replaced by data fetched from API

  const memberships: Membership[] = [
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

  const productInfo: ProductInfo[] = [
    {
      id: 1,
      name: 'Hantverkskaffe &amp; Chokladtryffel',
      description: 'Mellanrostat ekologiskt singelkaffe från skånska mikrorosterier, parat med handrullade havssaltstryfflar i fin ask.',
      point_cost: 100,
      minimum_membership_plan_id: 1,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1U_gA67PDRHx4wahnTqHoEebeqkxKYl_KCFQtnCF6G_jo-RLOSIucJKl8W6ZYEb4ACPVSWvPptaQJmVxIi8NzFBi9gur9PAVo8fbulxknX_MwNt707-thjqeU3Or5EXTQochoReZbloX54skybLllvvOVXIxDuttMaUP3I6IB85R7JUMSWGO0wpdcIl_N77XbfPOrq_t2NtItIsTZVB3tjGa4aAkbKbNkOeUqNRwRzJ5CF7oBMW6UfY2g',
      category: 'Choklad & godsaker'
    },
    {
      id: 2,
      name: 'Botanisk Handvård & Linnehandduk',
      description: 'Ekologisk handtvål och vårdande lotion i bärnstensglas med doft av tallbarr och bergamott, ackompanjerad av tvättat linne.',
      point_cost: 300,
      minimum_membership_plan_id: 2,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1X_ESMlrV15WJacIiZEfZ12P5yH-uJbv7_ikXpP5USNEfrTPQmKHXUdM-Rq59Lo_HM_eXCJChe7Sz4DKlvv84lFE1AvCmlxoVGjqnJwSj6Tpbe5Pha3tpfKV_NijZr93ZuFoGb5F8A9_hkbGb4bUCOImldWLsFfTA1NXhk05cJsU5EAmuwBl9-NcEErnjj1GwHbHGAbofgSRRWvVQ0cWEPmM_CXVDRSKGEZAxHx9vRZ090ifzEcHvRFxuA',
      category: 'Hem & livsstil'
    },
    {
      id: 3,
      name: 'Munblåst Vas & Mässingsljusstake',
      description: 'Skandinavisk inredningsfavorit i rökfärgat glas med massiv mässingshållare och två handstöpta herrgårdsljus.',
      point_cost: 500,
      minimum_membership_plan_id: 2,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1VYKwiYSEJDViTck3MjDzWbTb8FacATmbjRHELlqKcY8ZkuGJaj2FDj-iZ6mqJ5scVj9l0sstMtgeQhbYZfLJgwZW0z2Q7OaC0NHaPsVh7VaGt8YrXHs-Du-H6r75p4g9lDX1rLxrvmaeyDTDy1HT0MlCxQtmrku_iSg5T_BsjOTdLRJI7BumrQn_ns5BWe-Bslmjv9ojh-vcWUwAUAsnESE5Tkr_3yFSMNzwWI0kVzPmIbh2UQe04wTS4',
      category: 'Hem & livsstil'
    },
    {
      id: 4,
      name: 'Presently Signature Exklusiv Gåvobox',
      description: 'Skräddarsydd gåva med personligt handgraverat monogram eller hälsning på svenskt läder och handgjord keramikkopp.',
      point_cost: 500,
      minimum_membership_plan_id: 3,
      thumbnail_img_url: 'https://lh3.googleusercontent.com/aida/AEtjO1U9x8OdFO7i3rIjIIQJOgl0Gnn13DtS_r3Cs4q2uotDy1RRs3fqMiRteMp--uDenFGMWX0WW7D_wC6EiFtMaFmNMKOuRs-wHXsRnelLU_jBBH5Zd50YXPCFz3OIyMa00QvOwd8a_PhTg8AFizoHVQoZMGcizS2IX42jjw9bVnnb3kfbXSKXTivONeOYJQQe5HWVoFIojmn1K8KzA8E0-G4XMDKLGGie6yrBmwGC8Evg8uqyorGOWKEA7b4',
      category: 'Personligt & Handgjort'
    },
  ]


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
                Presently {userDetails.membership_name}
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
      {/* filter goess here */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {productInfo.map((product) => (
         <GiftsCard userDetails={userDetails} product={product} />
        ))
        }

      </section>
    </main>
  )
}

export default Gifts
