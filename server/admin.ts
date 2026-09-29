import express, { type Request, type Response, type RequestHandler } from 'express'
import { db } from './db.js'

const adminRouter = express.Router()

export const requireAdmin: RequestHandler = async (req, res, next) => {
    const userId = req.session.userId
    if (!userId) {
        res.status(401).json({ error: 'Inloggning krävs' })
        return
    }

    try {
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId])
        if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Åtkomst nekad. Endast administratörer har tillgång.' })
            return
        }
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
            userStatsRows,
            subsStatsRows,
            planRows,
            orderStatsRows,
            productStatsRows,
            catStatsRows,
            recentOrderRows,
            recentProductRows,
        ] = await Promise.all([
            db.query(`
                SELECT 
                    COUNT(*) AS total_users,
                    COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) AS active_users
                FROM users
            `),
            db.query(`
                SELECT
                    COUNT(*) AS total_active_subscriptions,
                    COALESCE(SUM(CASE WHEN mp.level = 1 THEN 1 ELSE 0 END), 0) AS simple_count,
                    COALESCE(SUM(CASE WHEN mp.level = 2 THEN 1 ELSE 0 END), 0) AS plus_count,
                    COALESCE(SUM(CASE WHEN mp.level = 3 THEN 1 ELSE 0 END), 0) AS signature_count
                FROM subscriptions s
                JOIN membership_plans mp ON mp.id = s.membership_plan_id
                WHERE s.status = 'active'
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
                    COUNT(*) AS total_orders,
                    COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_orders,
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_orders
                FROM gift_orders
            `),
            db.query(`
                SELECT
                    COUNT(*) AS total_products,
                    COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) AS active_products,
                    COALESCE(SUM(CASE WHEN is_active = 1 AND minimum_membership_plan_level = 1 THEN 1 ELSE 0 END), 0) AS level_1_products,
                    COALESCE(SUM(CASE WHEN is_active = 1 AND minimum_membership_plan_level IN (2, 3) THEN 1 ELSE 0 END), 0) AS premium_products
                FROM products
            `),
            db.query(`SELECT COUNT(*) AS category_count FROM categories`),
            db.query(`
                SELECT
                    o.id,
                    o.recipient_name,
                    o.recipient_city,
                    o.status,
                    o.total_points,
                    o.created_at,
                    COALESCE(mp.name, 'Simple') AS membership_level
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
                    c.label AS category_label
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                ORDER BY COALESCE(p.updated_at, p.created_at) DESC, p.id DESC
                LIMIT 6
            `),
        ])

        const userStats = userStatsRows[0] ?? {}
        const subsStats = subsStatsRows[0] ?? {}
        const orderStats = orderStatsRows[0] ?? {}
        const productStats = productStatsRows[0] ?? {}
        const catStats = catStatsRows[0] ?? {}
        const totalUsers = Number(userStats.total_users ?? 0)
        const activeUsers = Number(userStats.active_users ?? 0)
        const activeMemberships = Number(subsStats.total_active_subscriptions ?? 0)
        const simpleMemberships = Number(subsStats.simple_count ?? 0)
        const plusMemberships = Number(subsStats.plus_count ?? 0)
        const signatureMemberships = Number(subsStats.signature_count ?? 0)
        const totalOrders = Number(orderStats.total_orders ?? 0)
        const pendingOrders = Number(orderStats.pending_orders ?? 0)
        const completedOrders = Number(orderStats.completed_orders ?? 0)
        const totalProducts = Number(productStats.total_products ?? 0)
        const activeProducts = Number(productStats.active_products ?? 0)
        const level1Products = Number(productStats.level_1_products ?? 0)
        const premiumProducts = Number(productStats.premium_products ?? 0)
        const categoriesCount = Number(catStats.category_count ?? 0)
        const tierColorMap: Record<number, 'sage' | 'primary' | 'gold'> = { 1: 'sage', 2: 'primary', 3: 'gold', }
        const tierDescMap: Record<number, string> = { 1: 'Tillgång till basutbudet bland gåvosortimentet.', 2: 'Utökat gåvosortiment och fler månatliga poäng.', 3: 'Exklusiva gåvor och ännu fler förmåner.'}

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

        const orderIds = (recentOrderRows as Record<string, unknown>[]).map((o) => Number(o.id)).filter(Boolean)
        const itemsByOrderId = new Map<number, string[]>()

        if (orderIds.length > 0) {
            const itemRows = await db.query(
                `SELECT gift_order_id, product_name_snapshot, quantity
                 FROM gift_order_items
                 WHERE gift_order_id IN (${orderIds.map(() => '?').join(',')})
                 ORDER BY id ASC`,
                orderIds,
            )

            for (const item of itemRows as Record<string, unknown>[]) {
                const oid = Number(item.gift_order_id)
                const name = String(item.product_name_snapshot ?? 'Gåva')
                const qty = Number(item.quantity ?? 1)
                const itemLabel = qty > 1 ? `${name} (${qty} st)` : name
                const list = itemsByOrderId.get(oid) ?? []
                list.push(itemLabel)
                itemsByOrderId.set(oid, list)
            }
        }

        const recentActivity = (recentOrderRows as Record<string, unknown>[]).map((order) => {
            const oid = Number(order.id)
            const items = itemsByOrderId.get(oid) ?? []
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
            const tier: 'Signature' | 'Plus' | 'Simple' = level === 3 ? 'Signature' : level === 2 ? 'Plus' : 'Simple'
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

export default adminRouter