import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Activity, AlertCircle, Save } from 'lucide-react';
import { getDeviceId } from './utils/device';

const HealthProfile = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const deviceId = getDeviceId();

    const [formData, setFormData] = useState({
        name: '',
        age: '', // React Input needs string/empty initially, handled as Number in onChange
        gender: 'Male',
        conditions: [],
        allergens: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 🔧 TODO: Load from backend in Phase-11 (Doctor/Admin Rules)
    const conditionsList = ['Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Issue', 'High Cholesterol'];
    const allergensList = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish'];

    // 1. Fetch Existing Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/user/${deviceId}`);
                const data = res.data.data;
                setFormData({
                    name: data.name || '',
                    age: data.healthProfile?.age || '',
                    gender: data.healthProfile?.gender || 'Male',
                    conditions: data.healthProfile?.conditions || [],
                    allergens: data.healthProfile?.allergens || []
                });
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [deviceId, API_URL]);

    // Handle Checkbox Changes
    const toggleSelection = (listType, item) => {
        setFormData(prev => {
            const list = prev[listType];
            if (list.includes(item)) {
                return { ...prev, [listType]: list.filter(i => i !== item) }; // Remove
            } else {
                return { ...prev, [listType]: [...list, item] }; // Add
            }
        });
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API_URL}/api/user/update`, {
                deviceId,
                ...formData,
                age: Number(formData.age) // 🔒 Ensure Backend gets a Number
            });
            alert("Health Profile Saved!");
            navigate('/');
        } catch (error) {
            alert("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">My Health Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-5 space-y-6">
                
                {/* Basic Info */}
                <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                        <User size={20} />
                        <h2>Basic Details</h2>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase">Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full mt-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">Age</label>
                            <input 
                                type="number" 
                                value={formData.age}
                                // 🔧 FIX: Handle Number conversion immediately for state sync
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                className="w-full mt-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="25"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">Gender</label>
                            <select 
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                className="w-full mt-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Conditions */}
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 font-bold mb-4">
                        <Activity size={20} />
                        <h2>Health Conditions</h2>
                    </div>
                    <div className="space-y-3">
                        {conditionsList.map(item => (
                            <label key={item} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                                <input 
                                    type="checkbox"
                                    checked={formData.conditions.includes(item)}
                                    onChange={() => toggleSelection('conditions', item)}
                                    className="w-5 h-5 accent-red-500"
                                />
                                <span className="text-gray-700 font-medium">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Allergens */}
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-orange-500 font-bold mb-4">
                        <AlertCircle size={20} />
                        <h2>Allergies</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allergensList.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggleSelection('allergens', item)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    formData.allergens.includes(item) 
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                                    : 'bg-gray-100 text-gray-500 border border-transparent'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex justify-center items-center gap-2"
                >
                    <Save size={20} />
                    {saving ? "Saving..." : "Save Profile"}
                </button>

            </form>
        </div>
    );
};

export default HealthProfile;