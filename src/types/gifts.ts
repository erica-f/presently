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
    category_id: number
}
export type Categories = {
    id: number
    name: string
    label: string
}

export interface CardDetails {
    userDetails: UserDetail
    gift: GiftInfo
    memberships: Membership[]
    category: Categories
}