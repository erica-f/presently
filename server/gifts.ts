import express, { type Request, type Response } from 'express';
import { db } from './db.js';

const gifts = express.Router();

gifts.get("/", async (_req: Request, res: Response) => {
    try {
        const connect = await db.query(`SELECT * FROM products WHERE is_active = 1`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load products. Try again',
        });
    }
})

gifts.get("/:id", async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
        res.status(400).json({ message: 'Product id must be a positive integer.' });
        return;
    }

    try {
        const products = await db.query(`SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1`, [productId]);
        const product = products[0];

        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }

        res.json(product);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({ message: 'Unable to load product. Try again' });
    }
})

export default gifts;