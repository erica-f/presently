import express, { type Request, type Response } from 'express'
import { getPlans } from './membershipBilling.js'

const router = express.Router()

router.get('/', async (_req: Request, res: Response) => {
    try {
        res.json(await getPlans())
    } catch (error) {
        console.error('Unable to load public membership plans:', error)
        res.status(500).json({ error: 'Medlemskapen kunde inte laddas.' })
    }
})

export default router
