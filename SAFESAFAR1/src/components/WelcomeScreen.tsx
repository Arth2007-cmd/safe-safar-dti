import React from 'react';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Navigation, Shield, Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginClick }) => {
  const features = [
    {
      icon: <Bus className="w-6 h-6" />,
      title: "Real-time Tracking",
      description: "Live bus locations and accurate ETAs"
    },
    {
      icon: <Navigation className="w-6 h-6" />,
      title: "Smart Routes",
      description: "Optimized journey planning for your commute"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safety First",
      description: "Emergency alerts and safe travel features"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(217,91%,20%) 0%, hsl(217,91%,28%) 40%, hsl(178,100%,25%) 80%, hsl(217,91%,22%) 100%)',
        backgroundSize: '400% 400%',
        animation: 'auroraGradient 8s ease infinite'
      }}
    >
      {/* Background Particles & Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Antigravity floating circles */}
        <div className="absolute top-[10%] left-[5%] w-40 h-40 border border-white/10 rounded-full antigravity-levitate" />
        <div className="absolute top-[30%] right-[10%] w-28 h-28 border border-white/8 rounded-full antigravity-levitate"
          style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[25%] left-[15%] w-52 h-52 border border-white/6 rounded-full antigravity-levitate"
          style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[15%] right-[8%] w-36 h-36 border border-white/10 rounded-full antigravity-levitate"
          style={{ animationDelay: '2s' }} />

        {/* Glowing orbs */}
        <div className="absolute top-[20%] left-[60%] w-3 h-3 bg-yellow-400/40 rounded-full breathing" />
        <div className="absolute top-[55%] left-[80%] w-2 h-2 bg-teal-400/50 rounded-full breathing" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[20%] w-2 h-2 bg-white/30 rounded-full breathing" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[15%] right-[30%] w-1.5 h-1.5 bg-yellow-300/30 rounded-full breathing" style={{ animationDelay: '0.5s' }} />

        {/* Map pin floating */}
        <div className="floating-element absolute top-[45%] right-[8%]" style={{ animationDelay: '1s' }}>
          <MapPin className="w-8 h-8 text-white/10" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header / Brand */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 text-center text-white">
          <div className="welcome-content">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-white/5 rounded-2xl blur-xl" />
                <Bus className="w-16 h-16 mr-4 floating-element relative" />
              </div>
              <h1 className="text-5xl font-bold neon-text tracking-tight">SafeSafar</h1>
            </div>

            {/* Tagline */}
            <p className="text-xl text-white/90 mb-2 font-light">Smart Commuting, Safe Journey</p>
            <p className="text-white/60 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
              Your trusted companion for reliable public transport in smart cities
            </p>

            {/* Animated route line */}
            <div className="flex justify-center mb-10">
              <div className="route-line h-[2px] w-32 rounded-full" />
            </div>

            {/* Features */}
            <div className="space-y-5 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-item flex items-start text-left max-w-sm mx-auto group"
                >
                  <div className="flex-shrink-0 w-12 h-12 glass-card rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-0.5">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-6 pb-8">
          <div className="welcome-content">
            <Button
              onClick={onLoginClick}
              className="w-full h-14 bg-white text-primary hover:bg-white/95 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] group"
            >
              <span>Get Started</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center justify-center mt-4 space-x-2">
              <Sparkles className="w-3 h-3 text-yellow-300/60" />
              <p className="text-white/50 text-sm">
                Join thousands of smart commuters
              </p>
              <Sparkles className="w-3 h-3 text-yellow-300/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};