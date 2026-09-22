type GiftLine = { quantity?: number | null; points?: number | null }

export type ContactInput = {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    postalCode?: string
    city?: string
}

export function validateContactInput(input: ContactInput, options: { requireName?: boolean } = {}) {
    const errors: Record<string, string> = {}
    const firstName = input.firstName?.trim() ?? ''
    const lastName = input.lastName?.trim() ?? ''
    const email = input.email?.trim() ?? ''
    const phone = input.phone?.trim() ?? ''

    if (options.requireName !== false && !firstName) errors.firstName = 'Förnamn krävs.'
    else if (firstName.length > 80) errors.firstName = 'Förnamn får vara högst 80 tecken.'
    if (options.requireName !== false && !lastName) errors.lastName = 'Efternamn krävs.'
    else if (lastName.length > 80) errors.lastName = 'Efternamn får vara högst 80 tecken.'
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160)) errors.email = 'Ange en giltig e-postadress.'
    if (phone && !/^[+0-9 ()-]{7,30}$/.test(phone)) errors.phone = 'Ange ett giltigt telefonnummer.'
    for (const [field, value] of Object.entries(input)) {
        if (typeof value === 'string' && value.length > 160 && !errors[field]) errors[field] = 'Fältet får vara högst 160 tecken.'
    }
    return errors
}

export function getMonthRange(date: Date, timeZone = 'Europe/Stockholm') {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
    }).formatToParts(date)
    const year = parts.find((part) => part.type === 'year')?.value ?? String(date.getUTCFullYear())
    const month = parts.find((part) => part.type === 'month')?.value ?? String(date.getUTCMonth() + 1).padStart(2, '0')
    const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1
    const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year)

    return {
        start: `${year}-${month}-01 00:00:00`,
        end: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`,
    }
}

export function summarizeMonthlyGifts(lines: GiftLine[]) {
    return lines.reduce(
        (summary, line) => {
            const quantity = Number(line.quantity ?? 1)
            const points = Number(line.points ?? 0)
            summary.giftsSent += Number.isFinite(quantity) && quantity > 0 ? quantity : 0
            summary.pointsSpent += Number.isFinite(points) ? points * (quantity > 0 ? quantity : 0) : 0
            return summary
        },
        { giftsSent: 0, pointsSpent: 0 },
    )
}

export function canAddContact(currentCount: number, maxSavedContacts: number | null) {
    return maxSavedContacts === null || currentCount < maxSavedContacts
}
