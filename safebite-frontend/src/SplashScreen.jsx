import React from 'react';
import { ShieldCheck } from 'lucide-react';

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col items-center justify-center">
            {/* Logo Animation */}
            <div className="bg-white p-6 rounded-3xl shadow-xl ring-4 ring-brand-green/20 animate-bounce-slow">
                <ShieldCheck size={64} className="text-brand-green" />
            </div>
            
            {/* Text Animation */}
            <div className="mt-6 text-center animate-fade-in-up">
                <h1 className="text-4xl font-black text-brand-dark tracking-tight">
                    Healthy<span className="text-brand-green">Bite</span>
                </h1>
                <p className="text-gray-500 font-medium mt-2 tracking-wide text-sm">
                    Eat Smart. Live Safe.
                </p>
            </div>

            {/* Loading Bar */}
            <div className="w-32 h-1 bg-gray-200 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-brand-green animate-[width_2s_ease-out_forwards]" style={{width: '0%'}}></div>
            </div>

            <div className="absolute bottom-10 text-xs font-bold text-gray-300 uppercase tracking-widest">
                Made for India 🇮🇳
            </div>
        </div>
    );
};

export default SplashScreen;