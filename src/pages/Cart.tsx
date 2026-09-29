import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { getList, GiftsApiError } from '../lib/giftsApi'
import { type Overview, profileApi } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";
import type { CartInfo } from '../types/cart'
import type { Membership } from '../types/gifts'
import { Button } from '../components/Button';
import { ArrowRight, Gift, Info, ShieldCheck } from 'lucide-react'
import CartCard from '../components/cart/CartCard'


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
      totalPointCost += (item.point_cost * item.quantity);
    })
    setPointCostSum(totalPointCost);
  }

  const updateCart = (productId: number, amount: number) => {
    const updatedCart = cart.map(item =>
      productId === item.product_id
        ? { ...item, quantity: amount }
        : item
    )
    setCart(updatedCart);
    calculatePoints(updatedCart);
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
  if (cart.length <= 0 || memberships.length <= 0) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
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
                <Gift />
                Valda gåvor
              </h2>
            </div>
            {cart.map((item) => {
              const membership = memberships.find(
                membership => Number(membership.level) == Number(item.level)
              );
              if (!membership) return <div key={item.product_id}>Kunde inte hämta gåvan...</div>
              return (
                < CartCard item={item} membership={membership} refresh={setRefresh} updateCart={updateCart} pointsLeft={pointsLeft} key={item.product_id} />
              )
            })}
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">

          <div className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">

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
                  <span className="font-semibold text-[#9e3a2b] font-mono text-base">-{item.point_cost * item.quantity} p</span>
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
                <Info />
                <span>Detta är en poänginlösen. Inga betalkort eller extra avgifter debiteras. Gåvan graveras och paketeras omsorgsfullt så fort du bekräftar.</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/cart/delivery">
                <Button
                  className="w-full"
                  disabled={pointsLeft < 0 ? true : false}
                  icon={<ArrowRight />}
                  iconPosition='right'
                >
                  <span>Välj mottagare</span>
                </Button>
              </Link>

            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e6ded3] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1a3b2b]">
              <ShieldCheck />
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
