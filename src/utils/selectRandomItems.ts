export const selectRandomItems = <T,>(items: T[], count = 3): T[] =>
    [...items].sort(() => Math.random() - 0.5).slice(0, count)
