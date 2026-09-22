import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let memberships = express.Router();

memberships.get("/", async (_req: Request, res: Response) => {
    try {
        let connect = await db.query(`SELECT * FROM membership_plans`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.json("Unable to load products. Try again");
    }
})

export default memberships;