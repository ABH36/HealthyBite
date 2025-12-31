import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    // ✅ FIX 1: Removed 'pb-32' (Handled by App.js)
    // ✅ FIX 2: Added 'safe-top' so Back button doesn't hit iPhone Notch
    <div className="min-h-screen bg-brand-bg p-6 safe-top">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center gap-2 text-gray-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-brand-dark mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Last Updated: Dec 2025</p>
        
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-800 text-lg mb-2">1. Introduction</h2>
            <p>Welcome to HealthyBite. We are committed to protecting your personal information and your right to privacy.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 text-lg mb-2">2. Information We Collect</h2>
            <p>We collect minimal data necessary for the app to function:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Device ID (for saving your scan history locally).</li>
                <li>Camera access (strictly for scanning barcodes).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 text-lg mb-2">3. How We Use Your Data</h2>
            <p>Your data is used solely to provide food safety analysis. We do not sell or share your personal data with third parties.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 text-lg mb-2">4. Contact Us</h2>
            <p>If you have any questions, please contact us at support@healthybite.in</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;