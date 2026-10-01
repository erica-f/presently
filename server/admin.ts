import express, { type Request, type Response, type RequestHandler } from 'express'
import { db } from './db.js'
import type { CacheEntry } from './types/cache.ts';

const adminRouter = express.Router()
const adminVerificationCache = new Map<number, { isAdmin: boolean; expiresAt: number }>()

export function invalidateAdminCache(userId?: number) {
    if (userId) {
        adminVerificationCache.delete(userId)
    } else {
        adminVerificationCache.clear()
    }
}

let cachedCategories: CacheEntry<Array<{ id: number; name: string; label: string }>> | null = null
let cachedPlans: CacheEntry<Array<{ id: number; name: string; level: number; monthlyPoints: number; price: number; isActive: boolean }>> | null = null

export function invalidateCategoriesCache() {
    cachedCategories = null
}

export function invalidateMembershipPlansCache() {
    cachedPlans = null
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
    const userId = req.session.userId
    if (!userId) {
        res.status(401).json({ error: 'Din admin-session har löpt ut. Logga in igen.' })
        return
    }

    const now = Date.now()
    const cached = adminVerificationCache.get(userId)
    if (cached && cached.expiresAt > now) {
        if (!cached.isAdmin) {
            res.status(403).json({ error: 'Åtkomst nekad. Endast administratörer har tillgång.' })
            return
        }
        res.locals.userId = userId
        next()
        return
    }

    if (req.session.role === 'admin') {
        adminVerificationCache.set(userId, { isAdmin: true, expiresAt: now + 30_000 })
        res.locals.userId = userId
        next()
        return
    }

    try {
        const [user] = await db.query('SELECT role, is_active FROM users WHERE id = ?', [userId])
        const isAdmin = Boolean(user && user.role === 'admin' && Number(user.is_active) === 1)
        adminVerificationCache.set(userId, { isAdmin, expiresAt: now + 30_000 })

        if (!isAdmin) {
            res.status(403).json({ error: 'Åtkomst nekad. Endast administratörer har tillgång.' })
            return
        }
        req.session.role = 'admin'
        res.locals.userId = userId
        next()
    } catch (err) {
        console.error('Admin verification error:', err)
        res.status(500).json({ error: 'Kunde inte verifiera administratörsrättigheter' })
    }
}

adminRouter.use(requireAdmin)

function formatSwedishDate(dateVal: Date | string | null | undefined): string {
    if (!dateVal) return ''
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
    if (Number.isNaN(date.getTime())) return ''

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const timeStr = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })

    if (targetDate.getTime() === today.getTime()) return `Idag ${timeStr}`
    if (targetDate.getTime() === yesterday.getTime()) return `Igår ${timeStr}`

    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
    const day = date.getDate()
    const month = months[date.getMonth()]
    return `${day} ${month}, ${timeStr}`
}

