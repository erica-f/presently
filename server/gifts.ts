import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let gifts = express.Router();

gifts.get("/", async (_req: Request, res: Response) => {
    try {
        let connect = await db.query(`SELECT * FROM products AND is_active = 1`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load products. Try again',
        });
    }
})

export default gifts;