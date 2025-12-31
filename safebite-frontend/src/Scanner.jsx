import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, AlertTriangle } from 'lucide-react';
import { getDeviceId } from './utils/device';

const Scanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manualCode, setManualCode] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;
    const deviceId = getDeviceId();

    useEffect(() => {
        // 🔧 FIX: Scanner Config for better Mobile Performance
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false,
                // Supported Formats reduce errors
                supportedScanTypes: [0, 1] // 0=QR, 1=BARCODE
            },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanFailure(error) {
            // console.warn(error); // Silent failure is fine
        }

        async function onScanSuccess(decodedText, decodedResult) {
            scanner.clear();
            setScanResult(decodedText);
            setLoading(true);
            
            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate(50);

            try {
                // 1. API Call
                const response = await axios.get(`${API_URL}/api/product/${decodedText}?deviceId=${deviceId}`);
                
                const productData = response.data.data;

                // 2. SMART MEMORY ENGINE
                const historyItem = {
                    barcode: decodedText,
                    name: productData.name,
                    brand: productData.brand,
                    status: productData.analysis.status,
                    image: productData.image,
                    fullData: productData 
                };

                const existing = JSON.parse(localStorage.getItem('safebite_history') || '[]');
                const newHistory = [historyItem, ...existing.filter(i => i.barcode !== decodedText)].slice(0, 5);
                localStorage.setItem('safebite_history', JSON.stringify(newHistory));

                // 3. Navigate
                navigate('/result', { 
                    state: { 
                        product: productData, 
                        alternatives: response.data.alternatives,
                        barcode: decodedText
                    } 
                });

            } catch (err) {
                console.error(err);
                navigate('/result', { state: { product: null, barcode: decodedText } });
            } finally {
                setLoading(false);
            }
        }

        return () => {
            scanner.clear().catch(error => console.error("Scanner clear error", error));
        };
    }, [navigate, API_URL, deviceId]);

    // Manual Submit
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualCode) return;
        setLoading(true);
        if (navigator.vibrate) navigator.vibrate(20);

        try {
            const response = await axios.get(`${API_URL}/api/product/${manualCode}?deviceId=${deviceId}`);
            const productData = response.data.data;

            const historyItem = {
                barcode: manualCode,
                name: productData.name,
                brand: productData.brand,
                status: productData.analysis.status,
                image: productData.image,
                fullData: productData
            };
            const existing = JSON.parse(localStorage.getItem('safebite_history') || '[]');
            const newHistory = [historyItem, ...existing.filter(i => i.barcode !== manualCode)].slice(0, 5);
            localStorage.setItem('safebite_history', JSON.stringify(newHistory));

            navigate('/result', { 
                state: { 
                    product: productData, 
                    alternatives: response.data.alternatives,
                    barcode: manualCode 
                } 
            });
        } catch (err) {
            navigate('/result', { state: { product: null, barcode: manualCode } });
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✅ FIX 1: 'overflow-y-auto' added to handle small screens when keyboard opens
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-4 pb-32 overflow-y-auto">
            
            {/* ✅ FIX 2: 'top-12' (48px) ensures Back Button is below iPhone Notch */}
            <button 
                onClick={() => navigate('/')} 
                className="absolute top-12 left-6 z-50 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all active:scale-95 shadow-lg"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Scanner UI */}
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-green mb-4"></div>
                        <p className="text-gray-600 font-bold animate-pulse">Analyzing Ingredients...</p>
                    </div>
                )}
                
                <div id="reader" className="w-full h-full bg-black"></div>
                
                <div className="p-6 text-center bg-white">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Scan Barcode</h2>
                    <p className="text-gray-500 text-sm mb-6">Point camera at the back of the pack</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        {/* ✅ FIX 3: inputMode="numeric" opens Number Pad on mobile */}
                        <input 
                            type="text" 
                            inputMode="numeric" 
                            pattern="[0-9]*"
                            placeholder="Enter barcode manually" 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-green transition-all font-mono tracking-widest"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                        />
                        <button type="submit" className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95">
                            <Zap size={20} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Hint */}
            <div className="mt-8 flex items-center gap-2 text-white/60 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <AlertTriangle size={16} />
                <span>Make sure barcode is well lit</span>
            </div>

        </div>
    );
};

export default Scanner;