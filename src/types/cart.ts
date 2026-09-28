import type { Membership } from "./gifts"
import type { SetStateAction, Dispatch } from 'react'

export type CartInfo = {
    cartItemId: number
    cart_id: number
    category_id: number
    description: string
    level: number
    name: string
    point_cost: number
    product_id: number
    quantity: number
    thumbnail_image_url: string
}

export interface CartCardType {
    item: CartInfo
    membership: Membership
    refresh: Dispatch<SetStateAction<boolean>>
}