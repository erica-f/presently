import type { LayoutDashboard } from 'lucide-react'
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
    membershipLevel: string
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
    tier?: string
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
    action?: ReactNode
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

export interface AdminUser {
    id: number
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'user'
    isActive: boolean
    createdAt: string
    updatedAt: string
    formattedCreated: string
    subscriptionStatus: string | null
    planName: string | null
    planLevel: number | null
    pointBalance: number
    orderCount: number
}

export interface AdminUserUpdateInput {
    firstName: string
    lastName: string
    email: string
    role: 'admin' | 'user'
    isActive: boolean
}

export interface AdminMembershipPlan {
    id: number
    name: string
    level: number
    monthlyPoints: number
    price: number
    isActive: boolean
}

export interface AdminCategory {
    id: number
    name: string
    label: string
}

export interface AdminProduct {
    id: number
    name: string
    description: string | null
    thumbnailImageUrl: string | null
    categoryId: number
    categoryLabel: string
    categoryName: string
    pointCost: number
    minimumMembershipPlanLevel: number
    membershipPlanName?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    formattedUpdated: string
    orderCount: number
}

export interface AdminProductInput {
    name: string
    description: string
    thumbnailImageUrl: string
    categoryId: number
    pointCost: number
    minimumMembershipPlanLevel: number
    isActive: boolean
}

export interface AdminOrderItem {
    id: number
    productId: number
    productName: string
    thumbnailImageUrl: string | null
    quantity: number
    unitPointCost: number
    linePointTotal: number
}

export interface AdminOrder {
    id: number
    orderNumber: string
    userId: number
    buyerName: string
    buyerEmail: string
    membershipLevel: string
    recipientName: string
    recipientAddress: {
        line1: string
        line2?: string | null
        postalCode: string
        city: string
        countryCode: string
    }
    paperType: string
    message: string | null
    signed: string | null
    totalPoints: number
    status: 'pending' | 'completed' | 'cancelled'
    isSent: boolean
    sentAt: string | null
    formattedSentAt: string | null
    createdAt: string
    formattedCreatedAt: string
    items: AdminOrderItem[]
}


export interface AdminNavTab {
    id: string
    label: string
    href: string
    icon: typeof LayoutDashboard
    isActive: (pathname: string) => boolean
}