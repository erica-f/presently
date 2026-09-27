export type MembershipPlan = {
    id: unknown
    name: string
    level: unknown
    monthlyPoints: number
    maxSavedContacts: number | null
    monthlyPrice: number | null
    currency: string | null
}

export type MembershipState = {
    status: string | null
    periodStart: unknown
    periodEnd: unknown
    nextPaymentDate: unknown
    nextPaymentAmount: number | null
    currency: string | null
    cancelAtPeriodEnd: boolean
    cancellationEffectiveDate: unknown
    operations: { checkout: boolean; cancel: boolean; resume: boolean }
}

export type Profile = {
    user: { id: string | number | null; firstName: string; lastName: string; email: string }
    subscription: Record<string, unknown> | null
    plan: MembershipPlan | null
    membership: MembershipState
    availablePlans: MembershipPlan[]
    pointBalance: number
}

export type Contact = { id: unknown; firstName: string; lastName: string; email: string; phone: string; address: string; postalCode: string; city: string }
export type Gift = { id: unknown; date: unknown; recipient: string; status: string; items: { name: string; quantity: number; points: number }[] }
export type Payment = { id: unknown; date: unknown; amount: unknown; currency: string; status: string; planName: string; receiptNumber?: string | null }
export type Overview = { giftsSent: number; pointsSpent: number; pointBalance: number }
export type ContactForm = Omit<Contact, 'id'>

export function normalizePhone(value: string) {
    return value.trim().replace(/[\s().-]/g, '')
}

export function validateContactForm(input: Partial<ContactForm>, requireName = true) {
    const errors: Record<string, string> = {}
    const firstName = input.firstName?.trim() ?? ''
    const lastName = input.lastName?.trim() ?? ''
    const email = input.email?.trim() ?? ''
    const phone = normalizePhone(input.phone ?? '')
    if (requireName && !firstName) errors.firstName = 'Förnamn krävs.'
    if (firstName.length > 80) errors.firstName = 'Förnamn får vara högst 80 tecken.'
    if (requireName && !lastName) errors.lastName = 'Efternamn krävs.'
    if (lastName.length > 80) errors.lastName = 'Efternamn får vara högst 80 tecken.'
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160)) errors.email = 'Ange en giltig e-postadress.'
    if (phone && !/^\+46\d{7,10}$/.test(phone) && !/^0\d{8,10}$/.test(phone)) errors.phone = 'Ange ett svenskt telefonnummer som börjar med +46 eller 0.'
    for (const [field, value] of Object.entries(input)) {
        if (typeof value === 'string' && value.length > 160 && !errors[field]) errors[field] = 'Fältet får vara högst 160 tecken.'
    }
    return errors
}

export class ProfileApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ProfileApiError'
        this.status = status
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api/profile${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) } })
    const payload = await response.json().catch(() => ({})) as T & { error?: string; message?: string }
    if (!response.ok) throw new ProfileApiError(response.status === 401 ? 'Du behöver logga in för att se din profil.' : payload.error ?? payload.message ?? 'Något gick fel.', response.status)
    return payload
}

export const profileApi = {
    get: () => request<Profile>(''),
    overview: () => request<Overview>('/overview'),
    gifts: () => request<Gift[]>('/gifts'),
    contacts: () => request<Contact[]>('/contacts'),
    payments: () => request<Payment[]>('/payments'),
    startCheckout: (planId: unknown) => request<{ status: string; message: string }>('/membership/checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
    cancelMembership: (confirmed: boolean) => request<{ status: string; message: string }>('/membership/cancel', { method: 'POST', body: JSON.stringify({ confirmed }) }),
    changePassword: (input: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<{ success: boolean }>('/password', { method: 'POST', body: JSON.stringify(input) }),
    addContact: (contact: Partial<Contact>) => request<Contact>('/contacts', { method: 'POST', body: JSON.stringify(contact) }),
    updateContact: (id: unknown, contact: Partial<Contact>) => request<Contact>(`/contacts/${encodeURIComponent(String(id))}`, { method: 'PATCH', body: JSON.stringify(contact) }),
    deleteContact: (id: unknown) => request<{ success: boolean }>(`/contacts/${encodeURIComponent(String(id))}`, { method: 'DELETE' }),
}
