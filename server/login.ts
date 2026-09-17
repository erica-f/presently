import express, {type Request, type Response } from 'express';
// import { database } from './database';

let loginRouter = express.Router();

loginRouter.get("/", (_req: Request, res: Response) => {
    // let userEmail = req.body.userEmail;
    // let password = req.body.password;
    // const loginSQL = `SELECT users.id, email, users.password FROM users WHERE email = '${userEmail}'`

    // async function login() {
    //     try {
    //         const db = await database();
    //         let [userDetails] = await db.execute(loginSQL);
    //         let storedPassword = (userDetails as any)[0].password;
    //         if(storedPassword === password) {
    //             (req.session as any).userId = (userDetails as any)[0].id;
    //             res.json({"success": true})
    //         } else {
    //             res.json({"success": false})
    //         }
    //     } catch (error) {
    //         console.log("error:" + error)
    //         res.json("Unable to log you in")
    //     }
    // }
    // login()
    res.json("login page");
})

export default loginRouter;