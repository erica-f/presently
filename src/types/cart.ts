import type { Membership } from "./gifts"
import type { SetStateAction, Dispatch } from 'react'
import type { ContactForm } from '../lib/profileApi'

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
    refresh: Dispatch<SetStateAction<boolean>>
    pointsLeft: number
    onUpdate: () => void
}

export interface CartPoints {
    cart: CartInfo[]
    currentPoints: number
    pointsLeft: number
}

export type HeadlineType = {
    headline: string
    description?: string
}

export type MessageDetails = {
    type: string
    message: string
    signed: string
}

export type OrderResponse = {
    success: boolean
    delivery: ContactForm
    message: MessageDetails
    cart: CartInfo[]
}