import express from 'express';
import { db } from './db.js';

const sessionRouter = express.Router();

sessionRouter.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ loggedIn: false, isAdmin: false, role: null });
    }

    let role: string;
    try {
        const [user] = await db.query('SELECT role FROM users WHERE id = ?', [req.session.userId]);
        role = user?.role ?? 'user';
        req.session.role = role;
    } catch (err) {
        console.error('Session role check failed:', err);
        role = req.session.role ?? 'user';
    }

    res.json({
        loggedIn: true,
        userId: req.session.userId,
        role,
        isAdmin: role === 'admin'
    });
});

export default sessionRouter;