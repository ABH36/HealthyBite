import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scan, Search, Activity, Bell, AlertTriangle, Info, Download, Trash2, Clock } from 'lucide-react';
import { getDeviceId } from './utils/device';
import { getLanguage, setLanguage } from './utils/lang';

// Import Pages & Components
import Scanner from './Scanner';
import Result from './Result';
import HealthProfile from './HealthProfile';
import PoisonLibrary from './PoisonLibrary';
import AdminPanel from './AdminPanel';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import SplashScreen from './SplashScreen'; 
import PrivacyPolicy from './PrivacyPolicy'; // 🛡️ New Route for App Compliance

// 🔥 Phase 22: Import Firebase Functions
import { requestPermission, onMessageListener } from './firebase';

// Helper
const haptic = () => { if (navigator.vibrate) navigator.vibrate(15); };

const Home = () => {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  // ✅ Using VITE_API_URL (Synced with Vercel & Render)
  const API_URL = import.meta.env.VITE_API_URL;
  
  // State Management
  const [todayScore, setTodayScore] = useState(0);
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [alerts, setAlerts] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [history, setHistory] = useState([]);

  // 🎬 SPLASH SCREEN STATE
  const [loading, setLoading] = useState(true);

  // 🎬 1. SPLASH EFFECT
  useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2200);
      return () => clearTimeout(timer);
  }, []);

  // 🔥 2. NOTIFICATION SYSTEM (Phase 22 - Optimized)
  useEffect(() => {
      const syncToken = async () => {
          const token = await requestPermission();
          
          if (token) {
              console.log("🔔 Permission Granted. Checking Sync Status...");
              
              // 🛡️ Prevent Spamming Backend
              const isSynced = localStorage.getItem("hb_fcm_synced");
              
              if (!isSynced) {
                  try {
                      await axios.post(`${API_URL}/api/user/fcm`, {
                          deviceId: deviceId,
                          token: token
                      });
                      console.log("✅ Token Synced with Server!");
                      localStorage.setItem("hb_fcm_synced", "true");
                  } catch (e) {
                      console.error("Token Sync Failed", e);
                  }
              } else {
                  console.log("⚡ Token already synced. Skipping.");
              }
          }
      };

      syncToken();

      onMessageListener().then(payload => {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          alert(`🚨 ${payload.notification.title}\n${payload.notification.body}`);
      }).catch(err => console.log('failed: ', err));

  }, [API_URL, deviceId]);


  // 🇮🇳 Language Toggle
  const toggleLang = () => {
      haptic();
      const newLang = currentLang === 'en' ? 'hi' : 'en';
      setLanguage(newLang);
      setCurrentLang(newLang);
  };

  // 📱 PWA Install Handler
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(prev => prev ? prev : e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    haptic();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const navTo = (path) => { haptic(); navigate(path); };

  // 🔄 Fetch Data
  useEffect(() => {
      const fetchData = async () => {
          const savedHistory = JSON.parse(localStorage.getItem('safebite_history') || '[]');
          setHistory(savedHistory);

          try {
              const userRes = await axios.get(`${API_URL}/api/user/${deviceId}`);
              const today = new Date().toISOString().split('T')[0];
              const log = userRes.data.data.dailyLog.find(l => l.date === today);
              setTodayScore(log ? log.totalPoisonScore : 0);

              const alertRes = await axios.get(`${API_URL}/api/alerts`);
              setAlerts(alertRes.data.data);
          } catch (e) { console.error("Error fetching home data:", e); }
      };
      fetchData();
  }, [API_URL, deviceId]);

  const openHistory = (item) => {
      haptic();
      navigate('/result', { state: { product: item.fullData, barcode: item.barcode } });
  };

  const clearHistory = () => {
      if(confirm(currentLang === 'hi' ? 'इतिहास मिटाएं?' : 'Clear History?')) {
          localStorage.removeItem('safebite_history');
          setHistory([]);
          haptic();
      }
  };

  if (loading) return <SplashScreen />;

  return (
    // ✅ FIX 2: Added 'pb-28' here specifically for Home Page scrolling
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-brand-bg pt-28 pb-28 safe-bottom">
      <TopBar currentLang={currentLang} toggleLang={toggleLang} />

      {/* ALERTS */}
      {alerts.length > 0 && (
          <div className="fixed top-20 left-0 w-full z-30 p-2 space-y-2 pointer-events-none safe-top flex flex-col items-center">
              {alerts.map(alert => (
                  <div key={alert._id} className={`pointer-events-auto w-full max-w-md flex items-start gap-3 p-3 rounded-xl shadow-xl border-l-4 animate-slide-down backdrop-blur-md mx-2 mt-1 ${alert.level === 'emergency' ? 'bg-red-600/95 text-white border-red-900' : alert.level === 'warning' ? 'bg-yellow-100/95 text-yellow-900 border-yellow-500' : 'bg-blue-100/95 text-blue-900 border-blue-500'}`}>
                      <div className="mt-1 flex-shrink-0">
                          {alert.level === 'emergency' && <AlertTriangle size={20} className="text-white" />}
                          {alert.level === 'warning' && <Bell size={20} />}
                          {alert.level === 'info' && <Info size={20} />}
                      </div>
                      <div>
                          <h4 className="font-bold text-sm uppercase tracking-wide leading-tight">{alert.title}</h4>
                          <p className="text-xs opacity-90 mt-1 leading-snug">{alert.message}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* SCORE CARD */}
      <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between mb-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${todayScore > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <Activity size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{currentLang === 'hi' ? 'दैनिक जहर' : "Today's Poison"}</p>
                <div className="flex items-baseline gap-1">
                    <p className={`text-3xl font-black ${todayScore > 50 ? 'text-red-600' : 'text-brand-dark'}`}>{todayScore}</p>
                    <span className="text-gray-300 text-sm font-bold">/100</span>
                </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${todayScore > 50 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {todayScore > 50 ? 'DANGER' : 'SAFE'}
          </div>
      </div>

      {/* HERO TEXT */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-brand-dark tracking-tighter">
            {currentLang === 'hi' ? 'नमस्ते' : 'Hello'}, <span className="text-brand-green">User</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
            {currentLang === 'hi' ? 'आज आप क्या खा रहे हैं?' : 'What are you eating today?'}
        </p>
      </div>

      {/* HISTORY */}
      {history.length > 0 && (
          <div className="w-full max-w-md mb-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-3 px-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> Recent
                  </h3>
                  <button onClick={clearHistory} className="text-[10px] text-red-400 font-bold hover:text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">
                      <Trash2 size={10} /> CLEAR
                  </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                  {history.map((item, idx) => (
                      <div key={idx} onClick={() => openHistory(item)} className="snap-start flex-shrink-0 w-20 flex flex-col items-center gap-2 cursor-pointer group">
                          <div className={`w-16 h-16 rounded-2xl p-0.5 border-2 shadow-sm transition-transform group-active:scale-95 ${item.status === 'RED' ? 'border-red-500' : item.status === 'GREEN' ? 'border-brand-green' : 'border-yellow-500'}`}>
                              <img src={item.image || "https://placehold.co/50"} className="w-full h-full object-cover rounded-[14px]" />
                          </div>
                          <p className="text-[10px] font-bold text-gray-600 truncate w-full text-center leading-tight">
                              {item.name ? item.name.split(' ')[0] : 'Unknown'}
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* BUTTONS */}
      <div className="w-full max-w-md space-y-4 px-2 pb-32">
        <button onClick={() => navTo('/scan')} className="w-full bg-brand-dark text-white font-bold py-6 px-6 rounded-3xl shadow-2xl flex items-center justify-between group transition-all transform hover:scale-[1.02] active:scale-95">
          <div className="flex items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-2xl group-hover:bg-gray-700 transition-colors">
                <Scan size={28} className="text-brand-green" />
              </div>
              <div className="text-left">
                  <p className="text-lg leading-none">{currentLang === 'hi' ? 'स्कैन शुरू करें' : 'Scan Food'}</p>
                  <p className="text-xs text-gray-400 font-normal mt-1">Check for toxins & allergies</p>
              </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <Scan size={16} />
          </div>
        </button>

        <button onClick={() => navTo('/library')} className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-5 px-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group transition-all active:scale-95">
          <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <Search size={24} className="text-brand-blue" />
              </div>
              <div className="text-left">
                  <p className="text-lg leading-none">{currentLang === 'hi' ? 'जहर लाइब्रेरी' : 'Poison Library'}</p>
                  <p className="text-xs text-gray-400 font-normal mt-1">Reverse search ingredients</p>
              </div>
          </div>
        </button>
      </div>
      
      {/* PWA INSTALL */}
      {deferredPrompt && (
        <button onClick={handleInstallClick} className="fixed bottom-28 right-5 z-50 bg-brand-dark text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce font-bold border border-gray-800 safe-bottom">
          <Download size={20} /> Install App
        </button>
      )}

      <p className="mt-4 text-xs font-bold tracking-widest text-gray-300 uppercase">HealthyBite v1.0</p>
    </div>
  );
};

// --- MAIN APP ROUTING ---
function App() {
  return (
    // ✅ FIX 1: GLOBAL FIX - Added 'pb-28' here. 
    // This pushes ALL content up, so Profile, Result, etc. won't hide behind the Bottom Nav.
    <div className="min-h-screen bg-brand-bg text-sans pb-28">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/result" element={<Result />} />
        <Route path="/profile" element={<HealthProfile />} />
        <Route path="/library" element={<PoisonLibrary />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* New Route */}
        </Routes>

        <BottomNav />
    </div>
  );
}

export default App;