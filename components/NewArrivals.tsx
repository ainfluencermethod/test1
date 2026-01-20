import React from 'react';
import { Lock } from 'lucide-react';

const NewArrivals: React.FC = () => {
  const products = [
    { name: "Heavyweight Kapucar // Slate", price: "$120" },
    { name: "Cargo Padalske Hlače", price: "$145" },
    { name: "Majica Distressed Logo", price: "$55" },
    { name: "Taktični Jopič V2", price: "$180" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
      <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Kapsula 001</h2>
          <p className="font-mono text-neutral-400">OMEJENE KOLIČINE. KDO PREJ PRIDE.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="font-mono text-cultured-accent">DATUM IZIDA: TBD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, i) => (
          <div key={i} className="relative group">
            <div className="aspect-square bg-white/5 border border-white/10 mb-4 relative overflow-hidden flex items-center justify-center">
               <span className="font-mono text-white/20 text-6xl font-black">{`00${i+1}`}</span>
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Lock className="w-8 h-8 text-cultured-accent mb-2" />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold">ZAKLENJENO</span>
               </div>
            </div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold uppercase tracking-wide max-w-[70%]">{product.name}</h3>
              <span className="font-mono text-neutral-400">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;