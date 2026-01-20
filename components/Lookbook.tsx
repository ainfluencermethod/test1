import React from 'react';

const Lookbook: React.FC = () => {
  const images = [
    "https://picsum.photos/600/800?grayscale&random=1",
    "https://picsum.photos/600/800?grayscale&random=2",
    "https://picsum.photos/600/800?grayscale&random=3",
    "https://picsum.photos/600/800?grayscale&random=4",
    "https://picsum.photos/600/800?grayscale&random=5",
    "https://picsum.photos/600/800?grayscale&random=6",
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">Sezona 01 // Arhiv</h2>
        <p className="font-mono text-cultured-accent">VIZUALNE REFERENCE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <div key={i} className="group relative overflow-hidden aspect-[3/4]">
            <img 
              src={src} 
              alt={`Look ${i + 1}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-sm"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="font-mono text-2xl font-bold border border-white px-4 py-2 uppercase tracking-widest">
                Poglej Stil 00{i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lookbook;