/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, Users, Phone, FileText, Droplet, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_ICONS = {
    PENDING: <Clock className="w-3.5 h-3.5" />,
    APPROVED: <CheckCircle className="w-3.5 h-3.5" />,
    REJECTED: <XCircle className="w-3.5 h-3.5" />,
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const emptyForm = {
    name: '', description: '', address: '', city: '', state: 'Gujarat',
    date: '', startTime: '', endTime: '', totalSlots: 100,
    bloodGroupsNeeded: [], contactPhone: '', lat: '', lng: ''
};

const OrgDashboard = () => {
    const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState('create');
    const [camps, setCamps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const fetchMyCamps = async () => {
        try {
            const res = await api.get('/org/camps/my');
            if (res.data.status === 'success') setCamps(res.data.camps);
        } catch {
            toast.error('Could not load your camps.');
        }
    };

    useEffect(() => {
        fetchMyCamps();
    }, []);

    const toggleBloodGroup = (bg) => {
        setForm(f => ({
            ...f,
            bloodGroupsNeeded: f.bloodGroupsNeeded.includes(bg)
                ? f.bloodGroupsNeeded.filter(x => x !== bg)
                : [...f.bloodGroupsNeeded, bg]
        }));
    };

    const submitCamp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/org/camps', {
                ...form,
                bloodGroupsNeeded: form.bloodGroupsNeeded.join(','),
                lat: form.lat ? parseFloat(form.lat) : null,
                lng: form.lng ? parseFloat(form.lng) : null,
            });
            toast.success('Camp submitted for admin approval! Location automatically set based on city.');
            setForm(emptyForm);
            setActiveSection('my-camps');
            fetchMyCamps();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit camp.');
        } finally {
            setIsLoading(false);
        }
    };

    const tabVars = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10 }
    };

    const approvedCount = camps.filter(c => c.status === 'APPROVED').length;
    const pendingCount = camps.filter(c => c.status === 'PENDING').length;

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col md:flex-row relative">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Sidebar */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-72 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col z-10 md:min-h-[calc(100vh-80px)] border-r border-indigo-700/50 shadow-xl">
                <div className="p-8 hidden md:block">
                    <div className="flex items-center gap-3 mb-1">
                        <Building2 className="w-6 h-6 text-indigo-300" />
                        <h2 className="text-xl font-bold brand-font text-white/90">Org Dashboard</h2>
                    </div>
                    <p className="text-indigo-300 text-sm truncate">{user?.orgName || user?.name}</p>
                </div>

                <nav className="flex md:flex-col gap-2 p-4 md:p-5 overflow-x-auto">
                    {[
                        { id: 'overview', icon: Building2, label: 'Overview' },
                        { id: 'create', icon: Plus, label: 'Create Camp' },
                        { id: 'my-camps', icon: Calendar, label: 'My Camps' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium whitespace-nowrap
                                ${activeSection === item.id
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}>
                            <item.icon className="w-5 h-5" /> {item.label}
                        </button>
                    ))}
                </nav>
            </motion.div>

            {/* Content */}
            <div className="flex-grow p-6 md:p-12 z-10 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW */}
                    {activeSection === 'overview' && (
                        <motion.div key="overview" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 brand-font mb-2">
                                Welcome, {user?.orgName || user?.name}! 🏥
                            </h1>
                            <p className="text-gray-500 mb-10">Manage your blood donation camps. Create new camps for admin approval.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {[
                                    { label: 'Total Camps', value: camps.length, color: 'text-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50' },
                                    { label: 'Approved', value: approvedCount, color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50' },
                                    { label: 'Pending Review', value: pendingCount, color: 'text-yellow-600', border: 'border-yellow-200', bg: 'bg-yellow-50' },
                                ].map(stat => (
                                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className={`bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border ${stat.border}`}>
                                        <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 border ${stat.border}`}>
                                            <Calendar className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">{stat.label}</p>
                                        <h2 className={`text-5xl font-black mt-2 brand-font ${stat.color}`}>{stat.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 brand-font text-xl mb-6">Quick Actions</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <button onClick={() => setActiveSection('create')}
                                        className="p-6 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 flex items-center gap-4 hover:bg-indigo-600 hover:text-white transition-all group text-left">
                                        <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center group-hover:bg-white/20 shrink-0">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">Create New Camp</div>
                                            <div className="text-sm opacity-80 mt-0.5">Submit a camp for admin approval</div>
                                        </div>
                                    </button>
                                    <button onClick={() => setActiveSection('my-camps')}
                                        className="p-6 bg-gray-50 text-gray-700 rounded-2xl border border-gray-200 flex items-center gap-4 hover:bg-gray-900 hover:text-white transition-all group text-left">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:bg-white/20 shrink-0">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">View My Camps</div>
                                            <div className="text-sm opacity-80 mt-0.5">Track approval status</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE CAMP */}
                    {activeSection === 'create' && (
                        <motion.div key="create" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-2xl">
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 brand-font">Create Donation Camp</h2>
                            <p className="text-gray-500 mb-8">Fill in the details. Your camp will be reviewed and approved by the admin.</p>

                            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
                                <form className="space-y-6" onSubmit={submitCamp}>
                                    {/* Camp Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Camp Name</label>
                                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            placeholder="e.g. Ahmedabad Civil Blood Drive" />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                            placeholder="Brief description about the camp..." />
                                    </div>

                                    {/* Date & Times */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Date</label>
                                            <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                                            <input required type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">End Time</label>
                                            <input required type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                        </div>
                                    </div>

                                    {/* Address & City */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                                placeholder="e.g. Civil Hospital, Asarwa, Ahmedabad" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">City</label>
                                            <div className="relative">
                                                <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    placeholder="e.g. Ahmedabad, Surat, Vadodara..." 
                                                    list="cities" />
                                                <datalist id="cities">
                                                    <option value="Ahmedabad" />
                                                    <option value="Surat" />
                                                    <option value="Vadodara" />
                                                    <option value="Rajkot" />
                                                    <option value="Gandhinagar" />
                                                    <option value="Bhavnagar" />
                                                    <option value="Jamnagar" />
                                                    <option value="Junagadh" />
                                                    <option value="Anand" />
                                                    <option value="Bharuch" />
                                                    <option value="Patan" />
                                                    <option value="Morbi" />
                                                    <option value="Mumbai" />
                                                    <option value="Delhi" />
                                                    <option value="Bangalore" />
                                                    <option value="Chennai" />
                                                    <option value="Pune" />
                                                </datalist>
                                                {form.city && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <MapPin className="w-3 h-3 text-green-500" />
                                                            <span className="text-green-600 font-medium">Auto-located</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {form.city && (
                                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    Location will be automatically set on map for {form.city}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Total Slots</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="number" min="10" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="tel" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="+91 00000 00000" />
                                        </div>
                                    </div>

                                    {/* Blood Groups Needed */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Blood Groups Needed</label>
                                        <div className="flex flex-wrap gap-2">
                                            {BLOOD_GROUPS.map(bg => (
                                                <button type="button" key={bg} onClick={() => toggleBloodGroup(bg)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all ${form.bloodGroupsNeeded.includes(bg)
                                                        ? 'bg-red-600 text-white border-red-600 shadow-lg'
                                                        : 'bg-red-50 text-red-700 border-red-100 hover:border-red-300'}`}>
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 mt-2">
                                        {isLoading ? 'Submitting...' : 'Submit for Admin Approval'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* MY CAMPS */}
                    {activeSection === 'my-camps' && (
                        <motion.div key="my-camps" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl">
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 brand-font">My Camps</h2>
                            <p className="text-gray-500 mb-8">Track the status of all your submitted donation camps.</p>

                            {camps.length === 0 ? (
                                <div className="bg-white/80 rounded-3xl border border-gray-100 p-20 text-center">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="font-bold text-gray-500">No camps yet</h3>
                                    <p className="text-gray-400 text-sm mt-1">Create your first donation camp to get started.</p>
                                    <button onClick={() => setActiveSection('create')}
                                        className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Create Camp
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {camps.map(camp => (
                                        <motion.div key={camp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start flex-wrap gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                                        <h3 className="font-black text-gray-900 text-lg brand-font">{camp.name}</h3>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[camp.status]}`}>
                                                            {STATUS_ICONS[camp.status]} {camp.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-400" />{(() => {
                                                            const d = new Date(camp.date);
                                                            return (camp.date && !isNaN(d.getTime())) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA';
                                                        })()}</span>
                                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" />{camp.startTime} – {camp.endTime}</span>
                                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" />{camp.city}</span>
                                                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" />{camp.totalSlots} slots</span>
                                                    </div>
                                                    {camp.status === 'REJECTED' && camp.adminNote && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700">
                                                            <span className="font-bold">Admin note:</span> {camp.adminNote}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrgDashboard;
