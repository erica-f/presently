import express from 'express'
import type { PoolConnection } from 'mariadb'
import { db } from './db.js'
import { authenticated } from './middleware/authenticated.js'

const cart = express.Router()
const rows = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object')) : []
const numberValue = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0

cart.use(authenticated)

async function getOrCreateCart(connection: PoolConnection, userId: string | number) {
    await connection.query(
        `INSERT INTO carts (user_id) VALUES (?)
         ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
        [userId],
    )

    const result = rows(await connection.query('SELECT id FROM carts WHERE user_id = ? LIMIT 1 FOR UPDATE', [userId]))
    return result[0]?.id
}

cart.get('/', async (_req, res) => {
    try {
        const cartRows = rows(await db.query('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [res.locals.userId]))
        const cartId = cartRows[0]?.id

        if (cartId === undefined) {
            res.json({ items: [], itemCount: 0, pointTotal: 0 })
            return
        }

        const items = rows(await db.query(
            `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.point_cost, p.thumbnail_image_url, ci.quantity * p.point_cost AS point_total, p.description, p.category_id, p.minimum_membership_plan_level AS level
             FROM cart_items ci
             INNER JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = ?
             ORDER BY ci.created_at ASC`,
            [cartId],
        ))

        const itemCount = items.reduce((total, item) => total + numberValue(item.quantity), 0)
        const pointTotal = items.reduce((total, item) => total + numberValue(item.point_total), 0)

        res.json({ items, itemCount, pointTotal })
    } catch (error) {
        console.error('Unable to fetch cart:', error)
        res.status(500).json({ message: 'Kundvagnen kunde inte hämtas.' })
    }
})

cart.post('/', async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
    const productId = Number(body.productId)
    const quantity = body.quantity === undefined ? 1 : Number(body.quantity)

    if (!Number.isInteger(productId) || productId <= 0) {
        res.status(400).json({ message: 'Produkten är ogiltig.' })
        return
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        res.status(400).json({ message: 'Antalet måste vara mellan 1 och 99.' })
        return
    }

    let connection: PoolConnection | undefined

    try {
        connection = await db.getConnection()
        await connection.beginTransaction()

        const product = rows(await connection.query(
            `SELECT id, point_cost, minimum_membership_plan_level
             FROM products
             WHERE id = ? AND is_active = 1
             LIMIT 1`,
            [productId],
        ))[0]

        if (!product) {
            await connection.rollback()
            res.status(404).json({ message: 'Produkten kunde inte hittas.' })
            return
        }

        const subscription = rows(await connection.query(
            `SELECT mp.level
             FROM subscriptions s
             INNER JOIN membership_plans mp ON mp.id = s.membership_plan_id
             WHERE s.user_id = ? AND s.status = 'active' AND mp.is_active = 1
             LIMIT 1`,
            [res.locals.userId],
        ))[0]

        if (numberValue(subscription?.level) < numberValue(product.minimum_membership_plan_level)) {
            await connection.rollback()
            res.status(403).json({ message: 'Din medlemsnivå ger inte tillgång till den här produkten.' })
            return
        }

        const balanceRow = rows(await connection.query('SELECT COALESCE(SUM(points), 0) AS point_balance FROM point_transactions WHERE user_id = ?', [res.locals.userId]))[0]
        const pointBalance = numberValue(balanceRow?.point_balance)
        const cartId = await getOrCreateCart(connection, res.locals.userId)
        if (cartId === undefined) throw new Error('Cart could not be created')

        const totals = rows(await connection.query(
            `SELECT COALESCE(SUM(ci.quantity * p.point_cost), 0) AS point_total
             FROM cart_items ci
             INNER JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = ?`,
            [cartId],
        ))[0]

        const currentPointTotal = numberValue(totals?.point_total)
        const nextPointTotal = currentPointTotal + numberValue(product.point_cost) * quantity

        if (nextPointTotal > pointBalance) {
            await connection.rollback()
            res.status(409).json({ message: `Du saknar ${nextPointTotal - pointBalance} poäng för att lägga till gåvan.` })
            return
        }

        const existingItem = rows(await connection.query(
            'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1 FOR UPDATE',
            [cartId, productId],
        ))[0]

        const nextQuantity = numberValue(existingItem?.quantity) + quantity

        if (nextQuantity > 99) {
            await connection.rollback()
            res.status(400).json({ message: 'Du kan ha högst 99 av samma produkt i kundvagnen.' })
            return
        }

        await connection.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP`,
            [cartId, productId, quantity],
        )

        await connection.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cartId])
        await connection.commit()

        res.status(201).json({ success: true, productId, quantity: nextQuantity, pointTotal: nextPointTotal })
    } catch (error) {
        if (connection) await connection.rollback().catch(() => undefined)
        console.error('Unable to update cart:', error)
        res.status(500).json({ message: 'Gåvan kunde inte läggas i kundvagnen.' })
    } finally {
        connection?.release()
    }
})

cart.delete('/', async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
    const productId = Number(body.productId)
    const quantity = Number(body.quantity ?? 0)

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
        res.status(400).json({ message: 'Produkt eller antal är ogiltigt.' })
        return
    }

    try {
        const cartRows = rows(await db.query('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [res.locals.userId]))
        const cartId = cartRows[0]?.id
        if (cartId === undefined) {
            res.status(404).json({ message: 'Kundvagnen kunde inte hittas.' })
            return
        }

        const result = quantity === 0
            ? await db.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]) as { affectedRows?: number }
            : await db.query('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ?', [quantity, cartId, productId]) as { affectedRows?: number }

        if (result.affectedRows !== 1) {
            res.status(404).json({ message: 'Produkten finns inte i kundvagnen.' })
            return
        }

        await db.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cartId])
        res.json({ success: true, productId, quantity })
    } catch (error) {
        console.error('Unable to update cart:', error)
        res.status(500).json({ message: 'Kundvagnen kunde inte uppdateras.' })
    }
})

export default cart
