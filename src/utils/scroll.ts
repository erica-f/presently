import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function ScrollToHash() {
    const { hash, pathname } = useLocation()

    useEffect(() => {
        if (!hash) return
        const frame = window.requestAnimationFrame(() => {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
        })
        return () => window.cancelAnimationFrame(frame)
    }, [hash, pathname])

    return null
}