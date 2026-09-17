import { getNavigationLinks } from '../config/siteNavigation'

const footerLinks = getNavigationLinks('footer')

export function SiteFooter() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-9">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <a className="inline-flex w-fit items-center" href="/" aria-label="Presently - till startsidan">
                            <img className="block h-10 w-auto" src="/presently-logo.svg" alt="Presently" />
                        </a>
                        <p className="mt-3 text-sm text-muted-foreground">Gör det enkelt att visa omtanke, lite oftare.</p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 md:gap-x-8" aria-label="Sidfotsmeny">
                        {footerLinks.map((item) => <a className="text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary" href={item.path} key={item.path}>{item.label}</a>)}
                    </nav>
                </div>
                <div className="mt-11 flex items-center justify-between gap-6 border-t border-border pt-5 text-sm text-muted-foreground">
                    <span>&copy; {new Date().getFullYear()} Presently. All rights reserved.</span>
                </div>
            </div>
        </footer>
    )
}
