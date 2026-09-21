export type Membership = {
    name: 'Simple' | 'Plus' | 'Signature'
    id: number
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
    minimum_membership_plan_id: number,
    thumbnail_img_url: string
    category: number
}
export type Categories = {
    id: number
    name: string
    label: string
}

export interface CardDetails {
    userDetails: UserDetail
    gift: GiftInfo
    membership: Membership[]
    category: Categories
}