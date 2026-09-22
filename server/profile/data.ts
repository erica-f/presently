import { db } from '../db.js'
import { getMonthRange, summarizeMonthlyGifts } from './logic.js'

type Row = Record<string, unknown>
type TableName = 'users' | 'membership_plans' | 'subscriptions' | 'payments' | 'contacts' | 'gift_orders' | 'gift_order_items' | 'point_transactions'

const columnCache = new Map<TableName, Set<string>>()
const userKeys = ['user_id', 'customer_id', 'account_id', 'owner_id']

const asRows = (value: unknown): Row[] => Array.isArray(value) ? value.filter((row): row is Row => typeof row === 'object' && row !== null) : []
const first = (row: Row | undefined, names: string[], fallback: unknown = null) => {
    if (!row) return fallback
    const key = names.find((name) => row[name] !== undefined && row[name] !== null)
    return key ? row[key] : fallback
}
const numberValue = (value: unknown, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}
const quoteIdentifier = (value: string) => `\`${value.replace(/`/g, '')}\``

async function columns(table: TableName) {
    const cached = columnCache.get(table)
    if (cached) return cached
    const result = await db.query(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [table],
    )
    const names = new Set(asRows(result).map((row) => String(row.COLUMN_NAME)))
    columnCache.set(table, names)
    return names
}

function existingColumn(available: Set<string>, candidates: string[]) {
    return candidates.find((candidate) => available.has(candidate))
}

async function tableRows(table: TableName, where?: { column: string; value: unknown }, orderBy?: string) {
    const available = await columns(table)
    if (!available.size) return []
    const params: unknown[] = []
    let sql = `SELECT * FROM ${quoteIdentifier(table)}`
    if (where && available.has(where.column)) {
        sql += ` WHERE ${quoteIdentifier(where.column)} = ?`
        params.push(where.value)
    }
    if (orderBy && available.has(orderBy)) sql += ` ORDER BY ${quoteIdentifier(orderBy)} DESC`
    return asRows(await db.query(sql, params))
}

async function rowsForUser(table: TableName, userId: string | number) {
    const available = await columns(table)
    const ownerColumn = existingColumn(available, userKeys)
    return ownerColumn ? tableRows(table, { column: ownerColumn, value: userId }) : []
}

async function getMembership(userId: string | number) {
    const subscriptions = await rowsForUser('subscriptions', userId)
    const subscription = subscriptions[0]
    if (!subscription) return { subscription: null, plan: null }

    const planColumns = await columns('membership_plans')
    const planId = first(subscription, ['membership_plan_id', 'plan_id'])
    const planIdColumn = existingColumn(planColumns, ['id', 'membership_plan_id', 'plan_id'])
    const plans = planIdColumn && planId !== null
        ? await tableRows('membership_plans', { column: planIdColumn, value: planId })
        : []
    return { subscription, plan: plans[0] ?? null }
}

async function getUser(userId: string | number) {
    const available = await columns('users')
    const idColumn = existingColumn(available, ['id', 'user_id'])
    return idColumn ? (await tableRows('users', { column: idColumn, value: userId }))[0] ?? null : null
}

function normalizePlan(row: Row | null) {
    if (!row) return null
    return {
        id: first(row, ['id', 'membership_plan_id', 'plan_id']),
        name: first(row, ['name', 'plan_name', 'title'], 'Medlemskap'),
        level: first(row, ['level', 'tier', 'membership_level']),
        monthlyPoints: numberValue(first(row, ['monthly_points', 'points_per_month', 'points_allowance', 'points'])),
        maxSavedContacts: first(row, ['max_saved_contacts']) === null ? null : numberValue(first(row, ['max_saved_contacts'])),
    }
}

function normalizeUser(row: Row | null) {
    return {
        id: first(row ?? undefined, ['id', 'user_id']),
        firstName: first(row ?? undefined, ['first_name', 'firstname', 'given_name'], ''),
        lastName: first(row ?? undefined, ['last_name', 'lastname', 'family_name'], ''),
        email: first(row ?? undefined, ['email'], ''),
    }
}

