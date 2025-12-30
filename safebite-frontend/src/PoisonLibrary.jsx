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
    try {
      const res = await axios.get(`${API_URL}/api/product/search-ingredient?query=${query}`);
      setResults(res.data.data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
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
            placeholder="Search poison like Sugar, Palm Oil, Maida..."
            className="w-full p-4 pl-12 rounded-xl border shadow-sm"
          />
          <Search className="absolute left-4 top-4 text-gray-400" />
          <button type="submit" className="absolute right-2 top-2 bg-purple-600 text-white px-4 py-2 rounded-lg">
            {searching ? '...' : 'Find'}
          </button>
        </form>
      </div>

      <div className="px-5 space-y-4">
        {searched && results.length === 0 && (
          <p className="text-center text-gray-400 py-10">No product contains "{query}"</p>
        )}

        {results.map(p => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow border flex gap-4">
            <img src={p.image || 'https://placehold.co/100'} className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-xs text-gray-500">{p.brand}</p>

              <div className="mt-2">
                {p.analysis.status === 'RED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs flex items-center gap-1"><AlertTriangle size={12}/>DANGEROUS</span>}
                {p.analysis.status === 'YELLOW' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs flex items-center gap-1"><AlertTriangle size={12}/>MODERATE</span>}
                {p.analysis.status === 'GREEN' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/>SAFE</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoisonLibrary;
