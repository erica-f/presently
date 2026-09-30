import express from 'express'
import { db } from './db.js'

const registerRouter = express.Router()

function normalizeEmail(value: string) { return value.trim().toLowerCase() }

function validate(input: Record<string, unknown>) {
    const fields: Record<string, string> = {}
    const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : ''
    const lastName = typeof input.lastName === 'string' ? input.lastName.trim() : ''
    const email = typeof input.email === 'string' ? normalizeEmail(input.email) : ''
    const password = typeof input.password === 'string' ? input.password : ''
    const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : ''
    if (!firstName) fields.firstName = 'Förnamn krävs.'
    if (!lastName) fields.lastName = 'Efternamn krävs.'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) fields.email = 'Ange en giltig e-postadress.'
    if (password.length < 8 || password.length > 128) fields.password = 'Lösenordet måste vara minst 8 tecken.'
    if (password !== confirmPassword) fields.confirmPassword = 'Lösenorden matchar inte.'
    return fields
}

function saveSession(req: express.Request) {
    return new Promise<void>((resolve, reject) => {
        req.session.save((error) => error ? reject(error) : resolve())
    })
}

registerRouter.post('/', async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
    const input = {
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
        firstName: body.firstName,
        lastName: body.lastName,
    }
    const fields = validate(input)
    if (Object.keys(fields).length) {
        res.status(400).json({ error: 'Kontrollera dina uppgifter.', fields })
        return
    }

    const email = normalizeEmail(String(input.email))
    const firstName = String(input.firstName).trim()
    const lastName = String(input.lastName).trim()
    const passwordHash = String(input.password)
    const connection = await db.getConnection()
    try {
        await connection.beginTransaction()
        const existing = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1 FOR UPDATE', [email]) as Array<{ id: number }>
        if (existing.length) {
            await connection.rollback()
            res.status(409).json({ error: 'Det finns redan ett konto med den e-postadressen.' })
            return
        }
        const result = await connection.query('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)', [email, passwordHash, firstName, lastName]) as { insertId?: number }
        await connection.commit()
        req.session.userId = result.insertId
        req.session.loggedIn = true
        await saveSession(req)
        res.status(201).json({ success: true, user: { id: result.insertId, email, firstName, lastName, role: 'user' }, membership: null })
    } catch (error) {
        await connection.rollback()
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Det finns redan ett konto med den e-postadressen.' })
            return
        }
        console.error('Registration failed:', error)
        res.status(500).json({ error: 'Kontot kunde inte skapas just nu.' })
    } finally {
        connection.release()
    }
})

export default registerRouter
