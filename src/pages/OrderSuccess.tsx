
import { useLocation } from "react-router-dom"
import { Button } from "../components/Button"
import type { CartInfo } from '../types/cart'
const OrderSuccess = () => {
  const location = useLocation().state;
  if (location === null) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
    <div className="border border-danger/30 bg-surface p-6">
      <h1 className="text-2xl text-foreground">Kunde inte ladda din orderbekräftelse.</h1>
      <p className="mt-2 text-muted-foreground">Vänligen gå till din profil för att se status, eller hör av dig till vår kundtjänst om du behöver mer hjälp.</p>
      <Button className="mt-4" href="/profile">Till min profil</Button>
    </div>
  </main>

  const gifts:CartInfo[] = location.result.cart;
  const pointCostSum = location.result.pointCostSum;
  const delivery = location.result.delivery;
  const newOrderId = location.result.newOrderId;

  return (
    <main className="flex-1 bg-background px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl rounded-control border border-border bg-surface px-5 py-10 sm:px-12 sm:py-14 lg:px-20">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center bg-secondary text-primary">

          </div>
          <p className="mt-6 text-sm font-medium text-accent">Beställning genomförd</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Din gåva behandlas</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">Tack för din beställning! Vårt team kommer att packa din beställning inom kort. Du kommer få mer information så snart den är redo att levereras.</p>
        </div>
        <section className="mt-10 border border-border p-5 sm:p-7" aria-labelledby="receipt-title">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Ordernummer: {newOrderId}</p>
              <h2 className="mt-2 text-xl"> </h2>
            </div>

          </div>
          <div className="mt-6 grid gap-5 border-t border-border pt-6 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Gåvor: </p>
              {gifts.map(item => (
                <p className="mt-1 font-semibold text-foreground" key={item.id}>{item.name}</p>
              ))}
            </div>
            <div>
              <p className="text-muted-foreground">Leveras till:</p>
              <p className="mt-1 font-semibold text-foreground">{delivery.firstName} {delivery.lastName}</p>
              <p className="mt-1 font-semibold text-foreground">{delivery.address} {delivery.postalCode} {delivery.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Använda poäng</p>
              <p className="mt-1 font-semibold text-foreground">{pointCostSum} p</p>
            </div>
          </div>
        </section>
        <section className="mt-10 border-t border-border pt-9" aria-labelledby="next-title">
          <h2 id="next-title" className="text-xl text-center sm:text-left"></h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border border-border bg-surface-muted p-5">
              <h3 className="mt-4 text-lg">Utforska gåvor</h3><p className="mt-2 text-sm text-muted-foreground">Vill du skicka fler presenter? Utforska våra gåvor.</p>
              <Button className="mt-5" href="/gifts" iconPosition="right">Utforska gåvor</Button>
            </div>
            <div className="border border-border bg-surface-muted p-5">
              <h3 className="mt-4 text-lg">Hantera ditt konto</h3>
              <p className="mt-2 text-sm text-muted-foreground">Se medlemskap, kontakter och kvitton.</p>
              <Button className="mt-5" href="/profile" variant="secondary" iconPosition="right">Gå till Mitt Presently</Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrderSuccess
