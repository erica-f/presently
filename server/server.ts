import express, { type Request, type Response } from 'express';

import loginRouter from './login.js';
import logoutRouter from './logout.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);

app.get("/api/", (_req: Request, res: Response) => {
    res.json({ "test": true });
});

app.get(/^(.*)$/, (_req: Request, res: Response) => {
    res.send("Hello from Vercel");
});

export default app;