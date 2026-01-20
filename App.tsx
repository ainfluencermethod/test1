import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Lookbook from './components/Lookbook';
import NewArrivals from './components/NewArrivals';
import About from './components/About';
import { generateHypeContent } from './services/geminiService';
import { ManifestoContent, ViewState } from './types';
import { X, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [manifesto, setManifesto] = useState<ManifestoContent | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    // Fetch dynamic content from Gemini on mount
    const fetchContent = async () => {
      const content = await generateHypeContent();
      setManifesto(content);
    };
    fetchContent();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <Home manifesto={manifesto} />;
      case 'LOOKBOOK':
        return <Lookbook />;
      case 'NEW_ARRIVALS':
        return <NewArrivals />;
      case 'ABOUT':
        return <About />;
      default:
        return <Home manifesto={manifesto} />;
    }
  };

  return (
    <div className="min-h-screen bg-cultured-black text-cultured-white selection:bg-cultured-accent selection:text-black font-sans">
      <Header />
      
      {renderView()}

      {/* DEV PREVIEW BUTTON */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
        {isPreviewOpen && (
          <div className="mb-4 bg-cultured-black border border-white/20 rounded-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 font-mono text-xs text-cultured-accent font-bold">
              PREVIEW MODE
            </div>
            <div className="flex flex-col min-w-[160px]">
              {(['HOME', 'LOOKBOOK', 'NEW_ARRIVALS', 'ABOUT'] as ViewState[]).map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    setCurrentView(view);
                    window.scrollTo(0, 0);
                  }}
                  className={`px-4 py-3 text-left text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-between ${currentView === view ? 'text-cultured-accent' : 'text-white'}`}
                >
                  {view.replace('_', ' ')}
                  {currentView === view && <div className="w-1.5 h-1.5 bg-cultured-accent rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="group flex items-center justify-center w-12 h-12 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
        >
          {isPreviewOpen ? <X className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
};

export default App;