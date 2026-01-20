import React, { useState, useEffect } from 'react';

const Countdown: React.FC = () => {
  // Set a target date 3 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Arbitrary future date for the demo
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); 
    targetDate.setHours(20, 0, 0, 0); // 8 PM drop

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center mx-3 md:mx-6">
      <span className="text-5xl md:text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,42,77,0.6)]">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] md:text-sm uppercase tracking-widest text-cultured-accent mt-2 font-bold">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex justify-center items-center py-8 backdrop-blur-sm bg-black/20 rounded-lg border border-white/10 mt-8">
      <TimeUnit value={timeLeft.days} label="DNI" />
      <span className="text-3xl md:text-6xl text-white/20 font-thin mb-8">:</span>
      <TimeUnit value={timeLeft.hours} label="UR" />
      <span className="text-3xl md:text-6xl text-white/20 font-thin mb-8">:</span>
      <TimeUnit value={timeLeft.minutes} label="MIN" />
      <span className="text-3xl md:text-6xl text-white/20 font-thin mb-8">:</span>
      <TimeUnit value={timeLeft.seconds} label="SEK" />
    </div>
  );
};

export default Countdown;