adminRouter.get('/overview', async (_req: Request, res: Response) => {
    try {
        const [
            unifiedStatsRows,
            planRows,
            recentOrderRows,
            recentProductRows,
        ] = await Promise.all([
            db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users) AS total_users,
                    (SELECT COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) FROM users) AS active_users,
                    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS total_active_subscriptions,
                    (SELECT COALESCE(SUM(CASE WHEN mp.level = 1 THEN 1 ELSE 0 END), 0) FROM subscriptions s JOIN membership_plans mp ON mp.id = s.membership_plan_id WHERE s.status = 'active') AS simple_count,
                    (SELECT COALESCE(SUM(CASE WHEN mp.level = 2 THEN 1 ELSE 0 END), 0) FROM subscriptions s JOIN membership_plans mp ON mp.id = s.membership_plan_id WHERE s.status = 'active') AS plus_count,
                    (SELECT COALESCE(SUM(CASE WHEN mp.level = 3 THEN 1 ELSE 0 END), 0) FROM subscriptions s JOIN membership_plans mp ON mp.id = s.membership_plan_id WHERE s.status = 'active') AS signature_count,
                    (SELECT COUNT(*) FROM gift_orders) AS total_orders,
                    (SELECT COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) FROM gift_orders) AS pending_orders,
                    (SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) FROM gift_orders) AS completed_orders,
                    (SELECT COUNT(*) FROM products) AS total_products,
                    (SELECT COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) FROM products) AS active_products,
                    (SELECT COALESCE(SUM(CASE WHEN is_active = 1 AND minimum_membership_plan_level = 1 THEN 1 ELSE 0 END), 0) FROM products) AS level_1_products,
                    (SELECT COALESCE(SUM(CASE WHEN is_active = 1 AND minimum_membership_plan_level IN (2, 3) THEN 1 ELSE 0 END), 0) FROM products) AS premium_products,
                    (SELECT COUNT(*) FROM categories) AS category_count
            `),
            db.query(`
                SELECT
                    mp.id,
                    mp.name,
                    mp.level,
                    mp.monthly_points,
                    COUNT(s.id) AS subscriber_count
                FROM membership_plans mp
                LEFT JOIN subscriptions s ON s.membership_plan_id = mp.id AND s.status = 'active'
                WHERE mp.is_active = 1
                GROUP BY mp.id, mp.name, mp.level, mp.monthly_points
                ORDER BY mp.level ASC
            `),
            db.query(`
                SELECT
                    o.id,
                    o.recipient_name,
                    o.recipient_city,
                    o.status,
                    o.total_points,
                    o.created_at,
                    COALESCE(mp.name, 'Simple') AS membership_level,
                    (
                        SELECT GROUP_CONCAT(
                            CONCAT(oi.product_name_snapshot, IF(oi.quantity > 1, CONCAT(' (', oi.quantity, ' st)'), ''))
                            ORDER BY oi.id ASC SEPARATOR '||'
                        )
                        FROM gift_order_items oi
                        WHERE oi.gift_order_id = o.id
                    ) AS items_summary
                FROM gift_orders o
                LEFT JOIN subscriptions s ON s.user_id = o.user_id AND s.status = 'active'
                LEFT JOIN membership_plans mp ON mp.id = s.membership_plan_id
                ORDER BY o.created_at DESC, o.id DESC
                LIMIT 6
            `),
            db.query(`
                SELECT
                    p.id,
                    p.name,
                    p.point_cost,
                    p.minimum_membership_plan_level,
                    p.is_active,
                    p.created_at,
                    p.updated_at,
                    c.label AS category_label,
                    mp.name AS membership_plan_name
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN membership_plans mp ON mp.level = p.minimum_membership_plan_level
                ORDER BY COALESCE(p.updated_at, p.created_at) DESC, p.id DESC
                LIMIT 6
            `),
        ])

        const statsRow = (unifiedStatsRows as Record<string, unknown>[])[0] ?? {}
        const totalUsers = Number(statsRow.total_users ?? 0)
        const activeUsers = Number(statsRow.active_users ?? 0)
        const activeMemberships = Number(statsRow.total_active_subscriptions ?? 0)
        const simpleMemberships = Number(statsRow.simple_count ?? 0)
        const plusMemberships = Number(statsRow.plus_count ?? 0)
        const signatureMemberships = Number(statsRow.signature_count ?? 0)
        const totalOrders = Number(statsRow.total_orders ?? 0)
        const pendingOrders = Number(statsRow.pending_orders ?? 0)
        const completedOrders = Number(statsRow.completed_orders ?? 0)
        const totalProducts = Number(statsRow.total_products ?? 0)
        const activeProducts = Number(statsRow.active_products ?? 0)
        const level1Products = Number(statsRow.level_1_products ?? 0)
        const premiumProducts = Number(statsRow.premium_products ?? 0)
        const categoriesCount = Number(statsRow.category_count ?? 0)
        const tierColorMap: Record<number, 'sage' | 'primary' | 'gold'> = { 1: 'sage', 2: 'primary', 3: 'gold' }
        const tierDescMap: Record<number, string> = { 1: 'Tillgång till basutbudet bland gåvosortimentet.', 2: 'Utökat gåvosortiment och fler månatliga poäng.', 3: 'Exklusiva gåvor och ännu fler förmåner.' }

        const tiers = (planRows as Record<string, unknown>[]).map((plan) => {
            const level = Number(plan.level ?? 1)
            const count = Number(plan.subscriber_count ?? 0)
            const percentage = activeMemberships > 0 ? Math.round((count / activeMemberships) * 100) : 0
            const monthlyPoints = Number(plan.monthly_points ?? 0)

            return {
                id: String(plan.name ?? '').toLowerCase(),
                name: String(plan.name ?? 'Medlemskap'),
                tierLabel: `Nivå ${level}, ${monthlyPoints} p/mån`,
                count,
                percentage,
                description: tierDescMap[level] ?? 'Förmåner och gåvoutbud för nivån.',
                color: tierColorMap[level] ?? 'primary',
            }
        })

        const recentActivity = (recentOrderRows as Record<string, unknown>[]).map((order) => {
            const oid = Number(order.id)
            const rawSummary = typeof order.items_summary === 'string' ? order.items_summary.trim() : ''
            const items = rawSummary ? rawSummary.split('||').filter(Boolean) : []
            let giftName = 'Gåvobeställning'
            if (items.length === 1) {
                giftName = items[0]
            } else if (items.length > 1) {
                giftName = `${items[0]} + ${items.length - 1} till`
            }

            const rawStatus = String(order.status ?? 'pending')
            const status: 'Under packning' | 'Skickad' | 'Levererad' = rawStatus === 'completed' ? 'Levererad' : rawStatus === 'pending' ? 'Under packning' : 'Skickad'
            const rawPlan = String(order.membership_level ?? 'Simple')
            const membershipLevel: 'Simple' | 'Plus' | 'Signature' = rawPlan === 'Signature' ? 'Signature' : rawPlan === 'Plus' ? 'Plus' : 'Simple'

            return {
                id: String(oid),
                recipient: String(order.recipient_name ?? 'Okänd mottagare'),
                city: String(order.recipient_city ?? 'Sverige'),
                membershipLevel,
                giftName,
                points: Number(order.total_points ?? 0),
                timestamp: formatSwedishDate(order.created_at as Date | string),
                status,
            }
        })

        const recentChanges = (recentProductRows as Record<string, unknown>[]).map((product) => {
            const pid = Number(product.id)
            const level = Number(product.minimum_membership_plan_level ?? 1)
            const tier = String(product.membership_plan_name ?? `Nivå ${level}`)
            const title = String(product.name ?? 'Gåva')
            const hasEngraving = title.toLowerCase().includes('gravyr') || title.toLowerCase().includes('graverat')

            return {
                id: String(pid),
                title,
                sku: `Art.nr: ${String(pid).padStart(4, '0')}`,
                category: String(product.category_label ?? 'Gåvor'),
                points: Number(product.point_cost ?? 0),
                tier,
                hasEngraving,
                timestamp: formatSwedishDate((product.updated_at ?? product.created_at) as Date | string),
                status: (product.is_active === 1 ? 'Aktiv' : 'Utkast') as 'Aktiv' | 'Utkast' | 'Pausad',
            }
        })

        const operationalMetrics = [
            {
                id: 'active-products',
                label: 'Aktiva produkter i butik',
                value: `${activeProducts} st`,
                bulletColor: 'primary' as const,
            },
            {
                id: 'level-1-products',
                label: 'Produkter för Simple (Nivå 1)',
                value: `${level1Products} st`,
                bulletColor: 'primary' as const,
            },
            {
                id: 'premium-products',
                label: 'Produkter för Plus & Signature (Nivå 2–3)',
                value: `${premiumProducts} st`,
                bulletColor: 'primary' as const,
            },
            {
                id: 'categories-count',
                label: 'Aktiva produktkategorier',
                value: `${categoriesCount} st`,
                bulletColor: 'primary' as const,
            },
            {
                id: 'pending-orders',
                label: 'Pågående gåvobeställningar',
                value: pendingOrders === 0 ? '0 st' : '',
                badge: pendingOrders > 0 ? `${pendingOrders} under packning` : 'Alla hanterade',
                badgeType: pendingOrders > 0 ? ('warning' as const) : ('default' as const),
                bulletColor: pendingOrders > 0 ? ('warning' as const) : ('primary' as const),
            },
        ]

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                activeMemberships,
                simpleMemberships,
                plusMemberships,
                signatureMemberships,
                totalOrders,
                pendingOrders,
                completedOrders,
                totalProducts,
                activeProducts,
                categoriesCount,
            },
            distribution: {
                totalActive: activeMemberships,
                tiers,
            },
            operationalStatus: {
                metrics: operationalMetrics,
            },
            recentActivity,
            recentChanges,
        })
    } catch (error) {
        console.error('Admin overview failed:', error)
        res.status(500).json({ error: 'Kunde inte läsa in översiktsdata för administration.' })
    }
})

adminRouter.get('/users', async (req: Request, res: Response) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
        const role = typeof req.query.role === 'string' ? req.query.role.trim() : 'all'
        const status = typeof req.query.status === 'string' ? req.query.status.trim() : 'all'

        let sql = `
            SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                u.is_active,
                u.created_at,
                u.updated_at,
                s.status AS subscription_status,
                mp.name AS plan_name,
                mp.level AS plan_level,
                COALESCE((SELECT SUM(pt.points) FROM point_transactions pt WHERE pt.user_id = u.id), 0) AS point_balance,
                COALESCE((SELECT COUNT(*) FROM gift_orders o WHERE o.user_id = u.id), 0) AS order_count
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
            LEFT JOIN membership_plans mp ON mp.id = s.membership_plan_id
            WHERE 1=1
        `
        const params: unknown[] = []

        if (search) {
            sql += ` AND (LOWER(u.first_name) LIKE ? OR LOWER(u.last_name) LIKE ? OR LOWER(u.email) LIKE ? OR CONCAT(LOWER(u.first_name), ' ', LOWER(u.last_name)) LIKE ?)`
            const pattern = `%${search}%`
            params.push(pattern, pattern, pattern, pattern)
        }

        if (role === 'admin' || role === 'user') {
            sql += ` AND u.role = ?`
            params.push(role)
        }

        if (status === 'active') {
            sql += ` AND u.is_active = 1`
        } else if (status === 'inactive') {
            sql += ` AND u.is_active = 0`
        }

        sql += ` ORDER BY u.created_at DESC, u.id DESC`

        const rows = await db.query(sql, params)

        const users = (rows as Record<string, unknown>[]).map((user) => ({
            id: Number(user.id),
            email: String(user.email ?? ''),
            firstName: String(user.first_name ?? ''),
            lastName: String(user.last_name ?? ''),
            role: (user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
            isActive: Number(user.is_active) === 1,
            createdAt: user.created_at ? new Date(String(user.created_at)).toISOString() : '',
            updatedAt: user.updated_at ? new Date(String(user.updated_at)).toISOString() : '',
            formattedCreated: formatSwedishDate(user.created_at as Date | string),
            subscriptionStatus: user.subscription_status ? String(user.subscription_status) : null,
            planName: user.plan_name ? String(user.plan_name) : null,
            planLevel: user.plan_level !== null && user.plan_level !== undefined ? Number(user.plan_level) : null,
            pointBalance: Number(user.point_balance ?? 0),
            orderCount: Number(user.order_count ?? 0),
        }))

        res.json({ users })
    } catch (error) {
        console.error('Failed to fetch admin users:', error)
        res.status(500).json({ error: 'Kunde inte läsa in medlemslistan.' })
    }
})

adminRouter.put('/users/:id', async (req: Request, res: Response) => {
    try {
        const targetId = Number(req.params.id)
        if (!Number.isInteger(targetId) || targetId <= 0) {
            res.status(400).json({ error: 'Ogiltigt användar-ID' })
            return
        }

        const currentUserId = Number(res.locals.userId)
        const { firstName, lastName, email, role, isActive } = req.body ?? {}

        if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
            res.status(400).json({ error: 'Ange en giltig e-postadress.' })
            return
        }

        if (typeof firstName !== 'string' || firstName.trim().length === 0) {
            res.status(400).json({ error: 'Förnamn krävs.' })
            return
        }

        if (typeof lastName !== 'string' || lastName.trim().length === 0) {
            res.status(400).json({ error: 'Efternamn krävs.' })
            return
        }

        if (role !== 'user' && role !== 'admin') {
            res.status(400).json({ error: 'Roll måste vara antingen användare eller administratör.' })
            return
        }

        if (targetId === currentUserId && role !== 'admin') {
            res.status(400).json({ error: 'Du kan inte ta bort din egen administratörsroll.' })
            return
        }

        if (targetId === currentUserId && isActive === false) {
            res.status(400).json({ error: 'Du kan inte inaktivera ditt eget konto.' })
            return
        }

        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [targetId])
        if (!existing) {
            res.status(404).json({ error: 'Användaren hittades inte.' })
            return
        }

        const [emailConflict] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim().toLowerCase(), targetId])
        if (emailConflict) {
            res.status(409).json({ error: 'E-postadressen används redan av ett annat konto.' })
            return
        }

        const activeVal = isActive === false || isActive === 0 ? 0 : 1

        await db.query(
            `UPDATE users 
             SET first_name = ?, last_name = ?, email = ?, role = ?, is_active = ?, updated_at = NOW() 
             WHERE id = ?`,
            [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), role, activeVal, targetId]
        )

        invalidateAdminCache(targetId)

        res.json({
            success: true,
            message: 'Användaren har uppdaterats.',
            user: {
                id: targetId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                role,
                isActive: activeVal === 1,
            }
        })
    } catch (error) {
        console.error('Failed to update admin user:', error)
        res.status(500).json({ error: 'Kunde inte uppdatera användaren.' })
    }
})

adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const targetId = Number(req.params.id)
        if (!Number.isInteger(targetId) || targetId <= 0) {
            res.status(400).json({ error: 'Ogiltigt användar-ID' })
            return
        }

        const currentUserId = Number(res.locals.userId)
        if (targetId === currentUserId) {
            res.status(400).json({ error: 'Du kan inte radera ditt eget administratörskonto.' })
            return
        }

        const [existing] = await db.query('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [targetId])
        if (!existing) {
            res.status(404).json({ error: 'Användaren hittades inte.' })
            return
        }

        const conn = await db.getConnection()
        try {
            await conn.beginTransaction()
            await conn.query('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)', [targetId])
            await conn.query('DELETE FROM carts WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM gift_order_items WHERE gift_order_id IN (SELECT id FROM gift_orders WHERE user_id = ?)', [targetId])
            await conn.query('DELETE FROM gift_orders WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM point_transactions WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM payments WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM subscriptions WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM contacts WHERE user_id = ?', [targetId])
            await conn.query('DELETE FROM users WHERE id = ?', [targetId])
            await conn.commit()
        } catch (err) {
            await conn.rollback()
            throw err
        } finally {
            conn.release()
        }

        invalidateAdminCache(targetId)

        res.json({
            success: true,
            message: `Kontot för ${existing.first_name} ${existing.last_name} (${existing.email}) har raderats permanent.`
        })
    } catch (error) {
        console.error('Failed to delete admin user:', error)
        res.status(500).json({ error: 'Kunde inte radera användarkontot.' })
    }
})

adminRouter.get('/membership-plans', async (_req: Request, res: Response) => {
    try {
        if (cachedPlans && cachedPlans.expiresAt > Date.now()) {
            res.json({ plans: cachedPlans.data })
            return
        }

        const rows = await db.query('SELECT id, name, level, monthly_points, price, is_active FROM membership_plans ORDER BY level ASC')
        const plans = (rows as Record<string, unknown>[]).map((row) => ({
            id: Number(row.id),
            name: String(row.name ?? ''),
            level: Number(row.level ?? 1),
            monthlyPoints: Number(row.monthly_points ?? 0),
            price: Number(row.price ?? 0),
            isActive: Number(row.is_active) === 1,
        }))

        cachedPlans = { data: plans, expiresAt: Date.now() + 5 * 60 * 1000 }
        res.json({ plans })
    } catch (error) {
        console.error('Failed to fetch membership plans:', error)
        res.status(500).json({ error: 'Kunde inte läsa in medlemskapsplaner.' })
    }
})

adminRouter.get('/categories', async (_req: Request, res: Response) => {
    try {
        if (cachedCategories && cachedCategories.expiresAt > Date.now()) {
            res.json({ categories: cachedCategories.data })
            return
        }

        const rows = await db.query('SELECT id, name, label FROM categories ORDER BY label ASC')
        const categories = (rows as Record<string, unknown>[]).map((cat) => ({
            id: Number(cat.id),
            name: String(cat.name ?? ''),
            label: String(cat.label ?? cat.name ?? ''),
        }))

        cachedCategories = { data: categories, expiresAt: Date.now() + 5 * 60 * 1000 }
        res.json({ categories })
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        res.status(500).json({ error: 'Kunde inte läsa in kategorier.' })
    }
})

adminRouter.get('/products', async (req: Request, res: Response) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
        const categoryId = req.query.category_id ? Number(req.query.category_id) : null
        const status = typeof req.query.status === 'string' ? req.query.status.trim() : 'all'
        const tier = req.query.tier ? Number(req.query.tier) : null

        let sql = `
            SELECT 
                p.id,
                p.name,
                p.description,
                p.thumbnail_image_url,
                p.category_id,
                p.point_cost,
                p.minimum_membership_plan_level,
                p.is_active,
                p.created_at,
                p.updated_at,
                c.label AS category_label,
                c.name AS category_name,
                mp.name AS membership_plan_name,
                COALESCE((SELECT COUNT(*) FROM gift_order_items oi WHERE oi.product_id = p.id), 0) AS order_count
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN membership_plans mp ON mp.level = p.minimum_membership_plan_level
            WHERE 1=1
        `
        const params: unknown[] = []

        if (search) {
            sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.description, '')) LIKE ?)`
            const pattern = `%${search}%`
            params.push(pattern, pattern)
        }

        if (categoryId && Number.isInteger(categoryId) && categoryId > 0) {
            sql += ` AND p.category_id = ?`
            params.push(categoryId)
        }

        if (tier && Number.isInteger(tier) && tier > 0) {
            sql += ` AND p.minimum_membership_plan_level = ?`
            params.push(tier)
        }

        if (status === 'active') {
            sql += ` AND p.is_active = 1`
        } else if (status === 'inactive') {
            sql += ` AND p.is_active = 0`
        }

        sql += ` ORDER BY p.id DESC`

        const rows = await db.query(sql, params)

        const products = (rows as Record<string, unknown>[]).map((prod) => ({
            id: Number(prod.id),
            name: String(prod.name ?? ''),
            description: prod.description ? String(prod.description) : null,
            thumbnailImageUrl: prod.thumbnail_image_url ? String(prod.thumbnail_image_url) : null,
            categoryId: Number(prod.category_id ?? 0),
            categoryLabel: String(prod.category_label ?? prod.category_name ?? 'Okänd kategori'),
            categoryName: String(prod.category_name ?? ''),
            pointCost: Number(prod.point_cost ?? 0),
            minimumMembershipPlanLevel: Number(prod.minimum_membership_plan_level ?? 1),
            membershipPlanName: String(prod.membership_plan_name ?? `Nivå ${prod.minimum_membership_plan_level ?? 1}`),
            isActive: Number(prod.is_active) === 1,
            createdAt: prod.created_at ? new Date(String(prod.created_at)).toISOString() : '',
            updatedAt: prod.updated_at ? new Date(String(prod.updated_at)).toISOString() : '',
            formattedUpdated: formatSwedishDate((prod.updated_at ?? prod.created_at) as Date | string),
            orderCount: Number(prod.order_count ?? 0),
        }))

        res.json({ products })
    } catch (error) {
        console.error('Failed to fetch admin products:', error)
        res.status(500).json({ error: 'Kunde inte läsa in produktlistan.' })
    }
})

