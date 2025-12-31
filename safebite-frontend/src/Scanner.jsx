import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, AlertTriangle, ScanLine } from 'lucide-react';
import { getDeviceId } from './utils/device';

const Scanner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const deviceId = getDeviceId();

    useEffect(() => {
        // 🔧 Scanner Configuration
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false,
                supportedScanTypes: [0, 1] // QR & Barcode
            },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanFailure(error) {
            // Silent failure to avoid console spam
        }

        async function onScanSuccess(decodedText, decodedResult) {
            scanner.clear(); // Stop camera immediately
            setIsCameraActive(false);
            setLoading(true);
            
            // Haptic Feedback for Real Feel
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

            try {
                // ✅ CRITICAL FIX: Changed '/api/product' to '/api/products'
                const response = await axios.get(`${API_URL}/api/products/${decodedText}?deviceId=${deviceId}`);
                
                handleSuccess(decodedText, response.data);

            } catch (err) {
                console.error("Scan Error:", err);
                // Even on error, navigate to result (it handles 'not found' state)
                navigate('/result', { state: { product: null, barcode: decodedText } });
            } finally {
                setLoading(false);
            }
        }

        // Clean up on unmount
        return () => {
            scanner.clear().catch(error => console.error("Scanner clear error", error));
        };
    }, [navigate, API_URL, deviceId]);

    // Reusable Success Handler
    const handleSuccess = (code, responseData) => {
        const productData = responseData.data;

        // Smart Memory Logic
        const historyItem = {
            barcode: code,
            name: productData.name,
            brand: productData.brand,
            status: productData.analysis.status,
            image: productData.image,
            fullData: productData 
        };

        const existing = JSON.parse(localStorage.getItem('safebite_history') || '[]');
        const newHistory = [historyItem, ...existing.filter(i => i.barcode !== code)].slice(0, 5);
        localStorage.setItem('safebite_history', JSON.stringify(newHistory));

        navigate('/result', { 
            state: { 
                product: productData, 
                alternatives: responseData.alternatives,
                barcode: code
            } 
        });
    };

    // Manual Submit Handler
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualCode) return;
        
        setLoading(true);
        if (navigator.vibrate) navigator.vibrate(20);

        try {
            // ✅ CRITICAL FIX: Changed '/api/product' to '/api/products'
            const response = await axios.get(`${API_URL}/api/products/${manualCode}?deviceId=${deviceId}`);
            handleSuccess(manualCode, response.data);
        } catch (err) {
            navigate('/result', { state: { product: null, barcode: manualCode } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-start overflow-y-auto safe-top safe-bottom">
            
            {/* 🔙 BACK BUTTON (Glassmorphism) */}
            <button 
                onClick={() => navigate('/')} 
                className="absolute top-6 left-6 z-50 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-all active:scale-90 shadow-lg"
            >
                <ArrowLeft size={24} />
            </button>

            {/* 📸 SCANNER AREA */}
            <div className="relative w-full max-w-md mt-20 px-4">
                
                {/* Status Text */}
                <div className="text-center mb-6 animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Scan Product</h1>
                    <p className="text-white/60 text-sm mt-1">Place barcode inside the frame</p>
                </div>

                {/* Camera Frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-[0_0_40px_-10px_rgba(29,191,115,0.3)] border border-white/10 bg-gray-900">
                    
                    {/* Loading State Overlay */}
                    {loading && (
                        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-medium animate-pulse tracking-wide">Analysing Purity...</p>
                        </div>
                    )}

                    {/* Laser Animation (Only when camera active) */}
                    {isCameraActive && !loading && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {/* Corner Markers */}
                            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-brand-green rounded-tl-xl"></div>
                            <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-brand-green rounded-tr-xl"></div>
                            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-brand-green rounded-bl-xl"></div>
                            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-brand-green rounded-br-xl"></div>
                            
                            {/* Moving Laser Line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-brand-green/80 shadow-[0_0_15px_rgba(29,191,115,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                    
                    {/* The Actual Camera Feed */}
                    <div id="reader" className="w-full h-[350px] bg-black"></div>
                </div>
            </div>

            {/* 👇 MANUAL ENTRY SECTION */}
            <div className="w-full max-w-md px-6 mt-8 pb-32 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Or enter manually</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <form onSubmit={handleManualSubmit} className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <ScanLine size={20} className="text-white/40 group-focus-within:text-brand-green transition-colors" />
                    </div>
                    
                    <input 
                        type="text" 
                        inputMode="numeric" 
                        pattern="[0-9]*"
                        placeholder="Type barcode digits..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-14 py-4 text-white placeholder-white/30 outline-none focus:border-brand-green/50 focus:bg-white/10 transition-all font-mono tracking-widest shadow-lg"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={!manualCode}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-green disabled:bg-white/10 text-brand-dark disabled:text-white/20 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:bg-emerald-400"
                    >
                        <Zap size={20} fill="currentColor" />
                    </button>
                </form>

                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2 text-white/40 text-xs bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <AlertTriangle size={14} />
                        <span>Ensure adequate lighting for best results</span>
                    </div>
                </div>
            </div>

            {/* CSS for Scanner Animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Scanner;