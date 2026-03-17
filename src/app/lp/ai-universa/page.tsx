"use client";

import { useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { Sparkles, Calendar, Clock } from 'lucide-react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function AIUniversaLP() {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');
    const fbclid = params.get('fbclid');
    const gclid = params.get('gclid');

    if (utmSource) {
      localStorage.setItem('utm_source', utmSource);
      localStorage.setItem('utm_medium', utmMedium || '');
      localStorage.setItem('utm_campaign', utmCampaign || '');

      // Send to GA4 as custom event
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'utm_capture', {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        });
      }
    }

    // Set Typeform hidden fields from URL params
    const tfEmbed = document.querySelector('[data-tf-live]');
    if (tfEmbed) {
      const hiddenValues = [
        utmSource ? `utm_source=${utmSource}` : '',
        utmMedium ? `utm_medium=${utmMedium}` : '',
        utmCampaign ? `utm_campaign=${utmCampaign}` : '',
        utmContent ? `utm_content=${utmContent}` : '',
        utmTerm ? `utm_term=${utmTerm}` : '',
        fbclid ? `fbclid=${fbclid}` : '',
        gclid ? `gclid=${gclid}` : '',
      ].filter(Boolean).join(',');
      if (hiddenValues) {
        tfEmbed.setAttribute('data-tf-hidden', hiddenValues);
      }
    }
  }, []);

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-W98GT5HVJ6" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W98GT5HVJ6');
        `}
      </Script>
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#b388ff] selection:text-white pb-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center overflow-hidden bg-black pt-8">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)] opacity-30 z-0"></div>

        <div className="relative w-full max-w-6xl mx-auto flex justify-center z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-black via-black/90 to-transparent z-10"></div>
          
          <img 
            src="https://assets.cdn.filesafe.space/TGsyH70nsz7y3hijuqTn/media/69b18f38cab7f7cc28461378.jpeg" 
            alt="AI Workflow" 
            className="w-full h-auto object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 flex flex-col items-center -mt-32 md:-mt-56 px-4 text-center w-full max-w-5xl mx-auto pb-20">
          <div className="flex items-center gap-1 mb-6">
            <div className="flex items-center">
              <Sparkles className="text-[#b388ff] w-6 h-6 -mr-1 z-10" fill="currentColor" />
              <span className="text-white font-black italic text-3xl tracking-tighter">AI</span>
            </div>
            <div className="flex flex-col items-start leading-none mt-1">
              <span className="text-white font-bold italic text-[10px] tracking-widest">UNIVERSA</span>
              <span className="text-white font-bold italic text-[10px] tracking-widest">DELAVNICA</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-gray-700 rounded-full px-4 py-1.5 bg-black/50 backdrop-blur-md mb-8">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <span className="text-xs font-bold tracking-widest text-gray-200">LIVE VIRTUAL EVENT: 15.4. - 17.4.2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-[1.1] tracking-tight mb-6">
            3 Dni do <span className="text-[#b388ff]">Kopiranja Mojega AI Sistema</span> in <span className="text-[#b388ff]">Začetka Služenja na Spletu</span> v 2026
          </h1>

          <p className="text-gray-400 max-w-2xl text-sm md:text-base mb-10 leading-relaxed">
            Glejte mi pod prste, ko vam pokažem natančen sistem, ki je ustvaril izjemne rezultate za tiste, ki so ga uporabili zadnjič. Pridružite se AI Universa in se potegujte za nov AVTO!
          </p>

          <button onClick={scrollToForm} className="bg-[#6bfb82] text-black font-extrabold text-lg md:text-xl px-12 py-4 rounded-full border-[6px] border-[#1a3822] shadow-[0_0_30px_rgba(107,251,130,0.15)] hover:scale-105 hover:shadow-[0_0_40px_rgba(107,251,130,0.3)] transition-all duration-300">
            ŽELIM BREZPLAČNO VSTOPNICO
          </button>

          <div className="flex items-center gap-8 mt-6 text-[11px] text-gray-500 font-medium tracking-wide uppercase">
            <span>Brez kazanja obraza</span>
            <span>Predznanje ni potrebno</span>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#4c1d95]/20 blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 bg-zinc-950/80 border border-zinc-800/50 rounded-[2.5rem] p-6 md:p-12 backdrop-blur-md shadow-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#b388ff]"></span>
              <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">3 Epizode</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight uppercase">VSE, KAR SE BOSTE NAUČILI<br/>V TEH 3 DNEH</h2>
            <p className="text-gray-400 text-sm md:text-base">Podroben pregled 3-dnevne delavnice v živo</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Day 1 */}
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 border-4 border-transparent hover:border-[#b388ff]/30">
              <div className="bg-black text-white text-center py-3 font-black text-xl tracking-widest border-b-4 border-[#b388ff]">
                DAN 01
              </div>
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-4 bg-gray-100 px-3 py-1.5 rounded-full">
                  <span className="flex items-center gap-1"><Calendar size={14} /> 15. APRIL</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> 19:00</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2e1065] mb-4 leading-tight">AI Influencer Workflows</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
                  Spoznajte celotne procese in video tečaje za ustvarjanje in vodenje AI vplivnežev. Naučite se zgraditi občinstvo in monetizirati pozornost, medtem ko ostanete popolnoma anonimni.
                </p>
              </div>
            </div>

            {/* Day 2 */}
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 border-4 border-transparent hover:border-[#b388ff]/30">
              <div className="bg-black text-white text-center py-3 font-black text-xl tracking-widest border-b-4 border-[#b388ff]">
                DAN 02
              </div>
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-4 bg-gray-100 px-3 py-1.5 rounded-full">
                  <span className="flex items-center gap-1"><Calendar size={14} /> 16. APRIL</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> 19:00</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2e1065] mb-4 leading-tight">AI Agency Workflows</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
                  Zgradite donosno AI agencijo s preizkušenimi sistemi in video tečaji. Pokazali vam bomo, kako avtomatizirati procese in pridobivati stranke na avtopilotu.
                </p>
              </div>
            </div>

            {/* Day 3 */}
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 border-4 border-[#b388ff]/50 shadow-[0_0_30px_rgba(179,136,255,0.2)]">
              <div className="bg-black text-white text-center py-3 font-black text-xl tracking-widest border-b-4 border-[#b388ff]">
                DAN 03
              </div>
              <div className="p-6 md:p-8 flex flex-col items-center text-center bg-gradient-to-b from-white to-[#f3e8ff]">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-4 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <span className="flex items-center gap-1"><Calendar size={14} /> 17. APRIL</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> 19:00</span>
                </div>
                <h3 className="text-2xl font-bold text-[#2e1065] mb-2 leading-tight">AI Agents Workflows <span className="text-red-500">V ŽIVO!</span></h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-2xl mb-4">
                  Ekskluziven dostop do AI Agentov (Clawbot Wrapper), ki avtomatizirajo vašo vsebino in pridobivanje strank. V živo bomo zgradili sistem korak za korakom.
                </p>
                <div className="inline-block bg-[#2e1065] text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                  + Žrebanje za nov AVTO!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Freedoms Section */}
      <section className="py-24 px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Po letih izkušenj in vrhunskih rezultatih,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">razkrivam enega največjih trendov v spletnem svetu.</span>
          </h2>
          <p className="text-gray-400 mb-16">In kako ga lahko izkoristite s pomočjo umetne inteligence.</p>

          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="bg-[#050505] border border-zinc-800/80 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-[#4c1d95]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="font-bold text-xl md:text-2xl text-gray-200 mb-3 relative z-10">Dodaten zaslužek</h3>
              <p className="text-sm text-gray-500 relative z-10">Brez da bi pustili to, kar trenutno počnete.</p>
            </div>
            <div className="bg-[#050505] border border-zinc-800/80 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-[#4c1d95]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="font-bold text-xl md:text-2xl text-gray-200 mb-3 relative z-10">Geografska svoboda</h3>
              <p className="text-sm text-gray-500 relative z-10">Delajte od koderkoli na svetu želite.</p>
            </div>
            <div className="bg-[#050505] border border-zinc-800/80 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-[#4c1d95]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="font-bold text-xl md:text-2xl text-gray-200 mb-3 relative z-10">Časovna svoboda</h3>
              <p className="text-sm text-gray-500 relative z-10">Delajte takrat, ko želite in s komer želite.</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center">
            <p className="text-xl font-bold mb-8">Ujeti morate ta AI trend zdaj, preden bo prepozno.</p>
            <button onClick={scrollToForm} className="bg-[#6bfb82] text-black font-extrabold text-lg md:text-xl px-12 py-4 rounded-full border-[6px] border-[#1a3822] shadow-[0_0_30px_rgba(107,251,130,0.15)] hover:scale-105 transition-transform w-full md:w-auto">
              ŽELIM BREZPLAČNO VSTOPNICO
            </button>
          </div>
        </div>
      </section>

      {/* Upgraded Method Purple Card */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#2e1065] to-[#09090b] border border-[#4c1d95]/50 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(76,29,149,0.2)]">
          {/* Top Banner */}
          <div className="bg-[#d8b4fe] text-[#2e1065] p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
              Izjemni rezultati tistih, ki so sistem implementirali po zadnjem dogodku.
            </h3>
            <p className="text-[#4c1d95] text-sm md:text-base font-medium max-w-2xl mx-auto">
              Prvič sem gostil spletni dogodek, kot je ta, in ljudje so ustvarili neverjetne rezultate v manj kot 90 dneh.
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
              Za AI Universa delavnico smo metodo še nadgradili:
            </h2>

            <ul className="space-y-8 mb-12 max-w-3xl mx-auto">
              {[
                "Najhitrejši način za začetek služenja na spletu v 2026, brez zapravljanja za oglase ali grajenja lastnega produkta.",
                "Kako umetna inteligenca opravi 90% težkega dela namesto vas (tudi če nimate tehničnega znanja ali izkušenj).",
                "Skriti razlog, zakaj se večina ljudi, ki vas uči služenja na spletu, verjetno moti.",
                "Preizkušen sistem za generiranje konsistentne prodaje brez zapravljanja denarja za plačljiv promet.",
                "Bližnjica do občinstva, ki vam omogoča dostop do tisočih kupcev čez noč, brez večletnega grajenja lastne publike."
              ].map((text, i) => (
                <li key={i} className="flex gap-6 items-start bg-black/20 p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b388ff] to-[#7c3aed] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(179,136,255,0.5)]">
                    <div className="w-4 h-4 rounded-full bg-black"></div>
                  </div>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ul>

            <div className="flex justify-center mt-16">
              <button onClick={scrollToForm} className="bg-[#6bfb82] text-black font-extrabold text-lg md:text-xl px-12 py-4 rounded-full border-[6px] border-[#1a3822] shadow-[0_0_30px_rgba(107,251,130,0.15)] hover:scale-105 transition-transform w-full md:w-auto">
                ŽELIM BREZPLAČNO VSTOPNICO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24">Zakaj bi mi prisluhnili</h2>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-zinc-800"></div>
            
            {/* Timeline Item 1 */}
            <div className="relative flex flex-col md:flex-row items-start justify-between mb-24 group">
              <div className="absolute left-6 md:left-8 w-4 h-4 bg-zinc-950 border-2 border-zinc-700 rotate-45 -translate-x-1/2 mt-2 group-hover:border-[#ff6b6b] group-hover:bg-[#ff6b6b]/20 transition-colors z-10"></div>
              <div className="w-full pl-16 md:pl-24">
                <img src="/lp/authority-portrait.jpg" alt="Story" className="rounded-2xl border border-zinc-800 w-full max-w-md object-cover aspect-video mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-bold text-[#ff6b6b] mb-4">Vse se je začelo z obljubo moji mami</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">Pri 16 letih sem si zadal cilj, da poskrbim za svojo mamo. Obljubil sem ji, da bo njeno življenje drugačno. Zgradil sem uspešno agencijo in poskrbel, da ji nikoli več ni bilo treba skrbeti za denar.</p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative flex flex-col md:flex-row items-start justify-between mb-24 group">
              <div className="absolute left-6 md:left-8 w-4 h-4 bg-zinc-950 border-2 border-zinc-700 rotate-45 -translate-x-1/2 mt-2 group-hover:border-[#ff6b6b] group-hover:bg-[#ff6b6b]/20 transition-colors z-10"></div>
              <div className="w-full pl-16 md:pl-24">
                <h3 className="text-2xl font-bold text-[#ff6b6b] mb-4">Svojo agencijo sem spremenil v večmilijonski produkt</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">Po uspešnem skaliranju agencije me je na stotine ljudi prosilo, naj jih naučim svojega sistema. Ustvaril sem svoj prvi digitalni produkt, ki je ustvaril nekatere najbolj dokumentirane zgodbe o uspehu v industriji.</p>
              </div>
            </div>
            
            {/* Timeline Item 3 */}
            <div className="relative flex flex-col md:flex-row items-start justify-between mb-24 group">
              <div className="absolute left-6 md:left-8 w-4 h-4 bg-zinc-950 border-2 border-zinc-700 rotate-45 -translate-x-1/2 mt-2 group-hover:border-[#ff6b6b] group-hover:bg-[#ff6b6b]/20 transition-colors z-10"></div>
              <div className="w-full pl-16 md:pl-24">
                <img src="/lp/lifestyle.jpg" alt="Story" className="rounded-2xl border border-zinc-800 w-full max-w-md object-cover aspect-video mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-bold text-[#ff6b6b] mb-4">Soustanovitelj platforme z 2+ milijardami $ prodaje</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">Videl sem priložnost v ekonomiji ustvarjalcev in močno investiral v platformo, ki ljudem omogoča prodajo digitalnih produktov brez stresa. Danes procesira milijarde plačil s pomočjo AI.</p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative flex flex-col md:flex-row items-start justify-between group">
              <div className="absolute left-6 md:left-8 w-4 h-4 bg-zinc-950 border-2 border-zinc-700 rotate-45 -translate-x-1/2 mt-2 group-hover:border-[#ff6b6b] group-hover:bg-[#ff6b6b]/20 transition-colors z-10"></div>
              <div className="w-full pl-16 md:pl-24">
                <h3 className="text-2xl font-bold text-[#ff6b6b] mb-4">Udeleženci so v 90 dneh ustvarili izjemne rezultate</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">Pred nekaj meseci sem gostil izziv, kjer sem pokazal, kako zaslužiti na spletu z AI. Tisti, ki so ukrepali, so v samo 90 dneh ustvarili neverjetne sledljive zaslužke.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-[#4c1d95]/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative bg-[#050505] border border-zinc-800 rounded-3xl p-10 md:p-16 text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2e1065]/30 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-8 bg-zinc-900 rounded-full border border-zinc-700 flex items-center justify-center mb-8">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 border border-zinc-900"></div>
                  <div className="w-5 h-5 rounded-full bg-blue-500 border border-zinc-900"></div>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Rezervirajte svoje mesto spodaj</h2>
              <p className="text-gray-400 mb-10">Na vaš email boste prejeli potrditev.</p>
              
              <button onClick={scrollToForm} className="bg-[#6bfb82] text-black font-extrabold text-lg px-12 py-4 rounded-full border-[4px] border-[#1a3822] shadow-[0_0_30px_rgba(107,251,130,0.15)] hover:scale-105 transition-transform w-full md:w-auto">
                ŽELIM BREZPLAČNO VSTOPNICO
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8 text-[10px] text-gray-600 uppercase tracking-widest">
            <p>Privacy Policy | Terms & Conditions</p>
            <p className="mt-2 max-w-2xl mx-auto">This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.</p>
            <p className="mt-2">©2026 AI Universa. All Rights Reserved.</p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
