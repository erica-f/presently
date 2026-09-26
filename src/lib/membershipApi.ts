export type MembershipPlan = { id: unknown; name: string; level: number; monthlyPrice: number; monthlyPoints: number; maxSavedContacts: number | null; benefits: string[] }
export type BillingOverview = { subscription: Record<string, unknown> | null; plan: MembershipPlan | null; pointBalance: number; nextAllocationDate: string | null; nextPaymentDate: string | null; nextPaymentAmount: number | null; payments: PaymentReceipt[] }
export type PaymentReceipt = { id: unknown; membership_plan_id?: string; receipt_number: string; payment_type: string; plan_name_snapshot: string; plan_level_snapshot: number; monthly_points_snapshot: number; amount: number; currency: string; status: string; created_at: string; paid_at?: string }
export type PaymentConfirmation = { payment: PaymentReceipt; plan: MembershipPlan | null; pointsCredited: number; pointBalance: number; nextBillingDate: string | null }

async function request<T>(path: string, options?: RequestInit) {
    const response = await fetch(`/api/membership${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) } })
    const payload = await response.json().catch(() => ({})) as T & { error?: string }
    if (!response.ok) throw new Error(payload.error ?? 'Något gick fel.')
    return payload
}

async function publicRequest<T>(path: string) {
    const response = await fetch(`/api/public${path}`)
    const payload = await response.json().catch(() => ({})) as T & { error?: string }
    if (!response.ok) throw new Error(payload.error ?? 'NÃ¥got gick fel.')
    return payload
}

export const membershipApi = {
    publicPlans: () => publicRequest<MembershipPlan[]>('/membership-plans'),
    checkout: (plan: number) => request<{ plan: MembershipPlan; billing: BillingOverview }>(`/checkout/${plan}`),
    complete: (plan: number, cardLast4: string) => request<{ success: boolean; paymentStatus: string; subscriptionId?: unknown; paymentId?: unknown }>(`/checkout/${plan}`, { method: 'POST', body: JSON.stringify({ cardLast4 }) }),
    confirmation: (paymentId: string) => request<PaymentConfirmation>(`/confirmation/${encodeURIComponent(paymentId)}`),
    overview: () => request<BillingOverview>('/overview'),
}
