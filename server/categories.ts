import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let categories = express.Router();

categories.get("/", async (_req: Request, res: Response) => {
    try {
        let connect = await db.query(`SELECT * FROM categories`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load categories. Try again',
        });
    }
})

export default categories;