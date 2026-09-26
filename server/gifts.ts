import express from 'express';
import { db } from './db.js';

const gifts = express.Router();

gifts.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
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

export default gifts;