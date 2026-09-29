import express, { type Request } from 'express'
import type { PoolConnection } from 'mariadb'
import { db } from './db.js'
import { authenticated } from './middleware/authenticated.js'

type CartDetails = {
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
type MessageDetails = {
    type: string
    message: string
    signed: string
}
export type Contact = { firstName: string; lastName: string; email: string; phone: string; address: string; postalCode: string; city: string }

type BodyDetails = {
    cart: CartDetails[]
    message: MessageDetails
    delivery: Contact
    pointCostSum: number
}

const order = express.Router()
order.use(authenticated)

order.post('/', async (req: Request<{}, unknown, BodyDetails>, res) => {
    const { delivery, message, cart, pointCostSum } = req.body

    if (cart.length <= 0) {
        res.status(400).json({ message: 'Inga gåvor i varukorgen' })
        return
    }
    //expand on this logic later
    if (delivery.firstName == '') {
        res.status(400).json({ message: 'Ingen mottagare är angiven' })
        return
    }
     if (pointCostSum <= 0) {
        res.status(400).json({ message: 'Ingen poängkostnad angiven' })
        return
    }

    let connection: PoolConnection | undefined

    try {
        connection = await db.getConnection()
        await connection.beginTransaction()
        cart
        const createNewOrder = await connection.query(`INSERT INTO gift_orders(user_id, recipient_name, recipient_address_line_1, recipient_postal_code, recipient_city, total_points, paper_type, message, signed) VALUES(? , ? , ? , ? , ?, ? , ? , ? , ? )`, [res.locals.userId, delivery.firstName + ' ' + delivery.lastName, delivery.address, delivery.postalCode, delivery.city, pointCostSum, message.type, message.message, message.signed])
        const newOrderId = createNewOrder.insertId;
        for (const item of cart) {
            await connection.query('INSERT INTO gift_order_items(gift_order_id, product_id, product_name_snapshot, unit_point_cost, quantity, line_point_total) VALUES(?, ?, ?, ?, ?, ?)', [newOrderId, item.product_id, item.name, item.point_cost, item.quantity, item.point_total]);
        }

        await connection.query('INSERT INTO point_transactions (user_id, gift_order_id, transaction_type, points) VALUES(?,?,?,?)', [res.locals.userId, newOrderId, 'gift_purchase', -pointCostSum]);

        await connection.query(`DELETE FROM carts WHERE user_id = ? `, [res.locals.userId]);
        await connection.commit();

        res.status(201).json({ success: true, delivery, message, cart, pointCostSum })

    } catch (error) {
        if (connection) await connection.rollback().catch(() => undefined)
        console.error('Unable to create order:', error)
        res.status(500).json({ message: 'Beställningen kunde inte slutföras.' })
    } finally {
        connection?.release()
    }
})

export default order
