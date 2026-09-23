import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let memberships = express.Router();

memberships.get("/", async (_req: Request, res: Response) => {
    try {
        let connect = await db.query(`SELECT * FROM membership_plans WHERE is_active = 1`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load membership plans. Try again',
        });
    }
})

export default memberships;