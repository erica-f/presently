import { useState, useEffect } from 'react'
import { useLocation, Navigate, Link, useNavigate } from "react-router-dom"
import { Check, Gift, MapPin, Mail, ArrowRight } from 'lucide-react'
import { getList, GiftsApiError } from '../lib/giftsApi'
import { type Overview, profileApi } from '../lib/profileApi'
import useLoginStatus from "../hooks/useLoginStatus";
import type { CartInfo } from '../types/cart'
import type { Membership } from '../types/gifts'
import Headline from '../components/cart/Headline';
import { Button } from '../components/Button';
import CartCard from '../components/cart/CartCard';
import SafetyInfo from '../components/cart/SafetyInfo';
import PointsDisplay from '../components/cart/PointsDisplay'
import { createOrder } from '../lib/orderApi'

const CheckoutGifts = () => {
  const location = useLocation().state;
  const navigate = useNavigate();
  const [delivery] = useState(location && location.deliverTo);
  const [message] = useState(location && location.message);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const handleUnauthorized = useLoginStatus();
  const [cart, setCart] = useState<CartInfo[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Overview>();
  const [pointCostSum, setPointCostSum] = useState(0);

  const [refresh, setRefresh] = useState(false);
  const paperColors = message.type == 'forest' ? 'bg-[#5f8971]/70' : message.type == 'warm' ? 'bg-[#e3d9c9]/80' : 'bg-[#fdf9f9]'

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

  const checkOut = async () => {
    try {
      const result = await createOrder(delivery, message, cart, pointCostSum);
      console.log(result);
      if (result.success) {
        navigate("/cart/checkout/success", { state: result })
      }
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

  const pointsLeft = (currentPoints?.pointBalance ?? 0) - pointCostSum;
  console.log(cart.length);
  if (location === null) return <Navigate to="/cart" />;

  if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <p className="text-muted-foreground" role="status">Laddar detaljer...</p>
  </main>
  if (cart.length <= 0) return <Navigate to="/cart" />;
  if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <div className="border border-danger/30 bg-surface p-6">
      <h1 className="text-2xl text-foreground">Kunde inte hämta detaljer</h1>
      <p className="mt-2 text-muted-foreground">{error}</p>
    </div>
  </main>

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <Headline headline={"Granska och bekräfta"} description={"Kontrollera att alla uppgifter stämmer innan vi skickar din gåva till ateljén för paketering."} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        <div className="lg:col-span-7 space-y-6">
          <section className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Gift className="size-4" />
                Gåva och utförande
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

          <section className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <MapPin className="size-4" />
                Mottagare & leveransadress
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mottagare</p>
                <p className="text-sm font-semibold text-foreground">{delivery.firstName} {delivery.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Leveransadress</p>
                <p className="text-sm font-medium text-foregroudn leading-snug">
                  {delivery.address} <br />
                  {delivery.postalCode} {delivery.city} <br />
                  Sverige
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f4efe6] flex items-center gap-2 text-xs text-secondary-foreground">
              <Check className="size-3.5" />
              <span>Skickas med spårbar PostNord-frakt direkt till mottagarens brevlåda.</span>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Mail className="size-4" />
                Tryckt hälsningskort i paketet
              </h2>
            </div>

            <div className={`p-5 rounded-xl border border-border relative ${paperColors}`}>
              <div className="text-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-accent">Design: {message.type}</span>
              </div>
              <p className="italic text-sm text-muted-foreground leading-relaxed text-center px-4">
                {message.message}
              </p>
              <div className="mt-3 text-right pr-4">
                <span className="text-xs text-primary font-semibold">— {message.signed}</span>
              </div>
            </div>
          </section>

        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-bordershadow-xs">
            <PointsDisplay cart={cart} currentPoints={currentPoints ? currentPoints.pointBalance : 0} pointsLeft={pointsLeft} />

            <div className="space-y-3">
              <Button
                className="w-full"
                icon={<ArrowRight />}
                iconPosition="right"
                onClick={() => checkOut()}
              >
                <span>Skicka gåvan</span>
              </Button>
              <Link to="/cart/delivery">
                <Button
                  variant='secondary'
                  className="w-full"
                >
                  Tillbaka och ändra
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

export default CheckoutGifts
