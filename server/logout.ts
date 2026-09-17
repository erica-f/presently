import express, {type Request, type Response } from 'express';

let logoutRouter = express.Router();

logoutRouter.get("/", (_req: Request, res: Response) => {
    // (req.session as any).userId = null;
    // (req.session as any).basketId = null;
    // res.json({"success": false});
    res.json("logout");
})

export default logoutRouter;