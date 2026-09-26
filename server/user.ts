import express from 'express';
import { db } from './db.js';

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    try {
        const connect = await db.query(`SELECT first_name, last_name FROM users WHERE id = ${req.session.userId}`);
        res.json(connect);
    } catch (error) {
        console.log("error:" + error);
        res.status(500).json({
            message: 'Unable to get user details Try again',
        });
    }
})

export default userRouter;