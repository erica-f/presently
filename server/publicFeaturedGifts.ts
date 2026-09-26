import express, { type Request, type Response } from 'express'
import { db } from './db.js'
import { mapPublicFeaturedGift, type PublicFeaturedGiftRow } from './publicFeaturedGiftsData.js'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await db.query<PublicFeaturedGiftRow[]>(`
            SELECT
                p.id,
                p.name,
                p.description,
                p.point_cost,
                p.thumbnail_image_url,
                c.label AS category_label,
                m.name AS membership_name,
                m.level AS membership_level
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            INNER JOIN membership_plans m
                ON m.level = p.minimum_membership_plan_level
                AND m.is_active = 1
            WHERE p.is_active = 1
                AND p.thumbnail_image_url IS NOT NULL
                AND TRIM(p.thumbnail_image_url) <> ''
            ORDER BY RAND()
            LIMIT 3
        `)

        res.json(result.map(mapPublicFeaturedGift))
    } catch (error) {
        console.error('Unable to load public featured gifts:', error)
        res.status(500).json({ message: 'Unable to load featured gifts. Try again' })
    }
})

export default router
