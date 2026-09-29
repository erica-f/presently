import type { ReactNode } from 'react'

export interface AdminStatItem {
    id: string
    title: string
    value: string
    description: string
    icon: ReactNode
}

export interface MembershipDistributionTier {
    id: string
    name: string
    tierLabel: string
    count: number
    percentage: number
    description: string
    color: 'sage' | 'primary' | 'gold'
}

export interface OperationalMetricItem {
    id: string
    label: string
    value: string
    badge?: string
    badgeType?: 'warning' | 'default'
    bulletColor?: 'primary' | 'warning' | 'accent'
}

export interface RecentGiftActivityItem {
    id: string
    recipient: string
    city: string
    membershipLevel: 'Simple' | 'Plus' | 'Signature'
    giftName: string
    points: number
    timestamp: string
    status: 'Under packning' | 'Skickad' | 'Levererad'
}

export interface RecentProductChangeItem {
    id: string
    title: string
    sku: string
    category: string
    points: number
    tier?: 'Signature' | 'Plus' | 'Simple'
    hasEngraving?: boolean
    timestamp: string
    status: 'Aktiv' | 'Utkast' | 'Pausad'
}

export type RecentContentChangeItem = RecentProductChangeItem

export interface AdminOverviewStats {
    totalUsers: number
    activeUsers: number
    activeMemberships: number
    simpleMemberships: number
    plusMemberships: number
    signatureMemberships: number
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalProducts: number
    activeProducts: number
    categoriesCount: number
}

export interface AdminOverviewResponse {
    stats: AdminOverviewStats
    distribution: {
        totalActive: number
        tiers: MembershipDistributionTier[]
    }
    operationalStatus: {
        metrics: OperationalMetricItem[]
    }
    recentActivity: RecentGiftActivityItem[]
    recentChanges: RecentProductChangeItem[]
}

export interface AdminBreadcrumbItem {
    label: string
    href?: string
}

export interface AdminBreadcrumbsProps {
    items?: AdminBreadcrumbItem[]
}

export interface AdminHeaderProps {
    title?: string
    description?: string
    onAddProduct?: () => void
}

export interface AdminMembershipDistributionProps {
    totalActive?: number
    tiers?: MembershipDistributionTier[]
    className?: string
}

export interface AdminOperationalStatusProps {
    metrics?: OperationalMetricItem[]
    environmentTag?: string
    databaseScopeNotice?: string
    className?: string
}

export interface AdminRecentActivityProps {
    activities?: RecentGiftActivityItem[]
    historyUrl?: string
}

export interface AdminRecentChangesProps {
    changes?: RecentProductChangeItem[]
    onEdit?: (item: RecentProductChangeItem) => void
    manageAllUrl?: string
}

export interface AdminStatsGridProps {
    stats?: AdminStatItem[]
}