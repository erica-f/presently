import { useState } from 'react'
import type { CartCardType } from '../../types/cart'
import { Button } from '../Button';
import { CartApiError, deleteItem, addToCart } from '../../lib/cartApi'
import useLoginStatus from "../../hooks/useLoginStatus";
import { Plus, Minus } from 'lucide-react'


const CartCard = ({ item, membership, refresh, pointsLeft }: CartCardType) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleUnauthorized = useLoginStatus();
    const [amount, setAmount] = useState(item.quantity);
    const [success, setSuccess] = useState(true);

    const updateAmount = async (change: string) => {
        setLoading(true);
        const newAmount = change == 'minus' ? amount - 1 : amount + 1;
        setAmount(newAmount);
        try {
            if (change == 'minus') {
                const result = await deleteItem(item.product_id, newAmount);
                setSuccess(result.success);
            } else {
                const result = await addToCart(item.product_id, 1);
                setSuccess(result.success);
            }
            refresh(previous => !previous)
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

    if (error) return
    <div className="flex flex-col sm:flex-row gap-4 items-start mb-5">
        <h3 className="text-lg text-[#1a3b2b]">Kunde inte hämta in produkten</h3>
        <p className="mt-2 text-muted-foreground">{error}</p>
    </div>


    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-5" key={item.id}>
            <img src={'/' + item.thumbnail_image_url} alt={item.name} className="w-24 h-24 rounded-xl object-cover border border-border shrink-0" />
            <div className="space-y-1.5 flex-1">
                <div className="items-center gap-2 grid grid-cols-2">
                    <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-muted text-accent">{membership.name}</span>
                        <span className="ml-1 text-xs font-bold ">{item.point_cost}</span>
                    </div>
                        <span className="justify-self-end flex items-center">
                            <Button variant="ghost" onClick={() => { updateAmount('minus') }} icon={<Minus />} disabled={loading} className="disabled:bg-transparent disabled:hover:bg-transparent"> </Button>
                            <span className="ml-2 mr-2">{amount}</span>
                            <Button variant="ghost" onClick={() => { updateAmount('plus') }} icon={<Plus />} disabled={(pointsLeft - item.point_cost >= 0 ? false : true) || loading} className="disabled:bg-transparent disabled:hover:bg-transparent"> </Button>
                        </span>
                    {!success && <span>Kunde inte uppdatera antal gåvor</span>}
                </div>
                <h3 className="text-lg text-primary">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                    {item.description}
                </p>
            </div>
        </div>
    )
}

export default CartCard
