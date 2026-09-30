import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Filter, ImageIcon, Pencil, Plus, RefreshCw, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminNav } from '../components/admin/AdminNav'
import { Button } from '../components/Button'
import { adminApi } from '../lib/adminApi'
import type { AdminCategory, AdminMembershipPlan, AdminProduct, AdminProductInput } from '../types/admin'

const emptyProductForm: AdminProductInput = {
    name: '',
    description: '',
    thumbnailImageUrl: '',
    categoryId: 1,
    pointCost: 100,
    minimumMembershipPlanLevel: 1,
    isActive: true,
}

export default function AdminProducts() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState<AdminProduct[]>([])
    const [categories, setCategories] = useState<AdminCategory[]>([])
    const [membershipPlans, setMembershipPlans] = useState<AdminMembershipPlan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all')
    const [selectedTier, setSelectedTier] = useState<number | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<number | null>(null)
    const [productForm, setProductForm] = useState<AdminProductInput>(emptyProductForm)
    const [formError, setFormError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const breadcrumbs = useMemo(
        () => [
            { label: 'Hem', href: '/' },
            { label: 'Administration', href: '/admin' },
            { label: 'Produkter' },
        ],
        []
    )

    const plansByLevel = useMemo(() => {
        const map = new Map<number, AdminMembershipPlan>()
        for (const plan of membershipPlans) {
            map.set(plan.level, plan)
        }
        return map
    }, [membershipPlans])

    const getPlanName = useCallback(
        (level: number, fallback?: string) => {
            return plansByLevel.get(level)?.name ?? fallback ?? `Nivå ${level}`
        },
        [plansByLevel]
    )

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [prods, cats, plans] = await Promise.all([
                adminApi.getProducts(),
                adminApi.getCategories(),
                adminApi.getMembershipPlans(),
            ])
            setProducts(prods)
            setCategories(cats)
            setMembershipPlans(plans)
            if (cats.length > 0 && emptyProductForm.categoryId === 1) emptyProductForm.categoryId = cats[0].id
            if (plans.length > 0 && emptyProductForm.minimumMembershipPlanLevel === 1) {
                emptyProductForm.minimumMembershipPlanLevel = plans[0].level
                emptyProductForm.pointCost = plans[0].monthlyPoints
            }
        } catch (err) {
            console.error('Failed to load products/categories/plans:', err)
            setError(err instanceof Error ? err.message : 'Kunde inte läsa in produktdata.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        Promise.all([adminApi.getProducts(), adminApi.getCategories(), adminApi.getMembershipPlans()])
            .then(([prods, cats, plans]) => {
                if (isMounted) {
                    setProducts(prods)
                    setCategories(cats)
                    setMembershipPlans(plans)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load products/categories/plans:', err)
                    setError(err instanceof Error ? err.message : 'Kunde inte läsa in produktdata.')
                    setIsLoading(false)
                }
            })

        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        const createParam = searchParams.get('create')
        const editParam = searchParams.get('edit')
        if (!createParam && !editParam) return

        const timer = setTimeout(() => {
            if (createParam === 'true') {
                setEditingProductId(null)
                setProductForm({ ...emptyProductForm, categoryId: categories.length > 0 ? categories[0].id : 1 })
                setFormError(null)
                setIsFormOpen(true)
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('create')
                    return next
                }, { replace: true })
            } else if (editParam && products.length > 0) {
                const editId = Number(editParam)
                const found = products.find((p) => p.id === editId)
                if (found) {
                    setEditingProductId(found.id)
                    setProductForm({
                        name: found.name,
                        description: found.description ?? '',
                        thumbnailImageUrl: found.thumbnailImageUrl ?? '',
                        categoryId: found.categoryId,
                        pointCost: found.pointCost,
                        minimumMembershipPlanLevel: found.minimumMembershipPlanLevel,
                        isActive: found.isActive,
                    })
                    setFormError(null)
                    setIsFormOpen(true)
                }
                setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('edit')
                    return next
                }, { replace: true })
            }
        }, 0)

        return () => clearTimeout(timer)
    }, [searchParams, setSearchParams, products, categories])

    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => setToastMessage(null), 5000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
            const matchesTier = selectedTier === 'all' || p.minimumMembershipPlanLevel === selectedTier
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && p.isActive) || (statusFilter === 'inactive' && !p.isActive)
            return matchesSearch && matchesCategory && matchesTier && matchesStatus
        })
    }, [products, searchTerm, selectedCategory, selectedTier, statusFilter])

    const metrics = useMemo(() => {
        const total = products.length
        const active = products.filter((p) => p.isActive).length
        const totalOrders = products.reduce((sum, p) => sum + p.orderCount, 0)
        return { total, active, categoriesCount: categories.length, totalOrders }
    }, [products, categories])

    const openCreateModal = () => {
        setEditingProductId(null)
        setProductForm({ ...emptyProductForm, categoryId: categories.length > 0 ? categories[0].id : 1 })
        setFormError(null)
        setIsFormOpen(true)
    }

    const openEditModal = (product: AdminProduct) => {
        setEditingProductId(product.id)
        setProductForm({
            name: product.name,
            description: product.description ?? '',
            thumbnailImageUrl: product.thumbnailImageUrl ?? '',
            categoryId: product.categoryId,
            pointCost: product.pointCost,
            minimumMembershipPlanLevel: product.minimumMembershipPlanLevel,
            isActive: product.isActive,
        })
        setFormError(null)
        setIsFormOpen(true)
    }

    const closeFormModal = () => {
        if (isSaving) return
        setIsFormOpen(false)
        setEditingProductId(null)
        setFormError(null)
    }

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!productForm.name.trim() || productForm.name.trim().length < 2) {
            setFormError('Produktnamn måste vara minst 2 tecken.')
            return
        }

        if (productForm.pointCost < 0) {
            setFormError('Poängpris kan inte vara negativt.')
            return
        }

        setIsSaving(true)
        setFormError(null)

        try {
            if (editingProductId) {
                const res = await adminApi.updateProduct(editingProductId, productForm)
                setToastMessage(res.message || 'Produkten uppdaterades framgångsrikt.')
            } else {
                const res = await adminApi.createProduct(productForm)
                setToastMessage(res.message || 'Produkten har lagts till i sortimentet.')
            }
            closeFormModal()
            await loadData()
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Kunde inte spara produkten.')
        } finally {
            setIsSaving(false)
        }
    }

    const startDelete = (product: AdminProduct) => {
        setDeletingProduct(product)
        setDeleteError(null)
    }

    const cancelDelete = () => {
        if (isDeleting) return
        setDeletingProduct(null)
        setDeleteError(null)
    }

    const handleConfirmDelete = async () => {
        if (!deletingProduct) return
        setIsDeleting(true)
        setDeleteError(null)

        try {
            const res = await adminApi.deleteProduct(deletingProduct.id)
            setToastMessage(res.message || 'Produkten togs bort.')
            setDeletingProduct(null)
            await loadData()
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Kunde inte ta bort produkten.')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async (product: AdminProduct) => {
        try {
            await adminApi.updateProduct(product.id, {
                name: product.name,
                description: product.description ?? '',
                thumbnailImageUrl: product.thumbnailImageUrl ?? '',
                categoryId: product.categoryId,
                pointCost: product.pointCost,
                minimumMembershipPlanLevel: product.minimumMembershipPlanLevel,
                isActive: !product.isActive,
            })
            setToastMessage(product.isActive ? `"${product.name}" har inaktiverats i butiken.` : `"${product.name}" är nu aktiv i butiken.`)
            await loadData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunde inte ändra produktstatus.')
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:px-8">
            <AdminBreadcrumbs items={breadcrumbs} />

            <AdminHeader
                title="Produkter"
                description="Hantera gåvosortimentet, skapa nya artiklar, uppdatera priser, kategorier och medlemsnivåer."
                action={
                    <Button variant="primary" icon={<Plus className="size-4" />} onClick={openCreateModal}>
                        Lägg till produkt
                    </Button>
                }
            />

            <AdminNav />

            {toastMessage && (
                <div role="status" className="flex items-center justify-between gap-3 rounded-card border border-success/30 bg-surface p-4 text-sm font-medium text-foreground shadow-sm">
                    <div className="flex items-center gap-2.5 text-success">
                        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                        <span>{toastMessage}</span>
                    </div>
                    <button type="button" onClick={() => setToastMessage(null)} className="text-muted-foreground hover:text-foreground" aria-label="Stäng meddelande">
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
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-warning/40 bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-warning hover:text-warning"
                    >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Försök igen
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Totalt sortiment</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.total} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Alla registrerade produkter</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Aktiva i butik</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.active} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Synliga för medlemmar</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Kategorier</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.categoriesCount} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Aktiva produktkategorier</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Genomförda gåvor</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.totalOrders} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Totalt antal beställningar</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Sök produktnamn eller beskrivning…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-control border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')} aria-label="Rensa sökning" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer" aria-label="Filtrera efter kategori">
                            <option value="all">Alla kategorier</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        aria-label="Filtrera efter medlemsnivå"
                    >
                        <option value="all">Alla medlemsnivåer</option>
                        {membershipPlans.map((plan) => (
                            <option key={plan.id} value={plan.level}>
                                {plan.name} (Nivå {plan.level})
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className="rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        aria-label="Filtrera efter status"
                    >
                        <option value="all">Alla statusar</option>
                        <option value="active">Endast aktiva i butik</option>
                        <option value="inactive">Endast inaktiva/utkast</option>
                    </select>

                    {(searchTerm || selectedCategory !== 'all' || selectedTier !== 'all' || statusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedCategory('all')
                                setSelectedTier('all')
                                setStatusFilter('all')
                            }}
                            className="cursor-pointer text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        >
                            Återställ filter
                        </button>
                    )}
                </div>
            </div>

            <section aria-labelledby="products-list-heading" className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 id="products-list-heading" className="text-lg font-heading font-semibold text-foreground">
                        Sortiment & produkter
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                        {filteredProducts.length} av {products.length} artiklar
                    </span>
                </div>

                {isLoading && products.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground" aria-busy="true">
                        Laddar produktkatalog…
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <ShoppingBag className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
                        <p className="mt-3 text-sm font-medium text-foreground">Inga produkter matchade filtreringen</p>
                        <p className="mt-1 text-xs">Prova att ändra sökord eller nollställ filtren.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-surface-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Produkt</th>
                                        <th scope="col" className="px-4 py-3">Kategori</th>
                                        <th scope="col" className="px-4 py-3">Nivå</th>
                                        <th scope="col" className="px-4 py-3">Pris</th>
                                        <th scope="col" className="px-4 py-3">Order</th>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3">Ändrad</th>
                                        <th scope="col" className="px-6 py-3 text-right">Åtgärder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredProducts.map((p) => {
                                        return (
                                            <tr key={p.id} className="transition-colors hover:bg-surface-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-11 shrink-0 rounded-control border border-border bg-surface-muted/40 overflow-hidden flex items-center justify-center">
                                                            {p.thumbnailImageUrl ? (
                                                                <img
                                                                    src={p.thumbnailImageUrl.startsWith('http') || p.thumbnailImageUrl.startsWith('/') ? p.thumbnailImageUrl : `/${p.thumbnailImageUrl}`}
                                                                    alt={p.name}
                                                                    className="size-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none'
                                                                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                                                                    }}
                                                                />
                                                            ) : (
                                                                <ImageIcon className="size-5 text-muted-foreground/40" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-foreground truncate max-w-xs" title={p.name}>
                                                                {p.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Art.nr: {String(p.id).padStart(4, '0')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {p.categoryLabel}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {p.membershipPlanName ?? getPlanName(p.minimumMembershipPlanLevel)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-foreground">
                                                    {p.pointCost} p
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {p.orderCount} st
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(p)}
                                                        title="Klicka för att växla butiksstatus"
                                                        className={`cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${p.isActive ? 'text-foreground hover:text-danger' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <span className={`size-2 rounded-full ${p.isActive ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                                                        {p.isActive ? 'Aktiv' : 'Inaktiv'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {p.formattedUpdated}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(p)}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary active:bg-secondary/40"
                                                        >
                                                            <Pencil className="size-3 text-muted-foreground" aria-hidden="true" />
                                                            <span>Redigera</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => startDelete(p)}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-danger hover:text-danger active:bg-danger/10"
                                                        >
                                                            <Trash2 className="size-3 text-muted-foreground" aria-hidden="true" />
                                                            <span>Ta bort</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-border lg:hidden">
                            {filteredProducts.map((p) => {
                                return (
                                    <div key={p.id} className="flex flex-col gap-3 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="size-14 shrink-0 rounded-control border border-border bg-surface-muted/40 overflow-hidden flex items-center justify-center">
                                                {p.thumbnailImageUrl ? (
                                                    <img
                                                        src={p.thumbnailImageUrl.startsWith('http') || p.thumbnailImageUrl.startsWith('/') ? p.thumbnailImageUrl : `/${p.thumbnailImageUrl}`}
                                                        alt={p.name}
                                                        className="size-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                                                        }}
                                                    />
                                                ) : (
                                                    <ImageIcon className="size-6 text-muted-foreground/40" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="font-semibold text-foreground text-sm">
                                                        {p.name}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(p)}
                                                        className={`shrink-0 cursor-pointer text-xs font-medium ${p.isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                                                    >
                                                        {p.isActive ? 'Aktiv' : 'Inaktiv'}
                                                    </button>
                                                </div>
                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                    Art.nr: {String(p.id).padStart(4, '0')} - {p.categoryLabel}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="font-semibold text-foreground">{p.pointCost} p</span>
                                                    <span className="text-muted-foreground">-</span>
                                                    <span className="text-muted-foreground">{p.membershipPlanName ?? getPlanName(p.minimumMembershipPlanLevel)}</span>
                                                    <span className="text-muted-foreground">-</span>
                                                    <span className="text-muted-foreground">{p.orderCount} order</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                                            <span>Ändrad: {p.formattedUpdated}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => openEditModal(p)} className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary">
                                                    <Pencil className="size-3" aria-hidden="true" />
                                                    Redigera
                                                </button>
                                                <button type="button" onClick={() => startDelete(p)} className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-danger hover:text-danger">
                                                    <Trash2 className="size-3" aria-hidden="true" />
                                                    Ta bort
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </section>

            {isFormOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 overflow-y-auto"
                    role="presentation"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !isSaving) closeFormModal()
                    }}
                >
                    <div role="dialog" aria-labelledby="product-form-title" aria-modal="true" className="my-8 w-full max-w-xl rounded-card border border-border bg-surface p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                            <div>
                                <h3 id="product-form-title" className="text-xl font-heading font-semibold text-foreground">
                                    {editingProductId ? 'Redigera produkt' : 'Skapa ny produkt'}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {editingProductId ? 'Uppdatera produktens information, pris och tillgänglighet i sortimentet.' : 'Fyll i uppgifterna nedan för att lägga till en ny artikel i butiken.'}
                                </p>
                            </div>
                            <button type="button" onClick={closeFormModal} disabled={isSaving} className="text-muted-foreground hover:text-foreground" aria-label="Stäng dialog">
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="mt-5 flex flex-col gap-4">
                            {formError && (
                                <div role="alert" className="flex items-center gap-2 rounded-control border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                Produktnamn
                                <input
                                    type="text"
                                    required
                                    placeholder="t.ex. Handgjord Keramikvas"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                Beskrivning
                                <textarea
                                    rows={3}
                                    placeholder="Beskrivande text för produkten som visas för medlemmar…"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                />
                            </label>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Kategori
                                    <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: Number(e.target.value) })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Lägsta medlemsnivå
                                    <select
                                        value={productForm.minimumMembershipPlanLevel}
                                        onChange={(e) => {
                                            const newLevel = Number(e.target.value)
                                            const plan = plansByLevel.get(newLevel)
                                            const suggestedPoints = plan?.monthlyPoints ?? (newLevel * 100)
                                            setProductForm({ ...productForm, minimumMembershipPlanLevel: newLevel, pointCost: suggestedPoints })
                                        }}
                                        className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    >
                                        {membershipPlans.map((plan) => (
                                            <option key={plan.id} value={plan.level}>
                                                {plan.name} (Nivå {plan.level})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Poängpris
                                    <input
                                        type="number"
                                        min={0}
                                        step={10}
                                        value={productForm.pointCost}
                                        onChange={(e) => setProductForm({ ...productForm, pointCost: Math.max(0, Number(e.target.value)) })}
                                        className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        required
                                    />
                                    {membershipPlans.length > 0 && (
                                        <span className="text-[11px] text-muted-foreground">
                                            Nivåvärden: {membershipPlans.map((pl) => `${pl.name} (${pl.monthlyPoints} p)`).join(', ')}
                                        </span>
                                    )}
                                </label>

                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Butiksstatus
                                    <select value={productForm.isActive ? 'active' : 'inactive'} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.value === 'active' })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                        <option value="active">Aktiv i butiken</option>
                                        <option value="inactive">Inaktiv / Utkast</option>
                                    </select>
                                </label>
                            </div>

                            <div className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                <span>Bild-URL (Thumbnail)</span>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        placeholder="images/product_xxx_thumb.webp eller https://…"
                                        value={productForm.thumbnailImageUrl}
                                        onChange={(e) => setProductForm({ ...productForm, thumbnailImageUrl: e.target.value })}
                                        className="flex-1 rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    />
                                    <div className="size-10 shrink-0 rounded-control border border-border bg-surface-muted/40 overflow-hidden flex items-center justify-center">
                                        {productForm.thumbnailImageUrl ? (
                                            <img
                                                src={productForm.thumbnailImageUrl.startsWith('http') || productForm.thumbnailImageUrl.startsWith('/') ? productForm.thumbnailImageUrl : `/${productForm.thumbnailImageUrl}`}
                                                alt="Förhandsgranskning"
                                                className="size-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        ) : (
                                            <ImageIcon className="size-4 text-muted-foreground/40" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                    Ange lokal sökväg (t.ex. images/product_001_thumb.webp).
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
                                <Button variant="ghost" type="button" disabled={isSaving} onClick={closeFormModal}>
                                    Avbryt
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSaving}>
                                    {isSaving ? 'Sparar…' : editingProductId ? 'Uppdatera produkt' : 'Skapa produkt'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !isDeleting) cancelDelete() }}>
                    <div role="dialog" aria-labelledby="delete-product-title" aria-modal="true" className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="rounded-control bg-danger/10 p-2.5 text-danger shrink-0">
                                <Trash2 className="size-5" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 id="delete-product-title" className="text-lg font-heading font-semibold text-foreground">
                                    Ta bort produkt
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Är du säker på att du vill ta bort <strong className="text-foreground">{deletingProduct.name}</strong>?
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-control border border-border bg-surface-muted/30 p-3 text-xs text-muted-foreground">
                            {deletingProduct.orderCount > 0 ? 'Eftersom produkten har tidigare beställningar kommer den att inaktiveras i butiken så att orderhistoriken förblir intakt.' : 'Produkten har inga tidigare beställningar och kommer därför att raderas permanent från databasen.'}
                        </div>

                        {deleteError && (
                            <p className="mt-3 text-xs text-danger" role="alert">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="ghost" type="button" disabled={isDeleting} onClick={cancelDelete}>
                                Avbryt
                            </Button>
                            <Button variant="secondary" type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="!border-danger/40 !text-danger hover:!bg-danger/10">
                                {isDeleting ? 'Tar bort…' : 'Ja, ta bort'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}