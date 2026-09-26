import { type RequestHandler } from 'express'

declare global {
    // Express exposes application-specific locals through this open namespace.
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Locals {
            userId: string | number
        }
    }
}

export const authenticated: RequestHandler = (req, res, next) => {
    const userId = req.session.userId
    if (typeof userId !== 'string' && typeof userId !== 'number') {
        res.status(401).json({ error: 'Authentication required' })
        return
    }
    res.locals.userId = userId
    next()
}
