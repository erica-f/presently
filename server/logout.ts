import express, { type Request, type Response } from 'express';
import { authenticated } from './middleware/authenticated.js' 
const logoutRouter = express.Router();

logoutRouter.use(authenticated);

logoutRouter.post("/", (req: Request, res: Response) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ message: false });
        }
        res.json({ message: true });
    });
});

export default logoutRouter;