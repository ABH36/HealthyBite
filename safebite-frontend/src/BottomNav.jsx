import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scan, User } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Haptic Feedback Helper
    const navTo = (path) => {
        if (navigator.vibrate) navigator.vibrate(10);
        navigate(path);
    };

    const isActive = (path) => location.pathname === path;

    // Admin Panel par nav mat dikhao
    if (location.pathname === '/admin') return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center safe-bottom pointer-events-none">
            {/* GLASS DOCK CONTAINER */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-8 py-3 flex items-center justify-between w-full max-w-xs relative transition-all duration-300">
                
                {/* 🏠 LEFT: HOME */}
                <button
                    onClick={() => navTo('/')}
                    className="relative flex flex-col items-center justify-center w-12 h-12 group transition-transform active:scale-90"
                >
                    {/* Active Dot */}
                    <span className={`absolute -top-1 w-1 h-1 rounded-full bg-brand-green transition-all duration-300 ${isActive('/') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                    
                    {/* Icon */}
                    <div className={`transition-all duration-300 ${isActive('/') ? 'text-black -translate-y-1 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        <Home size={26} strokeWidth={isActive('/') ? 2.5 : 2} />
                    </div>
                </button>

                {/* 📸 CENTER: SCAN BUTTON (FLOATING) */}
                {/* Absolute position se center me rahega */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                    <button
                        onClick={() => navTo('/scan')}
                        className="relative group w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-2xl border-4 border-gray-50 transform transition-all duration-300 active:scale-90 hover:shadow-brand-green/50"
                    >
                        {/* Pulse Ring */}
                        <span className="absolute w-full h-full rounded-full bg-brand-green/30 animate-ping opacity-75 group-hover:opacity-100"></span>
                        
                        <Scan size={28} className="text-white relative z-10 transition-transform duration-500 group-hover:rotate-90" />
                    </button>
                </div>

                {/* 👤 RIGHT: PROFILE */}
                <button
                    onClick={() => navTo('/profile')}
                    className="relative flex flex-col items-center justify-center w-12 h-12 group transition-transform active:scale-90"
                >
                    <span className={`absolute -top-1 w-1 h-1 rounded-full bg-brand-green transition-all duration-300 ${isActive('/profile') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                    
                    <div className={`transition-all duration-300 ${isActive('/profile') ? 'text-black -translate-y-1 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        <User size={26} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    </div>
                </button>

            </div>
        </div>
    );
};

export default BottomNav;