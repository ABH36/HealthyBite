import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0b1f16] via-[#145c3a] to-[#0b1f16] flex flex-col items-center justify-center overflow-hidden">

      {/* Ambient Glow */}
      <div className="absolute w-72 h-72 bg-brand-green/20 blur-[120px] rounded-full animate-pulse"></div>

      {/* LOGO */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 animate-bounce-slow">
          <div className="absolute inset-0 bg-brand-green/25 blur-xl rounded-full scale-90"></div>

          <img
            src="/logo.png"
            alt="HealthyBite Logo"
            className="w-full h-full object-contain drop-shadow-2xl relative z-10"
          />
        </div>

        {/* Brand Text */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Healthy<span className="text-brand-green">Bite</span>
          </h1>
          <p className="text-green-200 text-xs sm:text-sm tracking-widest mt-1 uppercase">
            Eat Smart • Live Safe
          </p>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="w-40 h-1.5 bg-white/20 rounded-full mt-10 overflow-hidden">
        <div className="h-full bg-brand-green animate-pulse w-full rounded-full"></div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 text-[10px] font-bold text-white/60 uppercase tracking-widest">
        Made for India 🇮🇳
      </div>
    </div>
  );
};

export default SplashScreen;
