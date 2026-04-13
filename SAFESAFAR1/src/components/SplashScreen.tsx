import React, { useEffect, useState, useRef } from 'react';
import { Bus, MapPin, Clock, Shield, Navigation, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Enter phase -> hold
    const enterTimer = setTimeout(() => setPhase('hold'), 800);
    // Hold -> exit
    const holdTimer = setTimeout(() => setPhase('exit'), 2800);
    // Exit -> complete
    const exitTimer = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    }, 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`splash-screen transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Aurora background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div
          className="absolute w-64 h-64 rounded-full parallax-slow"
          style={{
            background: 'radial-gradient(circle, rgba(0,131,143,0.2) 0%, transparent 70%)',
            top: '10%',
            left: '-5%',
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full parallax-medium"
          style={{
            background: 'radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)',
            top: '60%',
            right: '-10%',
          }}
        />
        <div
          className="absolute w-32 h-32 rounded-full parallax-fast"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            bottom: '20%',
            left: '20%',
          }}
        />

        {/* Floating transit icons */}
        <div className="floating-element absolute top-[15%] left-[15%]" style={{ animationDelay: '0s' }}>
          <MapPin className="w-5 h-5 text-white/20" />
        </div>
        <div className="floating-element absolute top-[25%] right-[20%]" style={{ animationDelay: '1s' }}>
          <Clock className="w-5 h-5 text-white/20" />
        </div>
        <div className="floating-element absolute bottom-[35%] left-[25%]" style={{ animationDelay: '2s' }}>
          <Shield className="w-4 h-4 text-white/15" />
        </div>
        <div className="floating-element absolute bottom-[25%] right-[15%]" style={{ animationDelay: '0.5s' }}>
          <Navigation className="w-5 h-5 text-white/15" />
        </div>
        <div className="floating-element absolute top-[50%] left-[10%]" style={{ animationDelay: '1.5s' }}>
          <Zap className="w-4 h-4 text-white/15" />
        </div>
        <div className="floating-element absolute top-[40%] right-[10%]" style={{ animationDelay: '2.5s' }}>
          <Bus className="w-6 h-6 text-white/15" />
        </div>

        {/* Antigravity grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <div className="splash-logo flex items-center justify-center mb-6">
          <div className="relative">
            {/* Glow ring behind bus icon */}
            <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-white/10 animate-ping" 
              style={{ animationDuration: '2s' }} />
            <Bus className="w-14 h-14 mr-4 bus-move relative z-10" />
          </div>
          <span className="neon-text">SafeSafar</span>
        </div>

        {/* Tagline */}
        <p className="splash-tagline text-white/80 text-lg">
          Smart Commuting, Safe Journey
        </p>

        {/* Animated line separator */}
        <div className="mt-6 flex justify-center">
          <div className="route-line h-[2px] w-24 rounded-full" />
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center mt-8 space-x-3">
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full pulse-dot" />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full pulse-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full pulse-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};
