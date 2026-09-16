import express from 'express';
import { db } from './db.js';

const app = express();

app.get("/api/", (_req, res) => {
    res.json({ "test": true });
});

app.get('/api/health', async (_req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ database: 'connected' });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(503).json({ database: 'unavailable' });
    }
});

app.get(/^(.*)$/, (_req, res) => {
    res.send("Hello from Vercel");
});

export default app;