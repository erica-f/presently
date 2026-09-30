import type { BillingOverview } from '../lib/membershipApi'

export function hasActiveMembership(overview: Pick<BillingOverview, 'plan' | 'subscription'>) {
    return Boolean(overview.plan && overview.subscription?.status === 'active')
}
