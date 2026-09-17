import express, {type Request, type Response } from 'express';

let logoutRouter = express.Router();

logoutRouter.get("/", (_req: Request, res: Response) => {
    // (req.session as any).userId = null;
    res.json({"success": false});
})

export default logoutRouter;