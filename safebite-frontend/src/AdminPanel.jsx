import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShieldAlert, CheckCircle, XCircle, Bell, Trash2, 
    Lightbulb, Database, Server, Package, Plus 
} from 'lucide-react'; // ✅ Added Package, Plus icons
import { getDeviceId } from './utils/device'; 

const AdminPanel = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // 🔒 SECURITY STATE
    const [adminKey, setAdminKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [cooldown, setCooldown] = useState(false); 

    // DATA STATE
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [backups, setBackups] = useState([]); // 💾 Backup State
    const [activeTab, setActiveTab] = useState('inventory'); // ✅ Default set to Inventory for now

    // FORMS STATE
    const [newAlert, setNewAlert] = useState({
        title: '', message: '', level: 'info', expiryHours: 24, isNational: true, city: ''
    });

    const [card, setCard] = useState({ 
        title: '', poisonName: '', damage: '', tip: '', type: 'did_you_know', language: 'en' 
    });

    // 📦 NEW PRODUCT STATE (Added this)
    const [newProduct, setNewProduct] = useState({
        barcode: '', name: '', brand: '', riskLevel: 'SAFE', 
        ingredients: '', poisonScore: 0, description: ''
    });

    // 🛡️ CONFIG
    const getConfig = (key) => ({ 
        headers: { 
            'x-admin-secret': key || adminKey,
            'x-device-id': getDeviceId() 
        } 
    });

    // FETCH DATA
    const fetchAdminData = async (key) => {
        try {
            const config = getConfig(key);
            const statsRes = await axios.get(`${API_URL}/api/admin/stats`, config);
            setStats(statsRes.data.stats);

            const reportsRes = await axios.get(`${API_URL}/api/admin/reports`, config);
            setReports(reportsRes.data.data || []);

            const alertsRes = await axios.get(`${API_URL}/api/admin/alerts-history`, config);
            setAlerts(alertsRes.data?.data || []);
            
            setLoading(false);
        } catch (error) {
            console.error("Access Denied", error);
            alert("❌ Unauthorized! Check VITE_ADMIN_SECRET or Device ID.");
            navigate('/'); 
        }
    };

    // 🛡️ AUTO-LOGIN
    useEffect(() => {
        sessionStorage.setItem("sb_admin_logged", "true");
        const secret = import.meta.env.VITE_ADMIN_SECRET;
        const isSessionValid = sessionStorage.getItem("sb_admin_logged") === "true";

        if (!secret || !isSessionValid) {
            alert("⚠️ Admin Security Check Failed!");
            navigate('/');
        } else {
            setAdminKey(secret);
            fetchAdminData(secret);
        }
        return () => sessionStorage.removeItem("sb_admin_logged");
    }, []);

    // 💾 BACKUP LOGIC
    const fetchBackups = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/backup/list`, getConfig());
            setBackups(res.data.data);
        } catch (e) { console.error("Backup fetch error", e); }
    };

    const handleBackup = async () => {
        if (cooldown) return;
        setCooldown(true);
        try {
            const res = await axios.get(`${API_URL}/api/backup/now`, getConfig());
            alert(`✅ ${res.data.message}\nFile: ${res.data.file}`);
            fetchBackups();
        } catch (e) { alert("Backup Failed"); }
        setTimeout(() => setCooldown(false), 2000);
    };

    // Load backups when System tab opens
    useEffect(() => {
        if (activeTab === 'system') fetchBackups();
    }, [activeTab]);


    // --- ACTIONS ---

    // 🔥 NEW: HANDLE ADD PRODUCT
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (cooldown) return;
        setCooldown(true);
        try {
            // Using getConfig() to send admin secret headers
            await axios.post(`${API_URL}/api/products`, newProduct, getConfig());
            alert(`✅ Product Added: ${newProduct.name}`);
            setNewProduct({
                barcode: '', name: '', brand: '', riskLevel: 'SAFE', 
                ingredients: '', poisonScore: 0, description: ''
            });
        } catch (error) {
            console.error("Add Product Error:", error);
            alert("Failed to add product.");
        }
        setTimeout(() => setCooldown(false), 1000);
    };

    const handleReportAction = async (id, status) => {
        if (cooldown) return;
        setCooldown(true);
        try {
            await axios.put(`${API_URL}/api/admin/report/${id}`, { status }, getConfig());
            fetchAdminData(adminKey);
        } catch (error) { alert("Action failed"); }
        setTimeout(() => setCooldown(false), 1200);
    };

    const publishAlert = async (e) => {
        e.preventDefault();
        if (cooldown) return;
        setCooldown(true);
        try {
            await axios.post(`${API_URL}/api/admin/alert`, { ...newAlert, expiryHours: Number(newAlert.expiryHours) }, getConfig());
            alert("🚨 Alert Published!");
            setNewAlert({ title: '', message: '', level: 'info', expiryHours: 24, isNational: true, city: '' });
            fetchAdminData(adminKey);
        } catch (error) { alert("Failed to publish alert"); }
        setTimeout(() => setCooldown(false), 2000);
    };

    const deleteAlert = async (id) => {
        if(!confirm("Delete this alert?")) return;
        if (cooldown) return;
        setCooldown(true);
        try {
            await axios.delete(`${API_URL}/api/admin/alert/${id}`, getConfig());
            fetchAdminData(adminKey);
        } catch (error) { alert("Failed delete"); }
        setTimeout(() => setCooldown(false), 1000);
    };

    const publishCard = async (e) => {
        e.preventDefault();
        if (cooldown) return;
        setCooldown(true);
        try {
            await axios.post(`${API_URL}/api/content/card`, card, getConfig());
            alert("🧠 Education Card Live!");
            setCard({ title: '', poisonName: '', damage: '', tip: '', type: 'did_you_know', language: 'en' });
        } catch (e) { alert("Failed to publish card"); }
        setTimeout(() => setCooldown(false), 1500);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">verifying secured connection...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-10 font-sans">
            {/* Header */}
            <div className="bg-gray-800 p-4 shadow-lg flex flex-col md:flex-row items-center justify-between border-b border-gray-700 sticky top-0 z-20 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-700">
                        <ArrowLeft size={24} className="text-gray-300" />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> Control Room
                    </h1>
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {/* ✅ ADDED INVENTORY BUTTON */}
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='inventory' ? 'bg-green-600' : 'bg-gray-700'}`}>
                        <Package size={14} /> Inventory
                    </button>

                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab==='reports' ? 'bg-blue-600' : 'bg-gray-700'}`}>Reports</button>
                    <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab==='alerts' ? 'bg-red-600' : 'bg-gray-700'}`}>Alerts</button>
                    <button onClick={() => setActiveTab('education')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='education' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                        <Lightbulb size={14} /> Education
                    </button>
                    <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab==='system' ? 'bg-orange-600' : 'bg-gray-700'}`}>
                        <Server size={14} /> System
                    </button>
                </div>
            </div>

            <div className="p-5 max-w-5xl mx-auto space-y-8">
                
                {/* STATS OVERVIEW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase">Total Scans</p>
                        <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-red-900/50 text-center">
                        <p className="text-red-400 text-xs font-bold uppercase">Dangerous</p>
                        <p className="text-2xl font-bold text-red-500">{stats?.dangerousProducts || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-blue-900/50 text-center">
                        <p className="text-blue-400 text-xs font-bold uppercase">Active Alerts</p>
                        <p className="text-2xl font-bold text-blue-500">{stats?.activeAlerts || 0}</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-xl border border-purple-900/50 text-center">
                        <p className="text-purple-400 text-xs font-bold uppercase">Status</p>
                        <p className="text-lg font-bold text-green-500 flex justify-center items-center gap-1">
                            SECURE <CheckCircle size={14}/>
                        </p>
                    </div>
                </div>

                {/* --- ✅ NEW TAB: INVENTORY --- */}
                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        {/* ADD FORM */}
                        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-3xl border border-gray-700 h-fit">
                            <div className="flex items-center gap-2 mb-6 text-green-500">
                                <Package size={24} />
                                <h2 className="text-xl font-bold">Add New Product</h2>
                            </div>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold ml-1">Barcode</label>
                                    <input required value={newProduct.barcode} onChange={e=>setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-600 focus:border-green-500 text-white outline-none" placeholder="e.g. 890123..." />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold ml-1">Name</label>
                                    <input required value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-600 text-white outline-none" placeholder="e.g. Coca Cola" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold ml-1">Risk</label>
                                        <select value={newProduct.riskLevel} onChange={e=>setNewProduct({...newProduct, riskLevel: e.target.value})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-600 text-white outline-none">
                                            <option value="SAFE">SAFE 🟢</option>
                                            <option value="MODERATE">MODERATE 🟡</option>
                                            <option value="HIGH">HIGH 🔴</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold ml-1">Score (0-100)</label>
                                        <input type="number" value={newProduct.poisonScore} onChange={e=>setNewProduct({...newProduct, poisonScore: e.target.value})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-600 text-white outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold ml-1">Ingredients</label>
                                    <textarea value={newProduct.ingredients} onChange={e=>setNewProduct({...newProduct, ingredients: e.target.value})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-600 text-white outline-none h-24" placeholder="Sugar, Water..." />
                                </div>
                                <button type="submit" disabled={cooldown} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={20} /> {cooldown ? 'Adding...' : 'ADD TO DATABASE'}
                                </button>
                            </form>
                        </div>
                        {/* INSTRUCTIONS */}
                        <div className="lg:col-span-2 bg-gray-800/50 p-8 rounded-3xl border border-gray-700 border-dashed flex flex-col items-center justify-center text-center">
                            <Package size={64} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">Database Manager</h3>
                            <p className="text-gray-500 max-w-md mt-2">
                                Add products here to populate the Live Database. Once added, users can scan them instantly.
                            </p>
                        </div>
                    </div>
                )}

                {/* --- TAB: REPORTS --- */}
                {activeTab === 'reports' && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-lg font-bold text-gray-300">Pending User Reports</h2>
                        {reports.length === 0 && <p className="text-gray-500 italic">No pending reports.</p>}
                        {reports.map((report) => (
                            <div key={report._id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white">{report.productName || "Product"}</h3>
                                        <span className="text-xs text-gray-400 bg-gray-900 px-1 rounded">{report.barcode}</span>
                                    </div>
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-bold">{report.issueType}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-4 bg-gray-900 p-3 rounded-lg">"{report.description}"</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleReportAction(report._id, 'Resolved')} disabled={cooldown} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><CheckCircle size={16} /> Approve</button>
                                    <button onClick={() => handleReportAction(report._id, 'Rejected')} disabled={cooldown} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><XCircle size={16} /> Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB: ALERTS --- */}
                {activeTab === 'alerts' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-800 p-5 rounded-xl border border-red-500/30">
                            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                <Bell size={20} /> Publish National Alert
                            </h2>
                            <form onSubmit={publishAlert} className="space-y-3">
                                <input type="text" placeholder="Alert Title" required
                                    value={newAlert.title} onChange={e=>setNewAlert({...newAlert, title: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-red-500 outline-none"
                                />
                                <textarea placeholder="Message..." required
                                    value={newAlert.message} onChange={e=>setNewAlert({...newAlert, message: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-red-500 outline-none h-24"
                                />
                                <div className="flex gap-3">
                                    <select value={newAlert.level} onChange={e=>setNewAlert({...newAlert, level: e.target.value})} className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white flex-1">
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                    <select value={newAlert.expiryHours} onChange={e=>setNewAlert({...newAlert, expiryHours: e.target.value})} className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white flex-1">
                                        <option value="6">6 Hrs</option>
                                        <option value="24">24 Hrs</option>
                                        <option value="48">48 Hrs</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={cooldown} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white shadow-lg shadow-red-900/50 transition-all">
                                    {cooldown ? 'Publishing...' : 'PUBLISH ALERT'}
                                </button>
                            </form>
                        </div>
                        {/* Alerts List */}
                         <h2 className="text-lg font-bold text-gray-300">Active History</h2>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert._id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{alert.title} <span className="text-gray-400 text-xs">({alert.level})</span></h3>
                                        <p className="text-xs text-gray-500">Expires: {new Date(alert.expiresAt).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => deleteAlert(alert._id)} disabled={cooldown} className="bg-gray-700 p-2 rounded-lg hover:bg-red-900 text-red-400 disabled:opacity-50">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: EDUCATION --- */}
                {activeTab === 'education' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-800 p-5 rounded-xl border border-purple-500/30">
                            <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                                <Lightbulb size={20} /> Create Daily Health Card
                            </h2>
                            <form onSubmit={publishCard} className="space-y-3">
                                <input type="text" placeholder="Title (e.g. The Sugar Trap)" required 
                                    value={card.title} onChange={e=>setCard({...card, title: e.target.value})} 
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none" 
                                />
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Poison (e.g. Palm Oil)" required 
                                        value={card.poisonName} onChange={e=>setCard({...card, poisonName: e.target.value})} 
                                        className="flex-1 bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none" 
                                    />
                                    <select value={card.type} onChange={e=>setCard({...card, type: e.target.value})} className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none">
                                        <option value="did_you_know">Did You Know</option>
                                        <option value="alert">Alert</option>
                                        <option value="myth_buster">Myth Buster</option>
                                    </select>
                                    <select value={card.language} onChange={e=>setCard({...card, language: e.target.value})} className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none">
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Damage (e.g. Blocks Arteries)" required 
                                    value={card.damage} onChange={e=>setCard({...card, damage: e.target.value})} 
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none" 
                                />
                                <textarea placeholder="Pro Tip (e.g. Eat Ghee instead)" required 
                                    value={card.tip} onChange={e=>setCard({...card, tip: e.target.value})} 
                                    className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white h-24 focus:border-purple-500 outline-none" 
                                />
                                <button type="submit" disabled={cooldown} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white shadow-lg shadow-purple-900/50 transition-all">
                                    {cooldown ? 'Processing...' : 'PUBLISH CARD'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- TAB: SYSTEM (BACKUP) --- */}
                {activeTab === 'system' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Disaster Recovery</h2>
                            <p className="text-gray-400 mb-6">Create a full snapshot of the SafeBite Database.</p>
                            
                            <button onClick={handleBackup} disabled={cooldown} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50">
                                <Database size={24} /> {cooldown ? 'Backing up...' : 'BACKUP DATABASE NOW'}
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-300">Backup History</h3>
                        <div className="space-y-2">
                            {backups.length === 0 && <p className="text-gray-500 italic">No backups found.</p>}
                            {backups.map((file, idx) => (
                                <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                                    <span className="font-mono text-sm text-gray-300">{file}</span>
                                    <span className="text-xs text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">SECURE JSON</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminPanel;