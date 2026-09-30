export const toAssetUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string' || !url.trim()) return ''
    const trimmed = url.trim()
    if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
        return trimmed
    }
    return `/${trimmed}`
}

export const shuffled = <T,>(items: T[]) => {
    const result = [...items]

    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const current = result[index]
        result[index] = result[randomIndex]
        result[randomIndex] = current
    }

    return result
}