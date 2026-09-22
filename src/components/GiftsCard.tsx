import { useState, useEffect } from 'react'
import { confirmExistence } from '../utils/confirmType'
import type { CardDetails} from '../types/gifts'

const GiftsCard = ({ userDetails, gift, memberships, category }: CardDetails) => {
    let pointsLeft = userDetails.current_points - gift.point_cost;
    let [available, setAvailable] = useState(false);
    let productMembership = confirmExistence(memberships.find(item => item.level == gift.minimum_membership_plan_id));
    let userMembership = confirmExistence(memberships.find(item => item.level == userDetails.membership_id));
    useEffect(() => {
        if (gift.minimum_membership_plan_id <= userDetails.membership_id) {
            setAvailable(true);
        }
    }, []);

    return (
        <article className="group bg-white rounded-2xl border border-[#e5ede8] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between" key={gift.id}>
            <div>
                {/* <!-- Product Image Container --> */}
                <div className="relative aspect-[4/3] bg-[#f5f1eb] overflow-hidden">
                    <img
                        src={gift.thumbnail_img_url}
                        alt={gift.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#193927]/80 text-white backdrop-blur-md">
                                Presently {productMembership.name}
                            </span>
                    </div>
                    {/* <!-- Price Tag Overlay --> */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-[#e5ede8]">
                        <span className="text-base font-bold text-[#193927]">{gift.point_cost}</span>
                        <span className="text-xs font-semibold text-[#bb9b56] ml-0.5">p</span>
                    </div>
                </div>

                {/* <!-- Product Details --> */}
                <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-[#708278] mb-1.5">
                        <span>{category.name}</span>
                    </div>
                    <h2 className="text-lg font-serif font-semibold text-[#193927] group-hover:text-[#244d36] transition-colors line-clamp-1">
                        {gift.name}
                    </h2>
                    <p className="text-xs text-[#52655c] mt-2 line-clamp-2 leading-relaxed">
                        {gift.description}
                    </p>
                    {available ?
                        <div className="mt-4 pt-3 border-t border-[#f0f5f2] flex items-center justify-between text-xs text-[#52655c]">
                            {pointsLeft >= 0 &&
                                <span className="flex items-center gap-1 text-[#3b5e4c]">
                                    <svg className="w-3.5 h-3.5 text-[#bb9b56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Presentinslagning ingår
                                </span>
                            }
                            {pointsLeft >= 0 ?
                                <span className="font-medium text-[#193927]">Saldo efter beställning: {pointsLeft} p</span>
                                :
                                <div className="w-full">
                                    <div className="flex items-center justify-between text-[11px] text-[#607469] mb-1.5">
                                        <span>Poängframsteg</span>
                                        <span className="font-medium text-[#193927]">{userDetails.current_points} / {gift.point_cost} p ({Math.round((userDetails.current_points / gift.point_cost) * 100)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#e8efe9] h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full" ></div>
                                    </div>
                                    <p className="text-[11px] text-amber-800/90 mt-2 flex items-center gap-1">
                                        <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Ingår i ditt {userMembership.name}-medlemskap. Fylls på nästa månad.
                                    </p>
                                </div>
                            }

                        </div>
                        :
                        <div className="mt-4 p-3 bg-[#fbf8f2] border border-[#eedfc1] rounded-xl text-xs text-[#5c4a22]">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-[#bb9b56] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <div className="leading-relaxed">
                                    <span className="font-semibold text-[#3b2e11]">Låst för Presently {userMembership.name}.</span>
                                    <p className="text-[11px] text-[#735e31] mt-0.5">
                                        Denna gåva kräver {productMembership.name}-medlemskap för personlig anpassning och gravyr.
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* <!-- Card Footer / Primary CTA --> */}
            <div className="p-5 pt-0">
                {available ?
                    pointsLeft >= 0 ?
                        <button className="w-full bg-[#244d36] hover:bg-[#193927] text-white py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
                            <span>Välj denna gåva</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        :
                        <button disabled className="w-full bg-[#f4f7f5] text-[#7d8f85] border border-[#d9e4dc] py-2.5 px-4 rounded-xl text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-[#8ea096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Otillräckligt saldo (Saknas {gift.point_cost - userDetails.current_points} p)</span>
                        </button>
                    :
                    <button className="w-full bg-[#244d36] hover:bg-[#193927] text-[#bb9b56] hover:text-[#d3b472] border border-[#bb9b56]/30 py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
                        <span>{productMembership ? 'Uppgradera till ' + productMembership.name : 'Uppgradera ditt medlemskap'}</span>
                        <svg className="w-4 h-4 text-[#bb9b56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                }
            </div>
        </article>
    )
}

export default GiftsCard
