import { useEffect, useState } from 'react'
import { getList, GiftsApiError } from '../api/giftsApi'
import { type Overview, profileApi } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";
import { confirmExistence } from '../utils/confirmType';
import type { CartInfo } from '../types/cart'
import type { Membership } from '../types/gifts'
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react'
import CartCard from '../components/CartCard'


const Cart = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const handleUnauthorized = useLoginStatus();
  const [cart, setCart] = useState<CartInfo[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Overview>();
  const [pointCostSum, setPointCostSum] = useState(0);

  const calculatePoints = (data: CartInfo[]) => {
    let totalPointCost = 0;
    data.forEach((item) => {
      totalPointCost += item.point_cost;
    })
    setPointCostSum(totalPointCost);
  }

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, membershipList, points] = await Promise.all([getList("cart"), getList('memberships'), profileApi.overview()]);
        setCart(data);
        setMemberships(membershipList);
        setCurrentPoints(points);
        calculatePoints(data);
      } catch (err) {
        if (err instanceof GiftsApiError && err.status === 401) {
          handleUnauthorized();
          return
        }
        setError(err instanceof GiftsApiError ? err.message : 'Kunde inte ladda gåvor');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [handleUnauthorized, refresh])
  console.log(cart);
  const pointsLeft = (currentPoints?.pointBalance ?? 0) - pointCostSum;

  if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <p className="text-muted-foreground" role="status">Laddar varukorg…</p>
  </main>
  if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <div className="border border-danger/30 bg-surface p-6">
      <h1 className="text-2xl text-foreground">Kunde inte hämta in varukorg</h1>
      <p className="mt-2 text-muted-foreground">{error}</p>
    </div>
  </main>
  if (cart.length <= 0) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <div className="border border-danger/30 bg-surface p-6">
      <h1 className="text-2xl text-foreground">Varukorgen är tom!</h1>
    </div>
  </main>

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a3b2b] tracking-tight mb-2">
          Varukorg
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">

          <section className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0eae0]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#b89047]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.118-.99A1.002 1.002 0 009 6zm2-1a1 1 0 101.118-.99A1.002 1.002 0 0011 5v1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
                Valda gåvor
              </h2>
            </div>
            {cart.map((item) => (
              <CartCard item={item} membership={confirmExistence(memberships.find(membership => membership.level == item.level))} refresh={setRefresh} />
            ))}
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">

          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#244d36]/20 shadow-sm">

            <div className="flex items-center justify-between pb-4 border-b border-[#e6ded3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a3b2b]">Poängberäkning</span>
            </div>

            <div className="py-5 space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#68736c]">Saldo före sändning</span>
                <span className="font-semibold text-[#1a3b2b] font-mono text-base">{currentPoints?.pointBalance} p</span>
              </div>

              {cart.map((item) => (
                <div className="flex items-center justify-between text-sm" key={item.cartItemId}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#1a3b2b] font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#9e3a2b] font-mono text-base">-{item.point_cost} p</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e6ded3]"></div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="block text-sm font-bold text-[#1a3b2b]">Saldo efter sändning</span>
                  <span className="text-[11px] text-[#68736c]">Dina sparade poäng förfaller aldrig</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#244d36]">{pointsLeft} p</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f4efe6] border border-[#e6ded3] text-xs text-[#68736c] mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#b89047] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Detta är en poänginlösen. Inga betalkort eller extra avgifter debiteras. Gåvan graveras och paketeras omsorgsfullt så fort du bekräftar.</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                disabled={pointsLeft < 0 ? true : false}
                icon={<ArrowRight />}
                iconPosition='right'
              >
                <span>Välj mottagare</span>
              </Button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e6ded3] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1a3b2b]">
              <svg className="w-4 h-4 text-[#244d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Presently Trygghet & Diskretion</span>
            </div>
            <p className="text-xs text-[#68736c] leading-relaxed">
              Inga fakturor eller priser syns någonsin för mottagaren. Du får en bekräftelse och spårningslänk direkt när paketet lämnar Stockholmsateljén.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart
