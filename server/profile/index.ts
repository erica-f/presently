import express, { type Response } from 'express'
import {
    changePassword, createContact, deleteContact, getContactLimit, getProfile, getProfileContacts,
    getMembershipOptions, getProfileGifts, getProfileOverview, getProfilePayments, updateContact,
} from './data.js'
import { canAddContact, normalizePhone, validateContactInput } from './logic.js'
import { authenticated } from '../middleware/authenticated.js'

const profileRouter = express.Router()

function userId(res: Response) { return res.locals.userId }

function cleanContactInput(body: unknown): Record<string, string> {
    if (!body || typeof body !== 'object') return {}
    const input = body as Record<string, unknown>
    const cleaned = Object.fromEntries(Object.entries(input).filter(([, value]) => typeof value === 'string')) as Record<string, string>
    if (cleaned.phone !== undefined) cleaned.phone = normalizePhone(cleaned.phone)
    return cleaned
}

async function handle(res: Response, action: () => Promise<unknown>, failureMessage = 'Profiluppgifterna kunde inte laddas just nu.') {
    try {
        res.json(await action())
    } catch (error) {
        console.error('Profile request failed:', error)
        res.status(500).json({ error: failureMessage })
    }
}

profileRouter.use(authenticated)

profileRouter.get('/', (_req, res) => handle(res, () => getProfile(userId(res))))
profileRouter.get('/overview', (_req, res) => handle(res, () => getProfileOverview(userId(res))))
profileRouter.get('/gifts', (_req, res) => handle(res, () => getProfileGifts(userId(res))))
profileRouter.get('/contacts', (_req, res) => handle(res, () => getProfileContacts(userId(res))))
profileRouter.get('/payments', (_req, res) => handle(res, () => getProfilePayments(userId(res))))
profileRouter.get('/membership', (_req, res) => handle(res, () => getMembershipOptions(userId(res))))

profileRouter.post('/password', async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown } : {}
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : ''
    if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ error: 'Fyll i alla lösenordsfält.' })
        return
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
        res.status(400).json({ error: 'Det nya lösenordet måste vara mellan 8 och 128 tecken.' })
        return
    }
    if (newPassword !== confirmPassword) {
        res.status(400).json({ error: 'De nya lösenorden matchar inte.' })
        return
    }
    if (currentPassword === newPassword) {
        res.status(400).json({ error: 'Det nya lösenordet måste skilja sig från det nuvarande.' })
        return
    }
    await handle(res, async () => {
        const changed = await changePassword(userId(res), currentPassword, newPassword)
        if (!changed) { res.status(400); return { error: 'Det nuvarande lösenordet är fel.' } }
        return { success: true }
    }, 'Lösenordet kunde inte uppdateras.')
})

profileRouter.post('/membership/checkout', async (req, res) => {
    const planId = req.body && typeof req.body === 'object' ? (req.body as { planId?: unknown }).planId : undefined
    if (planId === undefined || planId === null || String(planId).trim() === '') {
        res.status(400).json({ error: 'Välj ett medlemskap innan du fortsätter.' })
        return
    }
    await handle(res, async () => {
        const { plans } = await getMembershipOptions(userId(res))
        if (!plans.some((plan) => String(plan.id) === String(planId))) {
            res.status(400)
            return { error: 'Medlemskapet är inte tillgängligt.' }
        }
        res.status(501)
        return { error: 'Betalningshantering är inte tillgänglig ännu.' }
    }, 'Betalningshantering kunde inte startas.')
})

profileRouter.post('/membership/cancel', async (req, res) => {
    const confirmed = req.body && typeof req.body === 'object' ? (req.body as { confirmed?: unknown }).confirmed : false
    if (confirmed !== true) {
        res.status(400).json({ error: 'Bekräfta uppsägningen innan du fortsätter.' })
        return
    }
    await handle(res, async () => {
        const { current } = await getMembershipOptions(userId(res))
        if (!current) {
            res.status(409)
            return { error: 'Det finns inget aktivt medlemskap att säga upp.' }
        }
        res.status(501)
        return { error: 'Uppsägning av medlemskap är inte tillgänglig ännu.' }
    }, 'Medlemskapet kunde inte sägas upp.')
})

profileRouter.post('/contacts', async (req, res) => {
    const input = cleanContactInput(req.body)
    const validationErrors = validateContactInput(input)
    if (Object.keys(validationErrors).length) {
        res.status(400).json({ error: 'Kontrollera kontaktuppgifterna.', fields: validationErrors })
        return
    }
    await handle(res, async () => {
        const current = await getProfileContacts(userId(res))
        const limit = await getContactLimit(userId(res))
        if (!canAddContact(current.length, limit)) {
            res.status(409)
            return { error: 'Ditt medlemskap har nått gränsen för sparade kontakter' }
        }
        return createContact(userId(res), input)
    }, 'Kontakten kunde inte sparas just nu.')
})

profileRouter.patch('/contacts/:id', async (req, res) => {
    const input = cleanContactInput(req.body)
    const validationErrors = validateContactInput(input, { requireName: false })
    if (!Object.keys(input).length) {
        res.status(400).json({ error: 'Ingen ändring angavs' })
        return
    }
    if (Object.keys(validationErrors).length) {
        res.status(400).json({ error: 'Kontrollera kontaktuppgifterna.', fields: validationErrors })
        return
    }
    await handle(res, async () => {
        const contact = await updateContact(userId(res), req.params.id, input)
        if (!contact) { res.status(404); return { error: 'Kontakten hittades inte' } }
        return contact
    }, 'Kontakten kunde inte sparas just nu.')
})

profileRouter.delete('/contacts/:id', async (req, res) => {
    await handle(res, async () => {
        const deleted = await deleteContact(userId(res), req.params.id)
        if (!deleted) { res.status(404); return { error: 'Kontakten hittades inte' } }
        return { success: true }
    }, 'Kontakten kunde inte tas bort just nu.')
})

export default profileRouter
