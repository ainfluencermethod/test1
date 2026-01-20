import React from 'react';
import { Plus } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cultured-black text-white pt-20 pb-10 px-6 border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          <div className="col-span-1 md:col-span-1">
             <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Join The Cult</h4>
             <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
               Earn XP and rewards on all drops. Exclusive access to the Discord server.
             </p>
             <button className="text-sm border-b border-white pb-1 uppercase tracking-wider hover:text-cultured-accent hover:border-cultured-accent transition-colors">
               → Create Account
             </button>
          </div>

          <div className="col-span-1 md:col-span-1">
            <div className="flex justify-between items-center border-b border-white/10 py-4 cursor-pointer group">
              <span className="text-sm font-bold uppercase tracking-widest group-hover:text-cultured-accent transition-colors">Client Services</span>
              <Plus className="w-4 h-4 text-white/50 group-hover:rotate-90 transition-transform" />
            </div>
            <div className="flex justify-between items-center border-b border-white/10 py-4 cursor-pointer group">
              <span className="text-sm font-bold uppercase tracking-widest group-hover:text-cultured-accent transition-colors">Legal</span>
              <Plus className="w-4 h-4 text-white/50 group-hover:rotate-90 transition-transform" />
            </div>
             <div className="flex justify-between items-center border-b border-white/10 py-4 cursor-pointer group">
              <span className="text-sm font-bold uppercase tracking-widest group-hover:text-cultured-accent transition-colors">Socials</span>
              <Plus className="w-4 h-4 text-white/50 group-hover:rotate-90 transition-transform" />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col justify-end items-start md:items-end">
             <h2 className="text-[12vw] md:text-8xl font-black text-white/5 leading-none select-none pointer-events-none">
               CULTURED
             </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-600 uppercase tracking-widest">
          <div className="flex gap-4 mb-4 md:mb-0">
            <span>© 2024 Cultured Inc.</span>
            <span>Los Angeles / Tokyo</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;