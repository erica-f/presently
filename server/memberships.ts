import express from 'express';
import { db } from './db.js';

const memberships = express.Router();

memberships.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const connect = await db.query(`SELECT * FROM membership_plans WHERE is_active = 1`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load membership plans. Try again',
        });
    }
})

export default memberships;