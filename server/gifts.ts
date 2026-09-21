import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let gifts = express.Router();

gifts.get("/", async (_req: Request, res: Response) => {
    try {
        let [connect] = await db.query(`SELECT * FROM products`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.json("Unable to find load products. Try again");
    }
})

export default gifts;