function normalizeContact(row: Row) {
    return {
        id: first(row, ['id', 'contact_id']),
        firstName: first(row, ['first_name', 'firstname', 'given_name'], ''),
        lastName: first(row, ['last_name', 'lastname', 'family_name'], ''),
        email: first(row, ['email'], ''),
        phone: first(row, ['phone', 'phone_number'], ''),
        address: first(row, ['address', 'street_address'], ''),
        postalCode: first(row, ['postal_code', 'zip_code'], ''),
        city: first(row, ['city', 'town'], ''),
    }
}

async function pointBalance(userId: string | number) {
    const available = await columns('point_transactions')
    const ownerColumn = existingColumn(available, userKeys)
    const amountColumn = existingColumn(available, ['points', 'amount', 'point_amount', 'value'])
    if (!ownerColumn || !amountColumn) return 0
    const rows = await tableRows('point_transactions', { column: ownerColumn, value: userId })
    return rows.reduce((sum, row) => sum + numberValue(row[amountColumn]), 0)
}

async function gifts(userId: string | number) {
    const orders = await rowsForUser('gift_orders', userId)
    const orderIdColumn = existingColumn(await columns('gift_orders'), ['id', 'order_id'])
    const itemColumns = await columns('gift_order_items')
    const itemOrderColumn = existingColumn(itemColumns, ['gift_order_id', 'order_id'])
    const itemRows = orderIdColumn && itemOrderColumn
        ? (await Promise.all(orders.map((order) => tableRows('gift_order_items', { column: itemOrderColumn, value: order[orderIdColumn] })))).flat()
        : []
    const itemByOrder = new Map<string, Row[]>()
    for (const item of itemRows) {
        const key = String(first(item, [itemOrderColumn ?? 'order_id']))
        itemByOrder.set(key, [...(itemByOrder.get(key) ?? []), item])
    }
    return orders.map((order) => {
        const orderId = first(order, ['id', 'order_id'])
        const lines = itemByOrder.get(String(orderId)) ?? []
        return {
            id: orderId,
            date: first(order, ['created_at', 'order_date', 'sent_at', 'date']),
            recipient: first(order, ['recipient_name', 'recipient', 'shipping_name'], 'Mottagare'),
            status: first(order, ['status', 'order_status'], 'Skickad'),
            items: lines.map((item) => ({
                name: first(item, ['product_name', 'name', 'gift_name'], 'Gåva'),
                quantity: numberValue(first(item, ['quantity', 'qty'], 1), 1),
                points: numberValue(first(item, ['points', 'points_spent', 'unit_points', 'price_points'])),
            })),
        }
    })
}

export async function getProfile(userId: string | number) {
    const [user, membership, balance] = await Promise.all([getUser(userId), getMembership(userId), pointBalance(userId)])
    return {
        user: normalizeUser(user),
        subscription: membership.subscription,
        plan: normalizePlan(membership.plan),
        pointBalance: balance,
    }
}

export async function getProfileOverview(userId: string | number) {
    const month = getMonthRange(new Date())
    const allGifts = await gifts(userId)
    const monthlyGifts = allGifts.filter((gift) => {
        const date = gift.date ? new Date(String(gift.date)).getTime() : NaN
        return Number.isFinite(date) && date >= new Date(month.start.replace(' ', 'T') + 'Z').getTime() && date < new Date(month.end.replace(' ', 'T') + 'Z').getTime()
    })
    const lines = monthlyGifts.flatMap((gift) => gift.items)
    return { ...summarizeMonthlyGifts(lines), pointBalance: await pointBalance(userId) }
}

export async function getProfileGifts(userId: string | number) { return gifts(userId) }

export async function getProfileContacts(userId: string | number) {
    return (await rowsForUser('contacts', userId)).map(normalizeContact)
}

