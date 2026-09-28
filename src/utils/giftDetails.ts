export const toAssetUrl = (imageUrl: string) => {
    if (/^(?:[a-z]+:)?\/\//i.test(imageUrl) || imageUrl.startsWith('/') || imageUrl.startsWith('data:')) return imageUrl
    return `/${imageUrl}`
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