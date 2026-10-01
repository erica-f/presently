import express from 'express';
import { db } from './db.js';

const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(email.length < 4) {
         res.status(400).json({message: 'Kunde inte logga in, ingen giltlig e-postadress angiven.' })
        return
    }
     if(password.length < 5) {
         res.status(400).json({message: 'Kunde inte logga in, inget giltligt lösenord angiven.' })
        return
    }
    try {
        const [user] = await db.query(`SELECT id, email, password_hash, role FROM users WHERE email = ? AND is_active = 1`, [email]);
        if (user && user.password_hash === password) {
            req.session.userId = user.id;
            req.session.role = user.role ?? 'user';
            res.json({ "success": true, "role": user.role ?? 'user' })
        } else {
            res.json({ "success": false })
        }
    } catch (error) {
        console.log('Login failed:', error);
        res.status(500).json({ success: false, message: "Kunde inte logga in" });
    }
})

export default loginRouter;