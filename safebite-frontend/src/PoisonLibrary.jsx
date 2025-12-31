import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Skull, AlertTriangle, CheckCircle } from 'lucide-react';

const PoisonLibrary = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(false);
    
    // Mobile Keyboard ko band karne ke liye
    document.activeElement.blur(); 

    try {
      // ✅ FIX 1: Correct API Path (products with 's')
      const res = await axios.get(`${API_URL}/api/products/search-ingredient?query=${query}`);
      setResults(res.data.data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  return (
    // ✅ FIX 2: Removed internal padding bottom to rely on Global App Padding
    <div className="w-full bg-gray-50 min-h-full pt-20">
      
      {/* ✅ FIX 3: Added 'safe-top' for iPhone Notch safety */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10 safe-top">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2 text-purple-600">
          <Skull /> Poison Library
        </h1>
      </div>

      <div className="p-5">
        <form onSubmit={handleSearch} className="relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search poison like Sugar, Palm Oil..."
            className="w-full p-4 pl-12 rounded-xl border shadow-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            // ✅ FIX 4: Better Mobile Keyboard
            enterKeyHint="search"
            inputMode="search"
          />
          <Search className="absolute left-4 top-4 text-gray-400" />
          <button type="submit" className="absolute right-2 top-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">
            {searching ? '...' : 'Find'}
          </button>
        </form>
      </div>

      <div className="px-5 space-y-4">
        {searched && results.length === 0 && (
          <div className="text-center py-10 opacity-60">
             <Search size={48} className="mx-auto mb-2 text-gray-300" />
             <p className="text-gray-500">No product contains "{query}"</p>
          </div>
        )}

        {results.map(p => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow border flex gap-4 animate-fade-in-up">
            <img src={p.image || 'https://placehold.co/100'} className="w-20 h-20 rounded-lg object-cover bg-gray-50" alt={p.name} />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 leading-tight">{p.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{p.brand}</p>

              <div className="flex flex-wrap gap-2">
                {p.analysis.status === 'RED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><AlertTriangle size={12}/>DANGEROUS</span>}
                {p.analysis.status === 'YELLOW' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><AlertTriangle size={12}/>MODERATE</span>}
                {p.analysis.status === 'GREEN' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><CheckCircle size={12}/>SAFE</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoisonLibrary;