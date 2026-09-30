import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { getList, GiftsApiError } from '../lib/giftsApi'
import { type Overview, profileApi } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";
import type { CartInfo } from '../types/cart'
import type { Membership } from '../types/gifts'
import { Button } from '../components/Button';
import { ArrowRight, Gift } from 'lucide-react'
import CartCard from '../components/cart/CartCard'
import PointsDisplay from '../components/cart/PointsDisplay';
import Headline from '../components/cart/Headline';
import SafetyInfo from '../components/cart/SafetyInfo';

const Cart = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const handleUnauthorized = useLoginStatus();
  const [cart, setCart] = useState<CartInfo[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Overview>();
  const [pointCostSum, setPointCostSum] = useState(0);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, membershipList, points] = await Promise.all([getList("cart"), getList('memberships'), profileApi.overview()]);
        setCart(data.items);
        setMemberships(membershipList);
        setCurrentPoints(points);
        setPointCostSum(data.pointTotal);
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
    <main className="w-full flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <Headline headline={"Varukorg"} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">
          <section className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-2">
                <Gift className='size-4' />
                Valda gåvor
              </h2>
            </div>
            {cart.map((item) => {
              const membership = memberships.find(
                membership => Number(membership.level) == Number(item.level)
              );
              if (!membership) return <div key={item.product_id}>Kunde inte hämta gåvan...</div>
              return (
                <CartCard item={item} membership={membership} refresh={setRefresh} pointsLeft={pointsLeft} key={item.product_id} />
              )
            })}
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">

          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <PointsDisplay cart={cart} currentPoints={currentPoints ? currentPoints.pointBalance : 0} pointsLeft={pointsLeft} />

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
          <SafetyInfo />
        </div>
      </div>
    </main>
  )
}

export default Cart
