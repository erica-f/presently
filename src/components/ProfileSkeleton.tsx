const shimmer = 'motion-safe:animate-pulse rounded-control bg-border/60'

export function ProfileSkeleton({ section }: { section?: string }) {
    const titleWidth = section === 'account' ? 'w-24' : section === 'gifts' ? 'w-36' : section === 'contacts' ? 'w-44' : section === 'receipts' ? 'w-24' : 'w-32'

    return <main aria-busy="true" className="mx-auto w-[calc(100%-2rem)] max-w-6xl flex-1 sm:w-[calc(100%-3rem)]" role="status">
        <span className="sr-only">Laddar profilen…</span>
        <header className="flex flex-col justify-between gap-5 border-b border-border py-10 md:flex-row md:items-end md:py-14">
            <div className={`${shimmer} h-9 ${titleWidth}`} />
            <div className={`${shimmer} h-4 w-28`} />
        </header>
        <nav aria-hidden="true" className="flex gap-5 overflow-hidden border-b border-border py-4">
            {['w-16', 'w-28', 'w-32', 'w-16', 'w-12'].map((width, index) => <div className={`${shimmer} h-7 shrink-0 ${width}`} key={`${width}-${index}`} />)}
        </nav>
        {section === 'account' ? <>
            <div className="grid items-start gap-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="space-y-5 border-t border-border py-8"><div className={`${shimmer} h-6 w-40`} /><div className={`${shimmer} h-12 w-full`} /><div className={`${shimmer} h-12 w-3/4`} /></div>
                <div className={`${shimmer} min-h-64 w-full`} />
            </div>
            <div className="border-t border-border py-8"><div className={`${shimmer} mb-5 h-6 w-56`} /><div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div className={`${shimmer} h-44`} key={item} />)}</div></div>
        </> : <>
            <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-3">{[1, 2, 3].map((item) => <div className={`${shimmer} h-28`} key={item} />)}</div>
            <div className="space-y-4 border-t border-border py-8"><div className={`${shimmer} h-6 w-40`} />{[1, 2].map((item) => <div className={`${shimmer} h-16 w-full`} key={item} />)}</div>
        </>}
    </main>
}
