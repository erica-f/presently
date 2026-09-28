
const CheckoutGifts = () => {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* <!-- Huvudrubrik --> */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a3b2b] tracking-tight mb-2">
          Granska och bekräfta
        </h1>
        <p className="text-sm sm:text-base text-[#68736c]">
          Kontrollera att alla uppgifter stämmer innan vi skickar din gåva till ateljén för paketering.
        </p>
      </div>

      {/* <!-- Huvudinnehåll Layout --> */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* <!-- Vänster kolumn: Gåvosummering & Mottagarinformation (7 cols) --> */}
        <div className="lg:col-span-7 space-y-6">

          {/* <!-- Kort 1: Vald Gåva & Personifiering --> */}
          <section className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0eae0]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#b89047]" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.118-.99A1.002 1.002 0 009 6zm2-1a1 1 0 101.118-.99A1.002 1.002 0 0011 5v1z" clip-rule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
                Gåva och utförande
              </h2>
              <a href="#" className="text-xs font-semibold text-[#244d36] hover:underline">Ändra</a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9GZbVeH2sfL726qtbtz0VUsffXmUiH7Hl40nuo2MVMdDMTL_lok58lLBYsW_7FlY0HjQA1tavXy-5e11RrK2uqw_PkH6wnz5_brizuRI7DQiS4r8wN2wquX7EGNt5H9iOrzFm-lVqyMz6y8BltydqPunbs37fdizHRilhl-4FWEX_PMl57aymsq24vN7v5b1NsWFEICmc0ShzkKzHtt7kJB8P-p0NCnVol3C9i0miBVGQoQIvfaoW" alt="Graverat guldhalsband" className="w-24 h-24 rounded-xl object-cover border border-[#e6ded3] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f5eee1] text-[#b89047]">Signature</span>
                  <span className="text-xs font-bold text-[#1a3b2b]">500 poäng</span>
                </div>
                <h3 className="text-lg font-serif text-[#1a3b2b]">Graverat guldhalsband</h3>
                <p className="text-xs text-[#68736c]">
                  Runt hänge i 18k guldpläterat sterlingsilver (45 cm kedja). Levereras i sammetsfodrad Presently-ask.
                </p>
              </div>
            </div>

            {/* <!-- Personifieringsdetaljer (Gravyr) --> */}
            <div className="mt-4 pt-4 border-t border-[#f4efe6] grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fdfbf7] p-3.5 rounded-xl border border-[#ede5d8]">
              <div>
                <span className="block text-[11px] font-medium text-[#68736c] uppercase tracking-wider">Gravyr rad 1</span>
                <p className="font-serif font-semibold text-sm text-[#1a3b2b] mt-0.5">E + S</p>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-[#68736c] uppercase tracking-wider">Gravyr rad 2 (datum)</span>
                <p className="font-mono text-sm text-[#1a3b2b] mt-0.5">24.08.2023</p>
              </div>
            </div>
          </section>

          {/* <!-- Kort 2: Mottagare och leveransadress --> */}
          <section className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0eae0]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#244d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mottagare & leveransadress
              </h2>
              <a href="#" className="text-xs font-semibold text-[#244d36] hover:underline">Ändra</a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#68736c] mb-1">Mottagare</p>
                <p className="text-sm font-semibold text-[#1a3b2b]">Elin Sundström</p>
                <p className="text-xs text-[#68736c] mt-0.5">Sparad kontakt (Presently Signature)</p>
              </div>
              <div>
                <p className="text-xs text-[#68736c] mb-1">Leveransadress</p>
                <p className="text-sm font-medium text-[#1a3b2b] leading-snug">
                  Storgatan 14B, lgh 1201<br />
                  411 24 Göteborg<br />
                  <span className="text-xs text-[#68736c]">Sverige</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f4efe6] flex items-center gap-2 text-xs text-[#2f5e43]">
              <svg className="w-4 h-4 text-[#244d36] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Skickas med spårbar PostNord-frakt direkt till mottagarens brevlåda.</span>
            </div>
          </section>

          {/* <!-- Kort 3: Personlig hälsning (Granskning) --> */}
          <section className="p-6 rounded-2xl bg-white border border-[#e6ded3] shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0eae0]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244d36] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#244d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Tryckt hälsningskort i paketet
              </h2>
              <a href="#" className="text-xs font-semibold text-[#244d36] hover:underline">Redigera kort</a>
            </div>

            <div className="p-5 rounded-xl bg-[#fdfbf7] border border-[#e6ded3] relative">
              <div className="text-center mb-2">
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#b89047]">Design: Skogsgrön elegans</span>
              </div>
              <p className="font-serif italic text-sm text-[#1a3b2b] leading-relaxed text-center px-4">
                ”Tack för att du alltid sprider så mycket värme och glädje omkring dig, Elin. Hoppas detta lilla smycke påminner dig om hur mycket du betyder!”
              </p>
              <div className="mt-3 text-right pr-4">
                <span className="font-serif text-xs text-[#244d36] font-semibold">— Sofia</span>
              </div>
            </div>
          </section>

        </div>

        {/* <!-- Höger kolumn: Poängavdrag, Saldo & Slutgiltig handling (5 cols) --> */}
        <div className="lg:col-span-5 space-y-6">

          {/* <!-- Poängsammanställning & Saldokalkyl --> */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#244d36]/20 shadow-sm">

            <div className="flex items-center justify-between pb-4 border-b border-[#e6ded3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a3b2b]">Poängberäkning</span>
              <span className="text-[11px] font-semibold text-[#244d36] bg-[#effcf9] px-2.5 py-1 rounded-full border border-[#cde8e1]">
                Medlemskap: Signature
              </span>
            </div>

            {/* <!-- Saldotabell --> */}
            <div className="py-5 space-y-3.5">
              {/* <!-- Saldo före --> */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#68736c]">Saldo före sändning</span>
                <span className="font-semibold text-[#1a3b2b] font-mono text-base">720 p</span>
              </div>

              {/* <!-- Gåva kostnad --> */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1a3b2b] font-medium">Graverat guldhalsband</span>
                  <span className="text-[11px] text-[#68736c]">(Gåva)</span>
                </div>
                <span className="font-semibold text-[#9e3a2b] font-mono text-base">-500 p</span>
              </div>

              {/* <!-- Inkluderade tillval --> */}
              <div className="flex items-center justify-between text-xs text-[#68736c] pl-2 border-l-2 border-[#b89047]/40 py-0.5">
                <span>Personlig gravyr & hälsningskort</span>
                <span className="text-[#244d36] font-medium">0 p (Ingår)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#68736c] pl-2 border-l-2 border-[#b89047]/40 py-0.5">
                <span>Spårbar frakt & gåvoask</span>
                <span className="text-[#244d36] font-medium">0 p (Ingår)</span>
              </div>

              {/* <!-- Skiljelinje --> */}
              <div className="pt-2 border-t border-[#e6ded3]"></div>

              {/* <!-- Återstående saldo efteråt --> */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="block text-sm font-bold text-[#1a3b2b]">Saldo efter sändning</span>
                  <span className="text-[11px] text-[#68736c]">Dina sparade poäng förfaller aldrig</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#244d36]">220 p</span>
                </div>
              </div>
            </div>

            {/* <!-- Viktigt meddelande om poänginlösen --> */}
            <div className="p-3.5 rounded-xl bg-[#f4efe6] border border-[#e6ded3] text-xs text-[#68736c] mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#b89047] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Detta är en poänginlösen. Inga betalkort eller extra avgifter debiteras. Gåvan graveras och paketeras omsorgsfullt så fort du bekräftar.</span>
              </div>
            </div>

            {/* <!-- Primär och Sekundär CTA --> */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-4 px-6 rounded-xl bg-[#244d36] hover:bg-[#1a3b2b] active:scale-[0.99] text-white font-semibold text-base shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Skicka gåvan</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl border border-[#d6cbbe] hover:bg-[#f4efe6] text-[#1a3b2b] text-sm font-medium transition text-center"
              >
                Tillbaka och ändra
              </button>
            </div>

          </div>

          {/* {/* <!-- Trygghet och säkerhet --> */}
          <div className="p-5 rounded-2xl bg-white border border-[#e6ded3] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1a3b2b]">
              <svg className="w-4 h-4 text-[#244d36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Presently Trygghet & Diskretion</span>
            </div>
            <p className="text-xs text-[#68736c] leading-relaxed">
              Inga fakturor eller priser syns någonsin för mottagaren. Du får en bekräftelse och spårningslänk direkt när paketet lämnar Stockholmsateljén.
            </p>
          </div>

        </div>

      </div>

    </main>
  )
}

export default CheckoutGifts
