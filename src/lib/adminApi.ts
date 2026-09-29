import type { AdminOverviewResponse } from '../types/admin'

export const adminApi = {
    async getOverview(): Promise<AdminOverviewResponse> {
        const response = await fetch('/api/admin/overview', { credentials: 'include' })
        const payload = (await response.json().catch(() => ({}))) as Partial<AdminOverviewResponse> & { error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Kunde inte läsa in översiktsdata för administration.')

        return payload as AdminOverviewResponse
    }
}