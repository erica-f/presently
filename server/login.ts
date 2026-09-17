import express, { type Request, type Response } from 'express';
import { db } from './db.ts';

let loginRouter = express.Router();

loginRouter.post("/", async (req: Request, res: Response) => {
    let userEmail = req.body.userEmail;
    let password = req.body.password;
    try {
        let [connect] = await db.query(`SELECT users.id, email, users.password FROM users WHERE email = ${userEmail}`);
        let storedPassword = (connect as any)[0].password;
        console.log(connect);
        if (storedPassword === password) {
            // (req.session as any).userId = (connect as any)[0].id;
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