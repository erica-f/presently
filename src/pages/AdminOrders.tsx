import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle, CheckCircle2, Eye, Filter, Gift, MapPin, Package, RefreshCw, Search, Truck, User, X } from 'lucide-react'
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminNav } from '../components/admin/AdminNav'
import { Button } from '../components/Button'
import { adminApi } from '../lib/adminApi'
import type { AdminOrder } from '../types/admin'
import { toAssetUrl } from '../utils/giftDetails'

function formatOrderNumber(order: { orderNumber?: string; id: number }): string {
    const num = order.orderNumber ? String(order.orderNumber).replace(/^#+/, '') : String(order.id).padStart(4, '0')
    return `#${num}`
}

function ProductThumbnail({
    src,
    alt = '',
    className = 'size-6 shrink-0 rounded object-cover',
    iconSize = 'size-3.5',
}: {
    src: string | null | undefined
    alt?: string
    className?: string
    iconSize?: string
}) {
    const [hasError, setHasError] = useState(false)
    const resolved = toAssetUrl(src)

    if (!resolved || hasError) {
        return (
            <div className={`flex shrink-0 items-center justify-center rounded bg-surface-muted/60 ${className}`}>
                <Package className={`${iconSize} shrink-0 text-muted-foreground/70`} aria-hidden="true" />
            </div>
        )
    }

    return (<img src={resolved} alt={alt} onError={() => setHasError(true)} className={`${className} bg-surface-muted/30`} loading="lazy" />)
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all')
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

    const breadcrumbs = useMemo(
        () => [
            { label: 'Hem', href: '/' },
            { label: 'Administration', href: '/admin' },
            { label: 'Gåvohistorik' },
        ],
        []
    )

    const loadOrders = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const list = await adminApi.getOrders()
            setOrders(list)
        } catch (err) {
            console.error('Failed to load orders:', err)
            setError(err instanceof Error ? err.message : 'Kunde inte läsa in gåvohistoriken.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        adminApi.getOrders().then((list) => {
            if (isMounted) {
                setOrders(list)
                setIsLoading(false)
            }
        }).catch((err) => {
            if (isMounted) {
                console.error('Failed to load orders:', err)
                setError(err instanceof Error ? err.message : 'Kunde inte läsa in gåvohistoriken.')
                setIsLoading(false)
            }
        })

        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => setToastMessage(null), 5000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    const handleToggleSent = async (order: AdminOrder) => {
        const nextIsSent = !order.isSent
        setUpdatingOrderId(order.id)
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, isSent: nextIsSent, status: nextIsSent ? 'completed' : 'pending', sentAt: nextIsSent ? new Date().toISOString() : null, formattedSentAt: nextIsSent ? 'Idag' : null } : o))

        if (selectedOrder && selectedOrder.id === order.id) {
            setSelectedOrder((prev) => prev ? { ...prev, isSent: nextIsSent, status: nextIsSent ? 'completed' : 'pending', sentAt: nextIsSent ? new Date().toISOString() : null, formattedSentAt: nextIsSent ? 'Idag' : null } : null)
        }

        try {
            const res = await adminApi.updateOrderDelivery(order.id, nextIsSent)
            if (res.order) {
                setOrders((prev) => prev.map((o) => (o.id === order.id ? ({ ...o, ...res.order } as AdminOrder) : o)))
                if (selectedOrder && selectedOrder.id === order.id) setSelectedOrder((prev) => (prev ? ({ ...prev, ...res.order } as AdminOrder) : null))
            }
            setToastMessage(nextIsSent ? `Order ${formatOrderNumber(order)} har markerats som skickad.` : `Order ${formatOrderNumber(order)} återställdes till ej skickad.`)
        } catch (err) {
            console.error('Failed to update delivery status:', err)
            setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)))
            if (selectedOrder && selectedOrder.id === order.id) setSelectedOrder(order)
            setToastMessage(err instanceof Error ? err.message : 'Kunde inte uppdatera leveransstatus.')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const filteredOrders = useMemo(() => {
        const rawTerm = searchTerm.toLowerCase().trim()
        const term = rawTerm.replace(/^#+/, '')
        return orders.filter((o) => {
            const formattedNum = formatOrderNumber(o).toLowerCase()
            const cleanNum = formattedNum.replace(/^#+/, '')
            const matchesSearch = !rawTerm || o.id.toString().includes(term) || cleanNum.includes(term) || formattedNum.includes(rawTerm) ||
                (o.buyerName && o.buyerName.toLowerCase().includes(rawTerm)) || (o.buyerEmail && o.buyerEmail.toLowerCase().includes(rawTerm)) ||
                (o.recipientName && o.recipientName.toLowerCase().includes(rawTerm)) || (o.recipientAddress?.city && o.recipientAddress.city.toLowerCase().includes(rawTerm)) ||
                o.items?.some((item) => item.productName.toLowerCase().includes(rawTerm))

            const matchesStatus = statusFilter === 'all' || (statusFilter === 'sent' && o.isSent) || (statusFilter === 'pending' && !o.isSent)

            return matchesSearch && matchesStatus
        })
    }, [orders, searchTerm, statusFilter])

    const metrics = useMemo(() => {
        const total = orders.length
        const pending = orders.filter((o) => !o.isSent).length
        const sent = orders.filter((o) => o.isSent).length
        const totalPoints = orders.reduce((sum, o) => sum + (o.totalPoints || 0), 0)
        return { total, pending, sent, totalPoints }
    }, [orders])

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <AdminBreadcrumbs items={breadcrumbs} />

            <div className="space-y-4">
                <AdminHeader title="Gåvohistorik" description="Översikt över beställda gåvoutskick, mottagare, personliga hälsningar och leveransstatus." />
                <AdminNav />
            </div>

            {toastMessage && (
                <div role="status" className="flex items-center justify-between rounded-card border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground shadow-card">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                        <span>{toastMessage}</span>
                    </div>
                    <button type="button" onClick={() => setToastMessage(null)} aria-label="Stäng meddelande" className="cursor-pointer text-muted-foreground hover:text-foreground">
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {error && (
                <div role="alert" className="flex flex-col gap-3 rounded-card border border-warning/30 bg-accent-muted p-5 text-warning sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="size-5 shrink-0 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button type="button" onClick={loadOrders} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-warning/40 bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-warning hover:text-warning">
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Försök igen
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Totalt beställningar</p>
                    <p className="mt-1.5 font-heading text-2xl font-bold text-foreground">{metrics.total} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Registrerade gåvoutskick</p>
                </div>

                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Bearbetas / Ej skickade</p>
                    <p className="mt-1.5 font-heading text-2xl font-bold text-amber-600 dark:text-amber-500">{metrics.pending} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Väntar på packning och utskick</p>
                </div>

                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Skickade gåvor</p>
                    <p className="mt-1.5 font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-500">{metrics.sent} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Markerade med leveransdatum</p>
                </div>

                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Förmedlade poäng</p>
                    <p className="mt-1.5 font-heading text-2xl font-bold text-foreground">{metrics.totalPoints.toLocaleString('sv-SE')} p</p>
                    <p className="mt-1 text-xs text-muted-foreground">Totalt värde i beställda gåvor</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input type="text" placeholder="Sök beställare, mottagare, stad eller produkt…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-control border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"/>
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')} aria-label="Rensa sökning" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'sent')} className="cursor-pointer rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none" aria-label="Filtrera efter leveransstatus">
                            <option value="all">Alla leveransstatusar</option>
                            <option value="pending">Bearbetas (ej skickade)</option>
                            <option value="sent">Skickade</option>
                        </select>
                    </div>

                    {(searchTerm || statusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('all')
                            }}
                            className="cursor-pointer text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        >
                            Återställ filter
                        </button>
                    )}
                </div>
            </div>

            <section aria-labelledby="orders-list-heading" className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 id="orders-list-heading" className="font-heading text-lg font-semibold text-foreground">Beställda gåvor</h2>
                    <span className="text-xs font-medium text-muted-foreground">{filteredOrders.length} av {orders.length} beställningar</span>
                </div>

                {isLoading && orders.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground" aria-busy="true">Laddar gåvohistorik…</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Gift className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
                        <p className="mt-3 text-sm font-medium text-foreground">Inga gåvobeställningar matchade filtreringen</p>
                        <p className="mt-1 text-xs">Prova att ändra sökord eller återställ filtren.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-surface-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Order & Datum</th>
                                        <th scope="col" className="px-6 py-3">Beställare</th>
                                        <th scope="col" className="px-6 py-3">Mottagare & Ort</th>
                                        <th scope="col" className="px-6 py-3">Gåvor</th>
                                        <th scope="col" className="px-6 py-3">Leveransstatus</th>
                                        <th scope="col" className="px-6 py-3 text-right">Åtgärd</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredOrders.map((order) => {
                                        const isUpdating = updatingOrderId === order.id

                                        return (
                                            <tr key={order.id} className="transition-colors hover:bg-surface-muted/20">
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-xs font-semibold text-foreground">{formatOrderNumber(order)}</div>
                                                    <div className="mt-0.5 text-xs text-muted-foreground">{order.formattedCreatedAt || order.createdAt?.slice(0, 10)}</div>
                                                    <div className="mt-1 text-xs font-medium text-muted-foreground">{order.totalPoints} p</div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{order.buyerName || 'Okänd beställare'}</div>
                                                    <div className="text-xs text-muted-foreground">{order.buyerEmail}</div>
                                                    {order.membershipLevel && (<div className="mt-0.5 text-xs text-muted-foreground">Nivå: {order.membershipLevel}</div>)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{order.recipientName}</div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="size-3 shrink-0" aria-hidden="true" />
                                                        <span>
                                                            {order.recipientAddress?.city}
                                                            {order.recipientAddress?.postalCode ? `, ${order.recipientAddress.postalCode}` : ''}
                                                        </span>
                                                    </div>
                                                    {order.paperType && (<div className="mt-1 text-xs text-muted-foreground">Papper: {order.paperType}</div>)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 max-w-xs">
                                                        {order.items?.length === 0 ? (
                                                            <span className="text-xs text-muted-foreground">Inga artiklar</span>
                                                        ) : (
                                                            order.items.slice(0, 2).map((item) => (
                                                                <div key={item.id} className="flex items-center gap-2">
                                                                    <ProductThumbnail src={item.thumbnailImageUrl} alt={item.productName} className="size-6 shrink-0 rounded object-cover" iconSize="size-3.5" />
                                                                    <span className="truncate text-xs text-foreground">
                                                                        {item.quantity > 1 ? `${item.quantity}x ` : ''}
                                                                        {item.productName}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        )}
                                                        {order.items && order.items.length > 2 && (<span className="text-xs text-muted-foreground">+{order.items.length - 2} artikel till</span>)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
                                                            <input type="checkbox" checked={order.isSent} disabled={isUpdating} onChange={() => handleToggleSent(order)}className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:opacity-50"/>
                                                            <span className={order.isSent ? 'font-semibold text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}>{order.isSent ? 'Skickad' : 'Bearbetas'}</span>
                                                        </label>

                                                        {order.isSent ? (<span className="text-xs text-muted-foreground">{order.formattedSentAt || 'Skickad'}</span>) : (<span className="text-xs text-muted-foreground">Ej skickad ännu</span>)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" onClick={() => setSelectedOrder(order)} icon={<Eye className="size-3.5" aria-hidden="true" />} className="px-2.5 py-1.5 text-xs">
                                                        Granska
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-border md:hidden">
                            {filteredOrders.map((order) => {
                                const isUpdating = updatingOrderId === order.id

                                return (
                                    <article key={order.id} className="flex flex-col gap-3 p-4">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                            <div>
                                                <span className="font-mono text-xs font-semibold text-foreground">
                                                    {formatOrderNumber(order)}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {order.formattedCreatedAt || order.createdAt?.slice(0, 10)}
                                                </span>
                                            </div>

                                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={order.isSent}
                                                    disabled={isUpdating}
                                                    onChange={() => handleToggleSent(order)}
                                                    className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                                                />
                                                <span className={order.isSent ? 'font-semibold text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}>
                                                    {order.isSent ? 'Skickad' : 'Bearbetas'}
                                                </span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block font-medium">Beställare</span>
                                                <span className="font-medium text-foreground truncate block">
                                                    {order.buyerName || 'Okänd'}
                                                </span>
                                                <span className="text-muted-foreground truncate block">
                                                    {order.buyerEmail}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block font-medium">Mottagare</span>
                                                <span className="font-medium text-foreground truncate block">
                                                    {order.recipientName}
                                                </span>
                                                <span className="text-muted-foreground truncate block">
                                                    {order.recipientAddress?.city}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-control bg-surface-muted/30 p-2.5 text-xs">
                                            <div className="flex items-center justify-between font-medium text-muted-foreground mb-1.5">
                                                <span>Gåvor ({order.items?.length || 0})</span>
                                                <span>{order.totalPoints} p</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-foreground">
                                                        <div className="flex items-center gap-2 truncate pr-2">
                                                            <ProductThumbnail src={item.thumbnailImageUrl} alt={item.productName} className="size-5 shrink-0 rounded object-cover" iconSize="size-3" />
                                                            <span className="truncate">
                                                                {item.quantity > 1 ? `${item.quantity}x ` : ''}
                                                                {item.productName}
                                                            </span>
                                                        </div>
                                                        <span className="text-muted-foreground shrink-0">{item.linePointTotal} p</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="text-xs text-muted-foreground">
                                                {order.isSent ? (<span>Skickad: {order.formattedSentAt || 'Ja'}</span>) : (<span>Status: Bearbetas för packning</span>)}
                                            </div>
                                            <Button variant="secondary" onClick={() => setSelectedOrder(order)} icon={<Eye className="size-3.5" aria-hidden="true" />} className="px-2.5 py-1.5 text-xs">
                                                Granska
                                            </Button>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </>
                )}
            </section>

            {selectedOrder && (
                <div role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-modal">
                        <div className="flex items-start justify-between border-b border-border pb-4">
                            <div>
                                <h3 id="order-details-title" className="font-heading text-lg font-semibold text-foreground">Gåvobeställning {formatOrderNumber(selectedOrder)}</h3>
                                <p className="mt-1 text-xs text-muted-foreground">Beställd {selectedOrder.formattedCreatedAt || selectedOrder.createdAt?.slice(0, 10)}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedOrder(null)} aria-label="Stäng detaljvy" className="cursor-pointer text-muted-foreground hover:text-foreground">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-6">
                            <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Leveransstatus</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Truck className="size-4 text-muted-foreground" aria-hidden="true" />
                                        <span className={`text-sm font-semibold ${selectedOrder.isSent ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                            {selectedOrder.isSent ? 'Skickad och avklarad' : 'Under bearbetning / Ej skickad'}
                                        </span>
                                    </div>
                                    {selectedOrder.isSent && selectedOrder.formattedSentAt && (<p className="mt-1 text-xs text-muted-foreground">Registrerad som skickad: {selectedOrder.formattedSentAt}</p>)}
                                </div>

                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground">
                                    <input type="checkbox" checked={selectedOrder.isSent} disabled={updatingOrderId === selectedOrder.id} onChange={() => handleToggleSent(selectedOrder)} className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:opacity-50"/>
                                    <span>{selectedOrder.isSent ? 'Markerad som skickad' : 'Markera som skickad'}</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-card border border-border bg-surface p-4">
                                    <div className="flex items-center gap-2 border-b border-border pb-2">
                                        <User className="size-4 text-muted-foreground" aria-hidden="true" />
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Beställare</h4>
                                    </div>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="font-semibold text-foreground">{selectedOrder.buyerName || 'Okänd beställare'}</p>
                                        <p className="text-xs text-muted-foreground">{selectedOrder.buyerEmail}</p>
                                        <p className="text-xs text-muted-foreground">Medlemsnivå: {selectedOrder.membershipLevel || 'Standard'}</p>
                                    </div>
                                </div>

                                <div className="rounded-card border border-border bg-surface p-4">
                                    <div className="flex items-center gap-2 border-b border-border pb-2">
                                        <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Leveransadress</h4>
                                    </div>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="font-semibold text-foreground">{selectedOrder.recipientName}</p>
                                        <p className="text-xs text-foreground">{selectedOrder.recipientAddress?.line1}</p>
                                        {selectedOrder.recipientAddress?.line2 && (<p className="text-xs text-foreground">{selectedOrder.recipientAddress.line2}</p>)}
                                        <p className="text-xs text-foreground">{selectedOrder.recipientAddress?.postalCode} {selectedOrder.recipientAddress?.city}</p>
                                        <p className="text-xs text-muted-foreground">Land: {selectedOrder.recipientAddress?.countryCode || 'SE'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-card border border-border bg-surface p-4">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground border-b border-border pb-2">Gåvokort & Inslagning</h4>
                                <div className="mt-3 space-y-3 text-sm">
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground block">Papperstyp:</span>
                                        <span className="text-foreground">{selectedOrder.paperType || 'Standard'}</span>
                                    </div>

                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground block">Hälsningsmeddelande:</span>
                                        {selectedOrder.message ? (
                                            <p className="mt-1 whitespace-pre-line rounded-control border border-border bg-background p-3 text-sm italic text-foreground">
                                                "{selectedOrder.message}"
                                            </p>
                                        ) : (
                                            <span className="text-xs italic text-muted-foreground">Inget personligt meddelande bifogat.</span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground block">Signatur:</span>
                                        <span className="text-foreground">{selectedOrder.signed || 'Ingen signatur angiven'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-card border border-border bg-surface p-4">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Beställda produkter ({selectedOrder.items?.length || 0})</h4>
                                    <span className="text-xs font-bold text-foreground">Totalt: {selectedOrder.totalPoints} poäng</span>
                                </div>

                                <div className="mt-3 divide-y divide-border">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                                            <div className="flex items-center gap-3">
                                                <ProductThumbnail src={item.thumbnailImageUrl} alt={item.productName} className="size-10 shrink-0 rounded object-cover" iconSize="size-5" />
                                                <div>
                                                    <p className="font-medium text-foreground">{item.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{item.quantity} st &times; {item.unitPointCost} p</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="font-semibold text-foreground">{item.linePointTotal} p</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-border pt-4">
                            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Stäng</Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
