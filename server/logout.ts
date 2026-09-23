import express, {type Request, type Response } from 'express';

const logoutRouter = express.Router();

logoutRouter.post("/", (_req: Request, res: Response) => {
    // (req.session as any).userId = null;
    res.json({"success": false});
})

export default logoutRouter;