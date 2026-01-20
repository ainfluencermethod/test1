import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-40 pb-20 container mx-auto px-4 flex flex-col items-center justify-center">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12 leading-none">
          Uporniški<span className="text-cultured-accent">Luksuz</span><br/>
        </h1>
        
        <div className="space-y-8 text-lg md:text-xl font-mono text-neutral-400 leading-relaxed text-justify">
          <p>
            CULTURED ni blagovna znamka. Je gibanje. Rojeno v digitalnem podzemlju Web3 in ulične mode, premoščamo vrzel med fizično ekskluzivnostjo in digitalno redkostjo.
          </p>
          <p>
            Ne delamo sezon. Delamo kapsule. Ko so razprodane, so razprodane za vedno. Brez ponovnih zalog. Brez kompromisov.
          </p>
          <p className="text-white font-bold uppercase tracking-widest pt-8">
            // PRIDRUŽI SE UPORU.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;