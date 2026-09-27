import express from 'express';
import { db } from './db.js';

const cart = express.Router();

cart.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const getCart = await db.query(`SELECT * FROM carts WHERE user_id = ${req.session.userId}`);
        if (getCart.length > 0) {
            const cartId = getCart[0].id;
            const getItems = await db.query(`SELECT * FROM cart_items WHERE cart_id = ${cartId}`);
            res.json(getItems);
        } else {
            res.json("No cart exists");
        }
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to fetch cart',
        });
    }
});

cart.post("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    try {
        const getCart = await db.query(`SELECT * FROM carts WHERE user_id = ${req.session.userId}`);
        if (getCart.length > 0) {
            const cartId = getCart[0].id;
            const getItems = await db.query(`SELECT * FROM cart_items WHERE cart_id = ${cartId} AND product_id = ${productId}`);
            if (getItems.length > 0) {
                const currentAmount = getItems[0].quantity;
                const cartItemId = getItems[0].id;
                const updateAmount = await db.query(`UPDATE cart_items SET quantity = ${currentAmount + quantity} WHERE id = ${cartItemId}`);
                if (updateAmount.affectedRows == 1) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            } else {
                const createNewItem = await db.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (${cartId}, ${productId}, ${quantity})`);
                if (createNewItem.affectedRows == 1) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            }
        } else {
            const createCart = await db.query(`INSERT INTO carts (user_id) VALUES (${req.session.userId})`)
            const createNewItem = await db.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (${createCart.insertId}, ${productId}, ${quantity})`);
            if (createNewItem.affectedRows == 1) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        }
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to update cart',
        });
    }
})

cart.delete("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    try {
        const getCart = await db.query(`SELECT * FROM carts WHERE user_id = ${req.session.userId}`);
        if (getCart.length > 0) {
            const cartId = getCart[0].id;
            if (quantity <= 0) {
                const removeItem = await db.query(`DELETE FROM cart_items WHERE cart_id = ${cartId} AND product_id = ${productId}`);
                if (removeItem.affectedRows == 1) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            } else {
                const updateAmount = await db.query(`UPDATE cart_items SET quantity = ${quantity} WHERE cart_id = ${cartId} AND product_id = ${productId}`);
                if (updateAmount.affectedRows == 1) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }
            }
        } else {
            res.json("No cart exists");
        }
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to fetch cart',
        });
    }
});

export default cart;