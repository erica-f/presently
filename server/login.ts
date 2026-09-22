import express, { type Request, type Response } from 'express';
import { db } from './db.js';

let loginRouter = express.Router();

loginRouter.post("/", async (req: Request, res: Response) => {
    let email = req.body.email;
    let password = req.body.password;
    try {
        let [connect] = await db.query(`SELECT id, email, password_hash FROM users WHERE email = '${email}'`);
        if (connect.password_hash === password) {
            (req.session as any).userId = (connect as any).id;
            res.json({ "success": true })
        } else {
            res.json({ "success": false })
        }
    } catch (error) {
        console.log("error:" + error)
        res.json("Unable to log you in")
    }
})

export default loginRouter;