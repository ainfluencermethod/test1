import React from 'react';
import Countdown from './Countdown';
import EmailCapture from './EmailCapture';
import Marquee from './Marquee';
import { ManifestoContent } from '../types';

interface HomeProps {
  manifesto: ManifestoContent | null;
}

const Home: React.FC<HomeProps> = ({ manifesto }) => {
  return (
    <>
      <main className="relative min-h-screen flex flex-col justify-center items-center overflow-x-hidden bg-cultured-black py-24">
        
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          {/* Rich Red Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#3d0a12]/30 to-cultured-black z-10"></div>
          
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Vault Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          
          {/* Red Tinted Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQwIDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] z-10 opacity-20 pointer-events-none"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center mt-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 border border-cultured-accent/50 bg-cultured-accent/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(255,42,77,0.3)]">
            <span className="w-2 h-2 bg-cultured-accent rounded-full animate-pulse-fast"></span>
            <span className="text-cultured-accent font-mono text-xs font-bold tracking-widest uppercase">
              STATUS TREZORJA: ZAPRTO
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_25px_rgba(255,42,77,0.2)]">
            {manifesto ? manifesto.headline : "DOSTOP\nOMEJEN"}
          </h1>

          {/* Subtext */}
          <p className="max-w-xl text-neutral-300 text-sm md:text-lg font-mono mb-10 leading-relaxed drop-shadow-md">
            {manifesto ? manifesto.subtext : "Kapsula 001 je zaklenjena. Pridruži se čakalni listi za 24-urni zgodnji dostop. Omejeno na 500 kosov. Ne zamudi."}
          </p>

          {/* Product Showcase Image */}
          <div className="w-full max-w-md mb-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,42,77,0.15)] group relative transform hover:scale-[1.01] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-cultured-black/80 via-transparent to-transparent z-10 opacity-60"></div>
            <img 
              src="https://storage.googleapis.com/msgsndr/TGsyH70nsz7y3hijuqTn/media/696f679dd4fb90fb7875f8b6.webp" 
              alt="Kapsula 001 Showcase" 
              className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
               <span className="bg-black/70 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider">
                  Reference: 001
               </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-12 w-full">
            <Countdown />
          </div>

          {/* CTA Area */}
          <div className="w-full backdrop-blur-xl bg-black/40 border border-white/10 p-8 md:p-12 rounded-2xl max-w-2xl transform transition-transform hover:scale-[1.01] duration-500 shadow-2xl">
             <h3 className="text-2xl font-bold uppercase mb-2 tracking-wide text-white">
               {manifesto ? manifesto.tagline : "ODKLENI TREZOR"}
             </h3>
             <p className="text-neutral-400 text-sm mb-6">
               Bodi prvi, ki izve, kdaj se trezor odpre. Zgodnji podporniki dobijo ekskluziven dostop do dropa Kapsule 001.
             </p>
             <EmailCapture />
          </div>

        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 hidden md:block z-10">
           <div className="font-mono text-xs text-cultured-accent/50 vertical-rl tracking-widest">
              LAT: 34.0522° N <br />
              LON: 118.2437° W
           </div>
        </div>
      </main>

      <Marquee />
    </>
  );
};

export default Home;