adminRouter.post('/products', async (req: Request, res: Response) => {
    try {
        const { name, description, thumbnailImageUrl, categoryId, pointCost, minimumMembershipPlanLevel, isActive } = req.body ?? {}

        if (typeof name !== 'string' || name.trim().length < 2) {
            res.status(400).json({ error: 'Produktnamn måste vara minst 2 tecken.' })
            return
        }

        const catId = Number(categoryId)
        if (!Number.isInteger(catId) || catId <= 0) {
            res.status(400).json({ error: 'Vänligen välj en giltig kategori.' })
            return
        }

        const [catExists] = await db.query('SELECT id FROM categories WHERE id = ?', [catId])
        if (!catExists) {
            res.status(400).json({ error: 'Vald kategori existerar inte.' })
            return
        }

        const points = Number(pointCost)
        if (![100, 300, 600].includes(points)) {
            res.status(400).json({ error: 'Poängpris måste vara 100 (Simple), 300 (Plus) eller 600 (Signature).' })
            return
        }

        const level = Number(minimumMembershipPlanLevel ?? 1)
        if (![1, 2, 3].includes(level)) {
            res.status(400).json({ error: 'Lägsta medlemsnivå måste vara 1 (Simple), 2 (Plus) eller 3 (Signature).' })
            return
        }

        const activeVal = isActive === false || isActive === 0 ? 0 : 1
        const descVal = typeof description === 'string' ? description.trim() : null
        const imgVal = typeof thumbnailImageUrl === 'string' && thumbnailImageUrl.trim().length > 0 ? thumbnailImageUrl.trim() : null

        const insertResult = await db.query(
            `INSERT INTO products (name, description, thumbnail_image_url, category_id, point_cost, minimum_membership_plan_level, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name.trim(), descVal, imgVal, catId, points, level, activeVal]
        ) as { insertId?: unknown }

        const productId = Number(insertResult.insertId)

        if (imgVal && productId > 0) {
            await db.query(
                `INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)`,
                [productId, imgVal]
            ).catch((imgErr) => console.warn('Could not insert product_image thumbnail:', imgErr))
        }

        res.status(201).json({
            success: true,
            message: 'Produkten har skapats.',
            productId,
        })
    } catch (error) {
        console.error('Failed to create admin product:', error)
        res.status(500).json({ error: 'Kunde inte skapa produkten.' })
    }
})

adminRouter.put('/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            res.status(400).json({ error: 'Ogiltigt produkt-ID.' })
            return
        }

        const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [productId])
        if (!existing) {
            res.status(404).json({ error: 'Produkten hittades inte.' })
            return
        }

        const { name, description, thumbnailImageUrl, categoryId, pointCost, minimumMembershipPlanLevel, isActive } = req.body ?? {}

        if (typeof name !== 'string' || name.trim().length < 2) {
            res.status(400).json({ error: 'Produktnamn måste vara minst 2 tecken.' })
            return
        }

        const catId = Number(categoryId)
        if (!Number.isInteger(catId) || catId <= 0) {
            res.status(400).json({ error: 'Vänligen välj en giltig kategori.' })
            return
        }

        const [catExists] = await db.query('SELECT id FROM categories WHERE id = ?', [catId])
        if (!catExists) {
            res.status(400).json({ error: 'Vald kategori existerar inte.' })
            return
        }

        const points = Number(pointCost)
        if (![100, 300, 600].includes(points)) {
            res.status(400).json({ error: 'Poängpris måste vara 100 (Simple), 300 (Plus) eller 600 (Signature).' })
            return
        }

        const level = Number(minimumMembershipPlanLevel ?? 1)
        if (![1, 2, 3].includes(level)) {
            res.status(400).json({ error: 'Lägsta medlemsnivå måste vara 1, 2 eller 3.' })
            return
        }

        const activeVal = isActive === false || isActive === 0 ? 0 : 1
        const descVal = typeof description === 'string' ? description.trim() : null
        const imgVal = typeof thumbnailImageUrl === 'string' && thumbnailImageUrl.trim().length > 0 ? thumbnailImageUrl.trim() : null

        await db.query(
            `UPDATE products
             SET name = ?, description = ?, thumbnail_image_url = ?, category_id = ?, point_cost = ?, minimum_membership_plan_level = ?, is_active = ?, updated_at = NOW()
             WHERE id = ?`,
            [name.trim(), descVal, imgVal, catId, points, level, activeVal, productId]
        )

        if (imgVal) {
            const [firstImg] = await db.query('SELECT id FROM product_images WHERE product_id = ? AND sort_order = 0', [productId])
            if (firstImg) {
                await db.query('UPDATE product_images SET image_url = ? WHERE id = ?', [imgVal, firstImg.id])
            } else {
                await db.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)', [productId, imgVal])
            }
        }

        res.json({
            success: true,
            message: 'Produkten har uppdaterats.',
            productId,
        })
    } catch (error) {
        console.error('Failed to update admin product:', error)
        res.status(500).json({ error: 'Kunde inte uppdatera produkten.' })
    }
})

adminRouter.delete('/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            res.status(400).json({ error: 'Ogiltigt produkt-ID.' })
            return
        }

        const [product] = await db.query('SELECT id, name FROM products WHERE id = ?', [productId])
        if (!product) {
            res.status(404).json({ error: 'Produkten hittades inte.' })
            return
        }

        const [orderItemUsage] = await db.query('SELECT COUNT(*) AS count FROM gift_order_items WHERE product_id = ?', [productId])
        const hasOrders = Number(orderItemUsage?.count ?? 0) > 0

        if (hasOrders) {
            await db.query('UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?', [productId])
            await db.query('DELETE FROM cart_items WHERE product_id = ?', [productId])

            res.json({
                success: true,
                archived: true,
                message: `"${product.name}" har tidigare beställningar och inaktiverades därför i butiken istället för att tas bort helt.`
            })
            return
        }

        const conn = await db.getConnection()
        try {
            await conn.beginTransaction()
            await conn.query('DELETE FROM cart_items WHERE product_id = ?', [productId])
            await conn.query('DELETE FROM product_images WHERE product_id = ?', [productId])
            await conn.query('DELETE FROM products WHERE id = ?', [productId])
            await conn.commit()
        } catch (err) {
            await conn.rollback()
            throw err
        } finally {
            conn.release()
        }

        res.json({ success: true, deleted: true, message: `"${product.name}" har raderats permanent.` })
    } catch (error) {
        console.error('Failed to delete admin product:', error)
        res.status(500).json({ error: 'Kunde inte radera produkten.' })
    }
})

adminRouter.get('/orders', async (req: Request, res: Response) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
        const status = typeof req.query.status === 'string' ? req.query.status.trim() : 'all'

        let sql = `
            SELECT 
                o.id,
                o.user_id,
                o.status,
                o.recipient_name,
                o.recipient_address_line_1,
                o.recipient_address_line_2,
                o.recipient_postal_code,
                o.recipient_city,
                o.recipient_country_code,
                o.total_points,
                o.sent_at,
                o.created_at,
                o.updated_at,
                o.paper_type,
                o.message,
                o.signed,
                u.first_name AS buyer_first_name,
                u.last_name AS buyer_last_name,
                u.email AS buyer_email,
                COALESCE(mp.name, 'Simple') AS membership_level,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'productId', oi.product_id,
                            'productName', oi.product_name_snapshot,
                            'thumbnailImageUrl', p.thumbnail_image_url,
                            'quantity', oi.quantity,
                            'unitPointCost', oi.unit_point_cost,
                            'linePointTotal', oi.line_point_total
                        )
                    )
                    FROM gift_order_items oi
                    LEFT JOIN products p ON p.id = oi.product_id
                    WHERE oi.gift_order_id = o.id
                ) AS items_json
            FROM gift_orders o
            LEFT JOIN users u ON u.id = o.user_id
            LEFT JOIN subscriptions s ON s.user_id = o.user_id AND s.status = 'active'
            LEFT JOIN membership_plans mp ON mp.id = s.membership_plan_id
            WHERE 1=1
        `
        const params: unknown[] = []

        if (status === 'pending') {
            sql += ` AND o.sent_at IS NULL AND o.status != 'cancelled'`
        } else if (status === 'sent' || status === 'completed') {
            sql += ` AND (o.sent_at IS NOT NULL OR o.status = 'completed')`
        }

        if (search) {
            const cleanSearch = search.replace(/^#/, '').trim()
            sql += ` AND (
                LOWER(o.recipient_name) LIKE ? OR
                LOWER(o.recipient_city) LIKE ? OR
                LOWER(COALESCE(u.first_name, '')) LIKE ? OR
                LOWER(COALESCE(u.last_name, '')) LIKE ? OR
                LOWER(COALESCE(u.email, '')) LIKE ? OR
                LOWER(COALESCE(o.message, '')) LIKE ? OR
                LOWER(COALESCE(o.signed, '')) LIKE ? OR
                o.id = ?
            )`
            const pattern = `%${cleanSearch}%`
            const orderIdNum = Number.isInteger(Number(cleanSearch)) ? Number(cleanSearch) : -1
            params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, orderIdNum)
        }

        sql += ` ORDER BY o.created_at DESC, o.id DESC`

        const orderRows = (await db.query(sql, params)) as Record<string, unknown>[]

        const orders = orderRows.map((row) => {
            const oid = Number(row.id)
            const isSent = row.sent_at !== null && row.sent_at !== undefined
            const rawStatus = String(row.status ?? 'pending')
            const statusVal: 'pending' | 'completed' | 'cancelled' =
                rawStatus === 'cancelled' ? 'cancelled' : isSent || rawStatus === 'completed' ? 'completed' : 'pending'

            let rawItems: unknown[] = []
            if (row.items_json) {
                if (typeof row.items_json === 'string') {
                    try {
                        rawItems = JSON.parse(row.items_json)
                    } catch {
                        rawItems = []
                    }
                } else if (Array.isArray(row.items_json)) {
                    rawItems = row.items_json
                }
            }

            const items = (rawItems as Record<string, unknown>[]).map((item) => {
                const thumb = item.thumbnailImageUrl ? String(item.thumbnailImageUrl) : null
                const formattedThumb = thumb ? thumb.startsWith('http') || thumb.startsWith('/') ? thumb : `/${thumb}` : null

                return {
                    id: Number(item.id),
                    productId: Number(item.productId),
                    productName: String(item.productName ?? 'Gåva'),
                    thumbnailImageUrl: formattedThumb,
                    quantity: Number(item.quantity ?? 1),
                    unitPointCost: Number(item.unitPointCost ?? 0),
                    linePointTotal: Number(item.linePointTotal ?? 0),
                }
            })

            return {
                id: oid,
                orderNumber: String(oid).padStart(4, '0'),
                userId: Number(row.user_id),
                buyerName: `${String(row.buyer_first_name ?? '')} ${String(row.buyer_last_name ?? '')}`.trim() || 'Okänd beställare',
                buyerEmail: String(row.buyer_email ?? ''),
                membershipLevel: String(row.membership_level ?? 'Simple'),
                recipientName: String(row.recipient_name ?? ''),
                recipientAddress: {
                    line1: String(row.recipient_address_line_1 ?? ''),
                    line2: row.recipient_address_line_2 ? String(row.recipient_address_line_2) : null,
                    postalCode: String(row.recipient_postal_code ?? ''),
                    city: String(row.recipient_city ?? ''),
                    countryCode: String(row.recipient_country_code ?? 'SE'),
                },
                paperType: String(row.paper_type ?? 'forest'),
                message: row.message ? String(row.message) : null,
                signed: row.signed ? String(row.signed) : null,
                totalPoints: Number(row.total_points ?? 0),
                status: statusVal,
                isSent,
                sentAt: row.sent_at ? new Date(String(row.sent_at)).toISOString() : null,
                formattedSentAt: row.sent_at ? formatSwedishDate(row.sent_at as Date | string) : null,
                createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : '',
                formattedCreatedAt: formatSwedishDate(row.created_at as Date | string),
                items,
            }
        })

        res.json({ orders })
    } catch (error) {
        console.error('Failed to fetch admin orders:', error)
        res.status(500).json({ error: 'Kunde inte läsa in gåvohistoriken.' })
    }
})

adminRouter.put('/orders/:id/delivery', async (req: Request, res: Response) => {
    try {
        const orderId = Number(req.params.id)
        if (!Number.isInteger(orderId) || orderId <= 0) {
            res.status(400).json({ error: 'Ogiltigt order-ID.' })
            return
        }

        const [existing] = await db.query('SELECT id, status, sent_at FROM gift_orders WHERE id = ?', [orderId])
        if (!existing) {
            res.status(404).json({ error: 'Beställningen hittades inte.' })
            return
        }

        const { isSent } = req.body ?? {}
        const willBeSent = Boolean(isSent)

        if (willBeSent) {
            await db.query(`
                UPDATE gift_orders 
                SET status = 'completed', sent_at = NOW(), updated_at = NOW() 
                WHERE id = ?
            `, [orderId])
        } else {
            await db.query(`
                UPDATE gift_orders 
                SET status = 'pending', sent_at = NULL, updated_at = NOW() 
                WHERE id = ?
            `, [orderId])
        }

        const [updated] = await db.query('SELECT id, status, sent_at FROM gift_orders WHERE id = ?', [orderId])

        res.json({
            success: true,
            message: willBeSent
                ? 'Beställningen har markerats som skickad.'
                : 'Beställningen har återställts till bearbetning.',
            order: {
                id: orderId,
                orderNumber: String(orderId).padStart(4, '0'),
                status: updated.status,
                isSent: willBeSent,
                sentAt: updated.sent_at ? new Date(String(updated.sent_at)).toISOString() : null,
                formattedSentAt: updated.sent_at ? formatSwedishDate(updated.sent_at as Date | string) : null,
            },
        })
    } catch (error) {
        console.error('Failed to update delivery status:', error)
        res.status(500).json({ error: 'Kunde inte uppdatera leveransstatus.' })
    }
})

export default adminRouter