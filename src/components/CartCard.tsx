import { useState } from 'react'
import type { CartCardType } from '../types/cart'
import { Button } from './Button';
import { CartApiError, deleteItem } from '../api/cartApi'
import useLoginStatus from "../hooks/useLoginStatus";
import { Plus, Minus } from 'lucide-react'


const CartCard = ({ item, membership, refresh }: CartCardType) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleUnauthorized = useLoginStatus();
    const [amount, setAmount] = useState(item.quantity);

    const updateAmount = async (changedAmount: number) => {
        setLoading(true);
        try {
            const result = await deleteItem(item.product_id, changedAmount);
            if(changedAmount <= 0) {
                refresh(previous => !previous)
            }
        } catch (err) {
            if (err instanceof CartApiError && err.status === 401) {
                handleUnauthorized();
                return
            }
            setError(err instanceof CartApiError ? err.message : 'Kunde inte ladda gåvor');
        } finally {
            setLoading(false);
        }
    }
    if (loading) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <p className="text-muted-foreground" role="status">Laddar uppdatering</p>
    </main>
    if (error) return <main className="mx-auto w-[calc(100%-2rem)] max-w-5xl flex-1 py-16 sm:w-[calc(100%-3rem)]">
        <div className="border border-danger/30 bg-surface p-6">
            <h1 className="text-2xl text-foreground">Kunde inte hämta in produkten</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
    </main>

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-5" key={item.cartItemId}>
            <img src={item.thumbnail_image_url} alt={item.name} className="w-24 h-24 rounded-xl object-cover border border-[#e6ded3] shrink-0" />
            <div className="space-y-1.5 flex-1">
                <div className="items-center gap-2 grid grid-cols-2">
                    <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f5eee1] text-[#b89047]">{membership.name}</span>
                        <span className="text-xs font-bold text-[#1a3b2b]">{item.point_cost}</span>
                    </div>
                    <span className="justify-self-end flex items-center"><Button variant="ghost" onClick={() => { setAmount(amount - 1), updateAmount(amount - 1) }} icon={<Minus />}> </Button><span>{amount}</span><Button variant="ghost" onClick={() => { setAmount(amount + 1), updateAmount(amount + 1) }} icon={<Plus />}> </Button></span>
                </div>
                <h3 className="text-lg font-serif text-[#1a3b2b]">{item.name}</h3>
                <p className="text-xs text-[#68736c]">
                    {item.description}
                </p>
            </div>
        </div>
    )
}

export default CartCard
