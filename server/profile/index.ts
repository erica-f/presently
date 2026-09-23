import express, { type NextFunction, type Request, type Response } from 'express'
import {
    createContact, deleteContact, getContactLimit, getProfile, getProfileContacts,
    getProfileGifts, getProfileOverview, getProfilePayments, updateContact,
} from './data.js'
import { canAddContact, normalizePhone, validateContactInput } from './logic.js'

type SessionWithUser = { userId?: unknown }

const profileRouter = express.Router()

function authenticated(req: Request, res: Response, next: NextFunction) {
    const userId = (req.session as unknown as SessionWithUser).userId
    if (typeof userId !== 'string' && typeof userId !== 'number') {
        res.status(401).json({ error: 'Authentication required' })
        return
    }
    res.locals.profileUserId = userId
    next()
}

function userId(res: Response) { return res.locals.profileUserId as string | number }

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
