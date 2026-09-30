
export type Membership = {
    name: string
    id: number
    level: number
    monthly_points: number
    max_saved_contacts: number | null
    price: number
    is_active: number
}

export type UserDetail = {
    first_name: string
    user_id: number
    membership_id: number
    current_points: number
}

export type GiftInfo = {
    id: number
    name: string
    description: string
    point_cost: number
    minimum_membership_plan_level: number,
    thumbnail_image_url: string
    product_images?: string[]
    category_id: number
}

export type FeaturedGift = {
    id: number
    name: string
    description: string
    points: number
    category: string
    membership: string
    membershipLevel: number
    imageUrl: string
}

export type Categories = {
    id: number
    name: string
    label: string
}

export interface CardDetails {
    userMembershipId: number
    userCurrentPoints: number
    gift: GiftInfo
    memberships: Membership[]
    category: Categories
}

export type MembershipGateProps = {
    currentMembership?: Membership
    giftName: string
    requiredLevel: number
    requiredMembership?: Membership
}

export type PageMessageProps = {
    title: string
    description?: string
    loading?: boolean
}

export type ProductGalleryProps = {
    giftName: string
    images: string[]
    selectedImage: number
    onSelectImage: (index: number) => void
}

export type GiftPurchasePanelProps = {
    gift: GiftInfo
    currentPoints: number
    cartPointTotal: number
    onCartPointTotalChange: (pointTotal: number) => void
}

export type AddToCartButtonProps = {
    productId: number
    disabled?: boolean
    className?: string
    label?: string
    onAdded?: (result: AddToCartResponse) => void
}

export type AddToCartResponse = {
    success: boolean
    productId: number
    quantity: number
    pointTotal: number
}

export type CartSummary = {
    items: unknown[]
    itemCount: number
    pointTotal: number
}