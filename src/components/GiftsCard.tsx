import { confirmExistence } from '../utils/confirmType'
import type { CardDetails } from '../types/gifts'
import { Button } from '../components/Button'
import { ArrowRight, Lock, CircleCheck, Gift } from 'lucide-react'


const GiftsCard = ({ userMembershipId, userCurrentPoints, gift, memberships, category }: CardDetails) => {
    const pointsLeft = userCurrentPoints - gift.point_cost;
    const available = gift.minimum_membership_plan_level <= userMembershipId ? true : false;
    const productMembership = confirmExistence(memberships.find(item => item.level == gift.minimum_membership_plan_level));
    const userMembership = confirmExistence(memberships.find(item => item.level == userMembershipId));
   
    return (
        <article className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between" key={gift.id}>
            <div>
                <div className="relative aspect-[4/3] bg-[#f5f1eb] overflow-hidden flex">
                    <img
                        src={gift.thumbnail_image_url}
                        alt={gift.name}
                        className="w-50 h-50 object-center object-contain m-auto group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#193927]/80 text-white backdrop-blur-md">
                            Presently {productMembership.name}
                        </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-border">
                        <span className="text-base font-bold text-primary">{gift.point_cost}</span>
                        <span className="text-xs font-semibold text-accent ml-0.5">p</span>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{category.label}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-[#193927] group-hover:text-primary transition-colors line-clamp-1">
                        {gift.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {gift.description}
                    </p>
                    {available ?
                        <div className="mt-4 pt-3 border-t border-[#f0f5f2] flex items-center justify-between text-xs text-muted-foreground">
                            {pointsLeft >= 0 &&
                                <span className="flex items-center gap-1 text-muted-foreground">
                                   <Gift className='size-3'/>
                                    Presentinslagning ingår
                                </span>
                            }
                            {pointsLeft >= 0 ?
                                <span className="font-medium text-primary">Saldo efter beställning: {pointsLeft} p</span>
                                :
                                <div className="w-full">
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                                        <span>Poängstatus</span>
                                        <span className="font-medium text-primary">{userCurrentPoints} / {gift.point_cost} p ({Math.round((userCurrentPoints / gift.point_cost) * 100)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#e8efe9] h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full" ></div>
                                    </div>
                                    <p className="text-[11px] text-amber-800/90 mt-2 flex items-center gap-1">
                                        <CircleCheck className="size-3.5" />
                                        Ingår i ditt {userMembership.name}-medlemskap. Fylls på nästa månad.
                                    </p>
                                </div>
                            }

                        </div>
                        :
                        <div className="mt-4 p-3 bg-[#fbf8f2] border border-[#eedfc1] rounded-xl text-xs text-foreground">
                            <div className="flex items-start gap-2">
                                <Lock className="size-4"/>
                                <div className="leading-relaxed">
                                    <span className="font-semibold text-primary-active">Låst för Presently {userMembership.name}.</span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Denna gåva kräver {productMembership.name}-medlemskap.
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <div className="p-5 pt-0">
                {available ?
                    pointsLeft >= 0 ?
                        <Button className="w-full cursor-pointer" href={`/gifts/${gift.id}`} icon={<ArrowRight />} iconPosition='right'>
                            <span>Visa gåva</span>
                        </Button>
                        :
                        <Button className="w-full" variant="secondary" href={`/gifts/${gift.id}`}>
                            <span>Visa gåva</span>
                        </Button>
                    :
                    <Button href={`/gifts/${gift.id}`} variant="secondary" className="w-full cursor-pointer" icon={<ArrowRight />} iconPosition='right'>
                        <span>{productMembership ? 'Uppgradera till ' + productMembership.name : 'Uppgradera ditt medlemskap'}</span>
                    </Button>
                }
            </div>
        </article>
    )
}

export default GiftsCard
