import type { PoolConnection } from 'mariadb'
import { db } from './db.js'

type Row = Record<string, unknown>
type UserId = string | number
type BillingPeriod = { start: Date; end: Date }

const rows = (value: unknown): Row[] => Array.isArray(value) ? value.filter((row): row is Row => Boolean(row && typeof row === 'object')) : []
const first = (row: Row | undefined, names: string[], fallback: unknown = null) => {
    if (!row) return fallback
    const key = names.find((name) => row[name] !== undefined && row[name] !== null)
    return key ? row[key] : fallback
}
const numberValue = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
const iso = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ')
const dateOnly = (date: Date) => iso(date).slice(0, 10)
const monthAfter = (date: Date) => { const next = new Date(date); next.setUTCMonth(next.getUTCMonth() + 1); return next }

function planFromRow(row: Row) {
    return {
        id: first(row, ['id']),
        name: String(first(row, ['name'], 'Medlemskap')),
        level: numberValue(first(row, ['level'])),
        monthlyPrice: numberValue(first(row, ['price'])),
        monthlyPoints: numberValue(first(row, ['monthly_points'])),
        maxSavedContacts: first(row, ['max_saved_contacts']) === null ? null : numberValue(first(row, ['max_saved_contacts'])),
        benefits: [],
    }
}

export async function getPlans() {
    const result = await db.query('SELECT id, name, level, monthly_points, max_saved_contacts, price FROM membership_plans WHERE is_active = 1 ORDER BY level ASC')
    return rows(result).map(planFromRow)
}

export async function getPlanByRoute(routePlan: number) {
    const plans = await getPlans()
    return plans[routePlan - 1] ?? null
}

async function subscriptionForUser(userId: UserId, connection: PoolConnection | typeof db = db) {
    const result = await connection.query('SELECT * FROM subscriptions WHERE user_id = ? LIMIT 1', [userId])
    const row = rows(result)[0] ?? null
    return { row, id: row ? first(row, ['id']) : null }
}

function periodFromSubscription(row: Row | null): BillingPeriod {
    const startValue = first(row ?? undefined, ['current_period_start', 'created_at'])
    const endValue = first(row ?? undefined, ['current_period_end'])
    const start = startValue ? new Date(String(startValue)) : new Date()
    const end = endValue ? new Date(String(endValue)) : monthAfter(start)
    return { start: Number.isNaN(start.getTime()) ? new Date() : start, end: Number.isNaN(end.getTime()) ? monthAfter(start) : end }
}

