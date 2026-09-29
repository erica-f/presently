import type { Membership } from "./gifts"
import type { SetStateAction, Dispatch } from 'react'
import type { Overview } from "../lib/profileApi"

export type CartInfo = {
    id: number
    cart_id: number
    category_id: number
    description: string
    level: number
    name: string
    point_cost: number
    product_id: number
    quantity: number
    thumbnail_image_url: string
    point_total: number
}

export interface CartCardType {
    item: CartInfo
    membership: Membership
    refresh?: Dispatch<SetStateAction<boolean>>
    pointsLeft: number
}

export interface CartPoints {
    cart: CartInfo[]
    currentPoints: number
    pointsLeft: number
}