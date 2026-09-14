import express from 'express';

const app = express();

app.get("/api/", (_req, res) => {
    res.json({"test": true});
});

app.get(/^(.*)$/, (_req, res) => {
    res.send("Hello from Vercel");
});

export default app;