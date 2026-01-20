import React from 'react';

const Marquee: React.FC = () => {
  const items = [
    "KAPSULA 001",
    "INTERNET MONEY",
    "OMEJENA IZDAJA",
    "BREZ PONOVNIH ZALOG",
    "POŠILJAMO PO CELEM SVETU",
    "ZAGOTOVI SI SVOJE",
    "CULTURED®",
    "GEN Z ELITA"
  ];

  return (
    <div className="w-full bg-cultured-accent overflow-hidden py-2 border-y border-black relative z-10">
      <div className="animate-marquee whitespace-nowrap flex">
        {[...items, ...items, ...items].map((item, index) => (
          <span key={index} className="mx-8 text-black font-black italic uppercase tracking-tighter text-lg md:text-xl">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;