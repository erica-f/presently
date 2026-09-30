import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle, CheckCircle2, Filter, Pencil, RefreshCw, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminNav } from '../components/admin/AdminNav'
import { Button } from '../components/Button'
import { profileApi } from '../lib/profileApi'
import { adminApi } from '../lib/adminApi'
import type { AdminUser, AdminUserUpdateInput } from '../types/admin'

export default function AdminUsers() {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
    const [editForm, setEditForm] = useState<AdminUserUpdateInput>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        isActive: true,
    })
    const [editError, setEditError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const breadcrumbs = useMemo(
        () => [
            { label: 'Hem', href: '/' },
            { label: 'Administration', href: '/admin' },
            { label: 'Medlemmar' },
        ],
        []
    )

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const list = await adminApi.getUsers()
            setUsers(list)
        } catch (err) {
            console.error('Failed to load users:', err)
            setError(err instanceof Error ? err.message : 'Kunde inte läsa in medlemslistan.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        adminApi.getUsers().then((list) => {
            if (isMounted) {
                setUsers(list)
                setIsLoading(false)
            }
        }).catch((err) => {
            if (isMounted) {
                console.error('Failed to load users:', err)
                setError(err instanceof Error ? err.message : 'Kunde inte läsa in medlemslistan.')
                setIsLoading(false)
            }
        })

        profileApi.get().then((res) => {
            if (isMounted && res?.user?.id !== null && res?.user?.id !== undefined) setCurrentUserId(Number(res.user.id))
        }).catch(() => undefined)

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => setToastMessage(null), 5000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = searchTerm === '' || u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesRole = roleFilter === 'all' || u.role === roleFilter
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && u.isActive) || (statusFilter === 'inactive' && !u.isActive)
            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, searchTerm, roleFilter, statusFilter])

    const metrics = useMemo(() => {
        const total = users.length
        const admins = users.filter((u) => u.role === 'admin').length
        const activeSubscribers = users.filter((u) => u.subscriptionStatus === 'active').length
        return { total, admins, activeSubscribers }
    }, [users])

    const startEdit = (user: AdminUser) => {
        setEditingUser(user)
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        })
        setEditError(null)
    }

    const cancelEdit = () => {
        setEditingUser(null)
        setEditError(null)
    }

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return

        if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
            setEditError('Förnamn och efternamn måste fyllas i.')
            return
        }

        if (!editForm.email.includes('@') || !editForm.email.includes('.')) {
            setEditError('Ange en giltig e-postadress.')
            return
        }

        setIsSaving(true)
        setEditError(null)

        try {
            const res = await adminApi.updateUser(editingUser.id, editForm)
            setToastMessage(res.message || 'Användaren uppdaterades.')
            setEditingUser(null)
            await loadUsers()
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Kunde inte spara ändringarna.')
        } finally {
            setIsSaving(false)
        }
    }

    const startDelete = (user: AdminUser) => {
        setDeletingUser(user)
        setDeleteError(null)
    }

    const cancelDelete = () => {
        setDeletingUser(null)
        setDeleteError(null)
    }

    const handleConfirmDelete = async () => {
        if (!deletingUser) return
        setIsDeleting(true)
        setDeleteError(null)

        try {
            const res = await adminApi.deleteUser(deletingUser.id)
            setToastMessage(res.message || 'Kontot raderades permanent.')
            setDeletingUser(null)
            await loadUsers()
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Kunde inte radera användaren.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:px-8">
            <AdminBreadcrumbs items={breadcrumbs} />
            <AdminHeader title="Medlemmar" description="Hantera registrerade medlemskonton, kontaktuppgifter, behörigheter och roller." />
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
                    <button type="button" onClick={loadUsers} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-warning/40 bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-warning hover:text-warning">
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Försök igen
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Totalt antal medlemmar</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.total} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Registrerade konton i databasen</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Administratörer</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.admins} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Konton med administratörsbehörighet</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                    <p className="text-xs font-medium text-muted-foreground">Aktiva medlemskap</p>
                    <p className="mt-1.5 text-2xl font-bold font-heading text-foreground">{metrics.activeSubscribers} st</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prenumererar på gåvopaket</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Sök namn eller e-postadress…"
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
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')} className="rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer" aria-label="Filtrera efter roll">
                            <option value="all">Alla roller</option>
                            <option value="user">Endast medlemmar</option>
                            <option value="admin">Endast administratörer</option>
                        </select>
                    </div>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')} className="rounded-control border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer" aria-label="Filtrera efter status">
                        <option value="all">Alla statusar</option>
                        <option value="active">Endast aktiva konton</option>
                        <option value="inactive">Endast inaktiva konton</option>
                    </select>

                    {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('')
                                setRoleFilter('all')
                                setStatusFilter('all')
                            }}
                            className="cursor-pointer text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        >
                            Återställ filter
                        </button>
                    )}
                </div>
            </div>

            <section aria-labelledby="members-list-heading" className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 id="members-list-heading" className="text-lg font-heading font-semibold text-foreground">
                        Registrerade medlemmar
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                        {filteredUsers.length} av {users.length} konton
                    </span>
                </div>

                {isLoading && users.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground" aria-busy="true">
                        Laddar medlemslista…
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
                        <p className="mt-3 text-sm font-medium text-foreground">Inga medlemmar matchade filtreringen</p>
                        <p className="mt-1 text-xs">Prova att ändra sökord eller återställ filtren.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-surface-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Medlem & E-post</th>
                                        <th scope="col" className="px-4 py-3">Roll</th>
                                        <th scope="col" className="px-4 py-3">Medlemskap</th>
                                        <th scope="col" className="px-4 py-3">Saldo</th>
                                        <th scope="col" className="px-4 py-3">Order</th>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3">Registrerad</th>
                                        <th scope="col" className="px-6 py-3 text-right">Åtgärder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map((u) => {
                                        const isCurrent = currentUserId === u.id
                                        return (
                                            <tr key={u.id} className="transition-colors hover:bg-surface-muted/30">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">
                                                        {u.firstName} {u.lastName}
                                                        {isCurrent && (<span className="ml-2 text-xs font-normal text-muted-foreground">(Du)</span>)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {u.role === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                                                            Administratör
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Medlem</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {u.planName ? (
                                                        <span className="text-xs font-medium text-foreground">
                                                            {u.planName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Inget</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-foreground">
                                                    {u.pointBalance} p
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {u.orderCount} st
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-medium ${u.isActive ? 'text-foreground' : 'text-danger'}`}>
                                                        {u.isActive ? 'Aktiv' : 'Inaktiv'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {u.formattedCreated}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(u)}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary active:bg-secondary/40"
                                                        >
                                                            <Pencil className="size-3 text-muted-foreground" aria-hidden="true" />
                                                            <span>Redigera</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isCurrent}
                                                            onClick={() => startDelete(u)}
                                                            title={isCurrent ? 'Du kan inte radera ditt eget konto' : 'Radera konto'}
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-border bg-surface px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-danger hover:text-danger active:bg-danger/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 className="size-3 text-muted-foreground" aria-hidden="true" />
                                                            <span>Radera</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-border md:hidden">
                            {filteredUsers.map((u) => {
                                const isCurrent = currentUserId === u.id
                                return (
                                    <div key={u.id} className="flex flex-col gap-3 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {u.firstName} {u.lastName}
                                                    {isCurrent && (<span className="ml-2 text-xs font-normal text-muted-foreground">(Du)</span>)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </div>

                                            <div className="text-right">
                                                {u.role === 'admin' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Medlem</span>
                                                )}
                                                <div className={`text-xs ${u.isActive ? 'text-foreground' : 'text-danger'}`}>
                                                    {u.isActive ? 'Aktiv' : 'Inaktiv'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span>Medlemskap: <strong className="text-foreground font-medium">{u.planName ?? 'Inget'}</strong></span>
                                            <span>-</span>
                                            <span>Saldo: <strong className="text-foreground font-medium">{u.pointBalance} p</strong></span>
                                            <span>-</span>
                                            <span>Order: <strong className="text-foreground font-medium">{u.orderCount} st</strong></span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                                            <span>Reg: {u.formattedCreated}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => startEdit(u)} className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary">
                                                    <Pencil className="size-3" aria-hidden="true" />
                                                    Redigera
                                                </button>
                                                <button type="button" disabled={isCurrent} onClick={() => startDelete(u)} className="inline-flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-danger hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed">
                                                    <Trash2 className="size-3" aria-hidden="true" />
                                                    Radera
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

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !isSaving) cancelEdit() }}>
                    <div role="dialog" aria-labelledby="edit-user-title" aria-modal="true" className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                            <div>
                                <h3 id="edit-user-title" className="text-xl font-heading font-semibold text-foreground">
                                    Redigera medlem
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Uppdatera användaruppgifter, roll eller kontostatus.
                                </p>
                            </div>
                            <button type="button" onClick={cancelEdit} disabled={isSaving} className="text-muted-foreground hover:text-foreground" aria-label="Stäng modal">
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="mt-5 flex flex-col gap-4">
                            {editError && (
                                <div role="alert" className="flex items-center gap-2 rounded-control border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{editError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Förnamn
                                    <input type="text" required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                </label>

                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Efternamn
                                    <input type="text" required value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                E-postadress
                                <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                            </label>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Användarroll
                                    <select value={editForm.role} disabled={currentUserId === editingUser.id} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60 cursor-pointer">
                                        <option value="user">Medlem</option>
                                        <option value="admin">Administratör</option>
                                    </select>
                                    {currentUserId === editingUser.id && (<span className="text-[11px] text-muted-foreground">Du kan inte ändra din egen administratörsroll.</span>)}
                                </label>

                                <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                                    Kontostatus
                                    <select value={editForm.isActive ? 'active' : 'inactive'} disabled={currentUserId === editingUser.id} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })} className="rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60 cursor-pointer">
                                        <option value="active">Aktivt konto</option>
                                        <option value="inactive">Inaktiverat konto</option>
                                    </select>
                                    {currentUserId === editingUser.id && (<span className="text-[11px] text-muted-foreground">Du kan inte inaktivera ditt eget konto.</span>)}
                                </label>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
                                <Button variant="ghost" type="button" disabled={isSaving} onClick={cancelEdit}>
                                    Avbryt
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSaving}>
                                    {isSaving ? 'Sparar…' : 'Spara ändringar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !isDeleting) cancelDelete() }}>
                    <div role="dialog" aria-labelledby="delete-user-title" aria-modal="true" className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="rounded-control bg-danger/10 p-2.5 text-danger shrink-0">
                                <Trash2 className="size-5" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 id="delete-user-title" className="text-lg font-heading font-semibold text-foreground">
                                    Radera användarkonto
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Är du säker på att du vill radera kontot för{' '}
                                    <strong className="text-foreground">{deletingUser.firstName} {deletingUser.lastName}</strong> ({deletingUser.email})?
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-control border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                            Detta raderar användarens konto, sparade kontakter, eventuella pågående kundvagnar och prenumerationer. Denna åtgärd kan inte ångras.
                        </div>

                        {deleteError && (<p className="mt-3 text-xs text-danger" role="alert">{deleteError}</p>)}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="ghost" type="button" disabled={isDeleting} onClick={cancelDelete}>
                                Avbryt
                            </Button>
                            <Button variant="secondary" type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="!border-danger/40 !text-danger hover:!bg-danger/10">
                                {isDeleting ? 'Raderar…' : 'Ja, radera konto'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}