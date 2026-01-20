import React, { useState } from 'react';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';

interface EmailCaptureProps {
  buttonText?: string;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ buttonText = "ODKLENI DOSTOP" }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    try {
      // Send data to GoHighLevel Webhook
      await fetch('https://services.leadconnectorhq.com/hooks/TGsyH70nsz7y3hijuqTn/webhook-trigger/a0c8a524-246e-4cd7-b380-432c2de56018', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'Cultured Landing Page',
          timestamp: new Date().toISOString()
        }),
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Submission error:', error);
      // In case of CORS errors (common with direct browser webhooks), 
      // we still show success to the user to maintain the experience.
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full max-w-md mx-auto text-center p-4 bg-cultured-accent/10 border border-cultured-accent rounded-sm animate-pulse">
        <p className="font-mono text-cultured-accent font-bold uppercase tracking-widest text-sm">
          SI NA SEZNAMU. PRIPRAVI DENARNICO.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-center border-b-2 border-white/50 focus-within:border-cultured-accent focus-within:shadow-[0_15px_30px_-10px_rgba(255,42,77,0.4)] transition-all duration-500 ease-out pb-2"
      >
        <Lock className="w-4 h-4 text-white/50 mr-3 group-focus-within:text-cultured-accent transition-colors duration-500" />
        <input 
          type="email" 
          placeholder="VPIŠI E-NASLOV ZA DOSTOP"
          className="bg-transparent w-full outline-none text-white font-mono placeholder:text-neutral-500 text-sm md:text-base uppercase tracking-wider transition-all duration-300 focus:placeholder:text-white/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
        />
        <button 
          type="submit" 
          disabled={status === 'loading' || !email}
          className="flex items-center text-xs md:text-sm font-bold text-white uppercase tracking-widest hover:text-cultured-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2 group-focus-within:translate-x-1"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin text-cultured-accent" /> : (
            <>
              {buttonText} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
      <div className="text-[10px] text-neutral-500 mt-2 font-mono text-center transition-opacity duration-500 opacity-60 group-focus-within:opacity-100">
        * OMEJENO NA 500 KOSOV. NI PONOVNIH ZALOG.
      </div>
    </div>
  );
};

export default EmailCapture;