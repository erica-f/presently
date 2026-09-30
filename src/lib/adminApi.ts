import type { AdminCategory, AdminMembershipPlan, AdminOrder, AdminOverviewResponse, AdminProduct, AdminProductInput, AdminUser, AdminUserUpdateInput } from '../types/admin'

export const adminApi = {
    async getMembershipPlans(): Promise<AdminMembershipPlan[]> {
        const response = await fetch('/api/admin/membership-plans', { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { plans?: AdminMembershipPlan[]; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in medlemskapsplaner.')

        return payload.plans ?? []
    },

    async getOverview(): Promise<AdminOverviewResponse> {
        const response = await fetch('/api/admin/overview', { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as Partial<AdminOverviewResponse> & { error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in översiktsdata för administration.')

        return payload as AdminOverviewResponse
    },

    async getUsers(params?: { search?: string; role?: string; status?: string }): Promise<AdminUser[]> {
        const query = new URLSearchParams()
        if (params?.search) query.set('search', params.search)
        if (params?.role && params.role !== 'all') query.set('role', params.role)
        if (params?.status && params.status !== 'all') query.set('status', params.status)

        const qs = query.toString()
        const response = await fetch(`/api/admin/users${qs ? `?${qs}` : ''}`, { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { users?: AdminUser[]; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in medlemslistan.')

        return payload.users ?? []
    },

    async updateUser(id: number, data: AdminUserUpdateInput): Promise<{ message: string; user: Partial<AdminUser> }> {
        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        const payload = (await response.json().catch(() => ({}))) as { message?: string; user?: Partial<AdminUser>; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte uppdatera användaren.')

        return { message: payload.message ?? 'Användaren uppdaterades.', user: payload.user ?? {} }
    },

    async deleteUser(id: number): Promise<{ message: string }> {
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte radera användarkontot.')

        return { message: payload.message ?? 'Användarkontot raderades framgångsrikt.' }
    },

    async getCategories(): Promise<AdminCategory[]> {
        const response = await fetch('/api/admin/categories', { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { categories?: AdminCategory[]; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in kategorier.')

        return payload.categories ?? []
    },

    async getProducts(params?: { search?: string; categoryId?: number; status?: string; tier?: number }): Promise<AdminProduct[]> {
        const query = new URLSearchParams()
        if (params?.search) query.set('search', params.search)
        if (params?.categoryId) query.set('category_id', String(params.categoryId))
        if (params?.status && params.status !== 'all') query.set('status', params.status)
        if (params?.tier) query.set('tier', String(params.tier))

        const qs = query.toString()
        const response = await fetch(`/api/admin/products${qs ? `?${qs}` : ''}`, { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { products?: AdminProduct[]; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in produktlistan.')

        return payload.products ?? []
    },

    async createProduct(data: AdminProductInput): Promise<{ message: string; productId: number }> {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        const payload = (await response.json().catch(() => ({}))) as { message?: string; productId?: number; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte skapa produkten.')

        return { message: payload.message ?? 'Produkten skapades framgångsrikt.', productId: payload.productId ?? 0 }
    },

    async updateProduct(id: number, data: AdminProductInput): Promise<{ message: string; productId: number }> {
        const response = await fetch(`/api/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        const payload = (await response.json().catch(() => ({}))) as { message?: string; productId?: number; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte uppdatera produkten.')

        return { message: payload.message ?? 'Produkten uppdaterades framgångsrikt.', productId: payload.productId ?? id }
    },

    async deleteProduct(id: number): Promise<{ message: string; archived?: boolean; deleted?: boolean }> {
        const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as {
            message?: string
            archived?: boolean
            deleted?: boolean
            error?: string
        }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte radera produkten.')

        return { message: payload.message ?? 'Produkten togs bort framgångsrikt.', archived: payload.archived, deleted: payload.deleted }
    },

    async getOrders(params?: { search?: string; status?: string }): Promise<AdminOrder[]> {
        const query = new URLSearchParams()
        if (params?.search) query.set('search', params.search)
        if (params?.status && params.status !== 'all') query.set('status', params.status)

        const qs = query.toString()
        const response = await fetch(`/api/admin/orders${qs ? `?${qs}` : ''}`, { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as { orders?: AdminOrder[]; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in gåvohistoriken.')

        return payload.orders ?? []
    },

    async updateOrderDelivery(orderId: number, isSent: boolean): Promise<{ message: string; order: Partial<AdminOrder> }> {
        const response = await fetch(`/api/admin/orders/${orderId}/delivery`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isSent }),
        })
        const payload = (await response.json().catch(() => ({}))) as { message?: string; order?: Partial<AdminOrder>; error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte uppdatera leveransstatus.')

        return { message: payload.message ?? 'Leveransstatus uppdaterades.', order: payload.order ?? {} }
    }
}