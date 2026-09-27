import express from 'express';
import { db } from './db.js';

const categories = express.Router();

categories.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const connect = await db.query(`SELECT * FROM categories`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to load categories. Try again',
        });
    }
})

export default categories;