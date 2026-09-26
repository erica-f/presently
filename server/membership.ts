import express from 'express'
import { checkout, getBillingOverview, getPaymentConfirmation, getPlanByRoute, getPlans, MembershipCheckoutError } from './membershipBilling.js'
import { authenticated } from './middleware/authenticated.js'

const router = express.Router()

router.use(authenticated)
router.get('/plans', async (_req, res) => { try { res.json(await getPlans()) } catch { res.status(500).json({ error: 'Medlemskapen kunde inte laddas.' }) } })
router.get('/checkout/:plan', async (req, res) => {
    const planNumber = Number(req.params.plan); const plan = Number.isInteger(planNumber) ? await getPlanByRoute(planNumber) : null
    if (!plan) { res.status(404).json({ error: 'Medlemskapet kunde inte hittas.' }); return }
    try { res.json({ plan, billing: await getBillingOverview(res.locals.userId) }) } catch { res.status(500).json({ error: 'Checkout kunde inte laddas.' }) }
})
router.post('/checkout/:plan', async (req, res) => {
    const planNumber = Number(req.params.plan); const plan = Number.isInteger(planNumber) ? await getPlanByRoute(planNumber) : null
    if (!plan) { res.status(400).json({ error: 'Ogiltigt medlemskap.' }); return }
    const cardLast4 = typeof req.body?.cardLast4 === 'string' ? req.body.cardLast4.slice(-4) : undefined
    try { res.json(await checkout(res.locals.userId, plan, cardLast4)) } catch (error) { if (error instanceof MembershipCheckoutError) { res.status(error.statusCode).json({ error: error.message }); return } console.error('Membership checkout failed:', error); res.status(500).json({ error: 'Betalningen kunde inte slutföras.' }) }
})
router.get('/overview', async (_req, res) => { try { res.json(await getBillingOverview(res.locals.userId)) } catch { res.status(500).json({ error: 'Medlemskapet kunde inte laddas.' }) } })
router.get('/receipts', async (_req, res) => { try { res.json((await getBillingOverview(res.locals.userId)).payments) } catch { res.status(500).json({ error: 'Kvittona kunde inte laddas.' }) } })
router.get('/confirmation/:paymentId', async (req, res) => {
    if (!/^\d+$/.test(req.params.paymentId)) { res.status(404).json({ error: 'Betalningen hittades inte.' }); return }
    try {
        const confirmation = await getPaymentConfirmation(res.locals.userId, req.params.paymentId)
        if (!confirmation) { res.status(404).json({ error: 'Betalningen hittades inte.' }); return }
        res.json(confirmation)
    } catch { res.status(500).json({ error: 'Betalningsbekräftelsen kunde inte laddas.' }) }
})

export default router
