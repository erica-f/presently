import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { db } from './db.js';
import loginRouter from './login.js';
import logoutRouter from './logout.js';
import gifts from './gifts.ts';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/gifts", gifts);

app.get('/api/health', async (_req: Request, res: Response) => {
    try {
        await db.query('SELECT 1');
        res.json({ database: 'connected' });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(503).json({ database: 'unavailable' });
    }
});

app.get("/api/", (_req: Request, res: Response) => {
    res.json({ "test": true });
});

app.get(/^(.*)$/, (_req: Request, res: Response) => {
    res.send("Hello from Vercel");
});

export default app;