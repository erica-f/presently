import express, { type Request, type Response } from 'express';
import { db } from './db.js';

const loginRouter = express.Router();

loginRouter.post("/", async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.session);
    try {
        const [user] = await db.query(`SELECT id, email, password_hash FROM users WHERE email = '${email}'`);
        if (user.password_hash === password) {
            req.session.userId = user.id;
            res.json({ "success": true })
        } else {
            res.json({ "success": false })
        }
    } catch (error) {
        console.log('Login failed:', error);
        res.status(500).json({ success: false, message: "Kunde inte logga in" });
    }
})

export default loginRouter;