export async function getProfilePayments(userId: string | number) {
    const rows = await rowsForUser('payments', userId)
    return rows.map((row) => ({
        id: first(row, ['id', 'payment_id']),
        date: first(row, ['paid_at', 'created_at', 'payment_date', 'date']),
        amount: first(row, ['amount', 'total_amount', 'price']),
        currency: first(row, ['currency'], 'SEK'),
        status: first(row, ['status', 'payment_status'], 'Betald'),
        planName: first(row, ['plan_name', 'membership_name', 'product_name'], 'Medlemskap'),
    }))
}

export async function getContactLimit(userId: string | number) {
    const membership = await getMembership(userId)
    const plan = normalizePlan(membership.plan)
    return plan ? plan.maxSavedContacts : 0
}

export async function createContact(userId: string | number, input: Record<string, string>) {
    const available = await columns('contacts')
    const ownerColumn = existingColumn(available, userKeys)
    const idColumn = existingColumn(available, ['id', 'contact_id'])
    if (!ownerColumn || !idColumn) throw new Error('Contacts table is not configured for profile contacts')
    const fieldMap: Record<string, string[]> = {
        firstName: ['first_name', 'firstname', 'given_name'], lastName: ['last_name', 'lastname', 'family_name'],
        email: ['email'], phone: ['phone', 'phone_number'], address: ['address', 'street_address'],
        postalCode: ['postal_code', 'zip_code'], city: ['city', 'town'],
    }
    const fields = [ownerColumn]
    const values: unknown[] = [userId]
    for (const [key, candidates] of Object.entries(fieldMap)) {
        const field = existingColumn(available, candidates)
        if (field && input[key]?.trim()) { fields.push(field); values.push(input[key].trim()) }
    }
    if (fields.length < 2) throw new Error('A contact name is required')
    const placeholders = fields.map(() => '?').join(', ')
    await db.query(`INSERT INTO contacts (${fields.map(quoteIdentifier).join(', ')}) VALUES (${placeholders})`, values)
    const rows = await tableRows('contacts', { column: ownerColumn, value: userId })
    return normalizeContact(rows.at(-1) ?? {})
}

export async function updateContact(userId: string | number, contactId: string, input: Record<string, string>) {
    const available = await columns('contacts')
    const ownerColumn = existingColumn(available, userKeys)
    const idColumn = existingColumn(available, ['id', 'contact_id'])
    if (!ownerColumn || !idColumn) throw new Error('Contacts table is not configured for profile contacts')
    const fieldMap: Record<string, string[]> = {
        firstName: ['first_name', 'firstname', 'given_name'], lastName: ['last_name', 'lastname', 'family_name'],
        email: ['email'], phone: ['phone', 'phone_number'], address: ['address', 'street_address'],
        postalCode: ['postal_code', 'zip_code'], city: ['city', 'town'],
    }
    const changes: string[] = []
    const values: unknown[] = []
    for (const [key, candidates] of Object.entries(fieldMap)) {
        const field = existingColumn(available, candidates)
        if (field && input[key] !== undefined) { changes.push(`${quoteIdentifier(field)} = ?`); values.push(input[key].trim()) }
    }
    if (!changes.length) throw new Error('No contact fields to update')
    values.push(contactId, userId)
    const result = await db.query(`UPDATE contacts SET ${changes.join(', ')} WHERE ${quoteIdentifier(idColumn)} = ? AND ${quoteIdentifier(ownerColumn)} = ?`, values) as { affectedRows?: number }
    if (!result.affectedRows) return null
    const rows = await tableRows('contacts', { column: ownerColumn, value: userId })
    return normalizeContact(rows.find((row) => String(row[idColumn]) === String(contactId)) ?? {})
}

export async function deleteContact(userId: string | number, contactId: string) {
    const available = await columns('contacts')
    const ownerColumn = existingColumn(available, userKeys)
    const idColumn = existingColumn(available, ['id', 'contact_id'])
    if (!ownerColumn || !idColumn) throw new Error('Contacts table is not configured for profile contacts')
    const result = await db.query(`DELETE FROM contacts WHERE ${quoteIdentifier(idColumn)} = ? AND ${quoteIdentifier(ownerColumn)} = ?`, [contactId, userId]) as { affectedRows?: number }
    return Boolean(result.affectedRows)
}
