export type PublicFeaturedGiftRow = {
    id: number
    name: string
    description: string
    point_cost: number
    thumbnail_image_url: string
    category_label: string
    membership_name: string
    membership_level: number
}

export type PublicFeaturedGift = {
    id: number
    name: string
    description: string
    points: number
    category: string
    membership: string
    membershipLevel: number
    imageUrl: string
}

export function normalizeImageUrl(value: string): string {
    const url = value.trim()
    if (url.startsWith('/') || /^https?:\/\//i.test(url) || url.startsWith('//')) return url
    return `/${url}`
}

export function mapPublicFeaturedGift(row: PublicFeaturedGiftRow): PublicFeaturedGift {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        points: row.point_cost,
        category: row.category_label,
        membership: row.membership_name,
        membershipLevel: row.membership_level,
        imageUrl: normalizeImageUrl(row.thumbnail_image_url),
    }
}