async function updatePayment(connection: PoolConnection, paymentId: unknown, status: 'completed' | 'failed') {
    await connection.query('UPDATE payments SET status = ?, paid_at = CASE WHEN ? = \'completed\' THEN CURRENT_TIMESTAMP ELSE paid_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, status, paymentId])
}

async function paymentForCheckout(connection: PoolConnection, userId: UserId, plan: ReturnType<typeof planFromRow>, paymentType: 'new_membership' | 'plan_change') {
    const result = await connection.query('SELECT * FROM payments WHERE user_id = ? AND membership_plan_id = ? AND payment_type = ? AND status IN (\'pending\', \'failed\') ORDER BY id DESC LIMIT 1 FOR UPDATE', [userId, plan.id, paymentType])
    return rows(result)[0] ?? null
}

async function createPendingPayment(connection: PoolConnection, userId: UserId, plan: ReturnType<typeof planFromRow>, paymentType: 'new_membership' | 'plan_change') {
    const existing = await paymentForCheckout(connection, userId, plan, paymentType)
    if (existing) return existing
    const receiptNumber = `P-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const result = await connection.query(`INSERT INTO payments (user_id, membership_plan_id, receipt_number, payment_type, status, plan_name_snapshot, plan_level_snapshot, monthly_points_snapshot, amount, currency, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'SEK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [userId, plan.id, receiptNumber, paymentType, plan.name, plan.level, plan.monthlyPoints, plan.monthlyPrice]) as { insertId?: unknown }
    return { id: result.insertId, status: 'pending' }
}

async function allocateInitialPoints(connection: PoolConnection, userId: UserId, subscriptionId: unknown, plan: ReturnType<typeof planFromRow>, period: BillingPeriod) {
    const existing = rows(await connection.query('SELECT id FROM point_transactions WHERE user_id = ? AND transaction_type = \'monthly_grant\' AND grant_period = ? LIMIT 1 FOR UPDATE', [userId, dateOnly(period.start)]))[0]
    if (existing) return false
    await connection.query(`INSERT INTO point_transactions (user_id, transaction_type, points, grant_period, description, created_at) VALUES (?, 'monthly_grant', ?, ?, ?, CURRENT_TIMESTAMP)`, [userId, plan.monthlyPoints, dateOnly(period.start), `Första medlemsperioden: ${plan.name}`])
    return Boolean(subscriptionId)
}

export async function checkout(userId: UserId, plan: ReturnType<typeof planFromRow>, cardLast4?: string) {
    const connection = await db.getConnection()
    try {
        await connection.beginTransaction()
        await connection.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId])
        const subscription = await subscriptionForUser(userId, connection)
        const currentPlanId = first(subscription.row ?? undefined, ['membership_plan_id'])
        const currentPlanRow = currentPlanId === null ? null : rows(await connection.query('SELECT id, name, level, monthly_points, max_saved_contacts, price FROM membership_plans WHERE id = ? LIMIT 1', [currentPlanId]))[0] ?? null
        const currentPlan = currentPlanRow ? planFromRow(currentPlanRow) : null
        const paymentType = currentPlan ? 'plan_change' : 'new_membership'
        if (currentPlan && String(currentPlan.id) === String(plan.id)) {
            const completedPayment = rows(await connection.query('SELECT id FROM payments WHERE user_id = ? AND membership_plan_id = ? AND payment_type = ? AND status = \'completed\' ORDER BY id DESC LIMIT 1', [userId, plan.id, paymentType]))[0]
            if (completedPayment) { await connection.commit(); return { success: true, paymentStatus: 'completed', subscriptionId: subscription.id, plan, paymentId: completedPayment.id } }
        }
        const payment = await createPendingPayment(connection, userId, plan, paymentType)
        if (cardLast4 === '0000') { await updatePayment(connection, payment.id, 'failed'); await connection.commit(); return { success: false, paymentStatus: 'failed' } }
        await updatePayment(connection, payment.id, 'completed')
        const period = subscription.row ? periodFromSubscription(subscription.row) : { start: new Date(), end: monthAfter(new Date()) }
        if (subscription.id) {
            await connection.query('UPDATE subscriptions SET membership_plan_id = ?, status = \'active\', updated_at = CURRENT_TIMESTAMP WHERE id = ?', [plan.id, subscription.id])
        } else {
            const result = await connection.query('INSERT INTO subscriptions (user_id, membership_plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES (?, ?, \'active\', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [userId, plan.id, dateOnly(period.start), dateOnly(period.end)]) as { insertId?: unknown }
            subscription.id = result.insertId
        }
        if (!currentPlan) await allocateInitialPoints(connection, userId, subscription.id, plan, period)
        await connection.commit()
        return { success: true, paymentStatus: 'completed', subscriptionId: subscription.id, plan, paymentId: payment.id }
    } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}

export async function getBillingOverview(userId: UserId) {
    const subscription = await subscriptionForUser(userId)
    const planId = first(subscription.row ?? undefined, ['membership_plan_id'])
    const planRow = planId === null ? null : rows(await db.query('SELECT id, name, level, monthly_points, max_saved_contacts, price FROM membership_plans WHERE id = ? LIMIT 1', [planId]))[0] ?? null
    const plan = planRow ? planFromRow(planRow) : null
    const payments = rows(await db.query('SELECT id, membership_plan_id, receipt_number, payment_type, status, plan_name_snapshot, plan_level_snapshot, monthly_points_snapshot, amount, currency, paid_at, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]))
    const pointRows = rows(await db.query('SELECT points FROM point_transactions WHERE user_id = ?', [userId]))
    const pointBalance = pointRows.reduce((sum, row) => sum + numberValue(row.points), 0)
    const nextPeriod = subscription.row ? periodFromSubscription(subscription.row) : null
    return { subscription: subscription.row, plan, pointBalance, nextAllocationDate: nextPeriod?.end ?? null, nextPaymentDate: null, nextPaymentAmount: null, payments }
}

export async function getPaymentConfirmation(userId: UserId, paymentId: string | number) {
    const payment = rows(await db.query('SELECT id, user_id, membership_plan_id, receipt_number, payment_type, status, plan_name_snapshot, plan_level_snapshot, monthly_points_snapshot, amount, currency, paid_at, created_at FROM payments WHERE id = ? AND user_id = ? LIMIT 1', [paymentId, userId]))[0]
    if (!payment) return null
    const subscription = await subscriptionForUser(userId)
    const subscriptionPlanId = first(subscription.row ?? undefined, ['membership_plan_id'])
    const planId = first(payment, ['membership_plan_id'], subscriptionPlanId)
    const planRow = rows(await db.query('SELECT id, name, level, monthly_points, max_saved_contacts, price FROM membership_plans WHERE id = ? LIMIT 1', [planId]))[0] ?? null
    const plan = planRow ? planFromRow(planRow) : null
    const periodStart = first(subscription.row ?? undefined, ['current_period_start'])
    const pointRows = payment.status === 'completed' && payment.payment_type === 'new_membership' && periodStart
        ? rows(await db.query('SELECT points FROM point_transactions WHERE user_id = ? AND transaction_type = \'monthly_grant\' AND grant_period = DATE(?)', [userId, periodStart]))
        : []
    const balanceRows = rows(await db.query('SELECT points FROM point_transactions WHERE user_id = ?', [userId]))
    return {
        payment,
        plan,
        pointsCredited: pointRows.reduce((sum, row) => sum + numberValue(row.points), 0),
        pointBalance: balanceRows.reduce((sum, row) => sum + numberValue(row.points), 0),
        nextBillingDate: first(subscription.row ?? undefined, ['current_period_end']),
    }
}
