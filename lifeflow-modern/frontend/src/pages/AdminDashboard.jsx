/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity, Users, FileText, CheckCircle,
    Clock3, MapPin, Building2, Calendar, Trash2, Mail,
    Phone, Droplet, User, HandHeart, UserCheck, MessageSquare, Send
} from 'lucide-react';

import api from '../lib/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-[var(--bg-secondary)] backdrop-blur-[40px] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-[var(--shadow)] group hover:border-[var(--accent)]/50 transition-all duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-bl-[100%] z-0 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em]">{label}</p>
            <h2 className="text-5xl font-black text-[var(--text-primary)] brand-font mt-2 tracking-tight">{value ?? '–'}</h2>
        </div>
    </div>
);

const AdminDashboard = () => {
    // const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState('monitor');
    const [stats, setStats] = useState({});
    const [bloodStock, setBloodStock] = useState({});
    const [requests, setRequests] = useState([]);
    const [pendingDonations, setPendingDonations] = useState([]);
    const [pendingCamps, setPendingCamps] = useState([]);
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [profileEdits, setProfileEdits] = useState([]);
    const [supportMessages, setSupportMessages] = useState([]);
    const [replyTexts, setReplyTexts] = useState({});
    const [isLoading, setIsLoading] = useState(false);


    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/dashboard');
            if (res.data.status === 'success') {
                setStats(res.data.data);
                setBloodStock(res.data.data.stock || {});
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/requests/pending');
            if (res.data.status === 'success') setRequests(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPendingDonations = useCallback(async () => {
        const res = await api.get('/admin/donations/pending');
        if (res.data.status === 'success') setPendingDonations(res.data.data);
    }, []);

    const fetchPendingCamps = useCallback(async () => {
        const res = await api.get('/admin/camps/pending');
        if (res.data.status === 'success') setPendingCamps(res.data.camps);
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            console.log('Fetching users from /admin/users...');
            const res = await api.get('/admin/users');
            console.log('Users response:', res.data);
            if (res.data.status === 'success') {
                setUsers(res.data.users);
                console.log('Users set in state:', res.data.users);
            } else {
                console.error('Failed to fetch users:', res.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error response:', error.response?.data);
        }
    }, []);

    const fetchOrgs = useCallback(async () => {
        const res = await api.get('/admin/organizations');
        if (res.data.status === 'success') setOrgs(res.data.orgs);
    }, []);

    const fetchProfileEdits = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/profile-edits');
            if (res.data.status === 'success') setProfileEdits(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSupportMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/support/admin');
            if (res.data.status === 'success') setSupportMessages(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);


    // Global dashboard stats polling (for sidebar badges)
    // Runs on mount and every 30 seconds
    useEffect(() => {
        // Initial fetch inside a timeout to avoid synchronous setState warning
        const timer = setTimeout(() => {
            fetchDashboardData();
        }, 0);
        
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [fetchDashboardData]);

    useEffect(() => {
        const loaders = {
            monitor: fetchDashboardData,
            requests: fetchRequests,
            donations: fetchPendingDonations,
            camps: fetchPendingCamps,
            users: fetchUsers,
            organizations: fetchOrgs,
            'profile-edits': fetchProfileEdits,
            support: fetchSupportMessages,
        };

        const load = loaders[activeSection];
        if (load) {
            load().catch(() => toast.error('Failed to load data'));
        }
    }, [activeSection, fetchDashboardData, fetchRequests, fetchPendingDonations, fetchPendingCamps, fetchUsers, fetchOrgs, fetchProfileEdits, fetchSupportMessages]);

    const handleRequestAction = async (id, status) => {
        try {
            await api.put(`/admin/requests/${id}`, { status });
            toast.success(`Request ${status.toLowerCase()}.`);
            fetchRequests();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleDonationAction = async (id, status) => {
        try {
            await api.put(`/admin/donations/${id}`, { status });
            toast.success(`Donation offer ${status.toLowerCase()}.`);
            fetchPendingDonations();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleCampAction = async (id, status) => {
        try {
            const note = status === 'REJECTED' ? prompt('Rejection reason (optional):') : null;
            await api.put(`/admin/camps/${id}`, { status, adminNote: note });
            toast.success(`Camp ${status.toLowerCase()}.`);
            fetchPendingCamps();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleRemoveUser = async (id, name) => {
        if (!confirm(`Remove "${name}" from LifeFlow? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success(`${name} removed.`);
            // Refresh whichever list we're on
            if (activeSection === 'users') fetchUsers();
            else fetchOrgs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove user');
        }
    };

    const handleProfileEditAction = async (id, status) => {
        try {
            await api.put(`/admin/profile-edits/${id}`, { status });
            toast.success(`Profile edit ${status.toLowerCase()}.`);
            fetchProfileEdits();
        } catch { toast.error('Action failed'); }
    };

    const handleSupportReply = async (id) => {
        const reply = replyTexts[id];
        if (!reply) return toast.error('Please enter a reply');
        try {
            setIsLoading(true);
            await api.put(`/support/reply/${id}`, { adminReply: reply });
            toast.success('Reply sent successfully');
            setReplyTexts(prev => ({ ...prev, [id]: '' }));
            fetchSupportMessages();
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSupportResolve = async (id) => {
        try {
            setIsLoading(true);
            await api.put(`/support/resolve/${id}`);
            toast.success('Message marked as resolved');
            fetchSupportMessages();
        } catch (error) {
            toast.error('Failed to resolve message');
        } finally {
            setIsLoading(false);
        }
    };


    const tabVars = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };
    useEffect(() => {
        if (activeSection === 'support') {
            const markRead = async () => {
                try {
                    await api.put('/support/mark-read-admin');
                    // Update local state to hide badges immediately
                    setSupportMessages(prev => prev.map(m => ({ ...m, isReadByAdmin: true })));
                } catch (error) {
                    console.error('Failed to mark admin support as read:', error);
                }
            };
            markRead();
        }
    }, [activeSection]);

    const navItems = [
        { id: 'monitor', icon: Activity, label: 'Live Monitor' },
        { id: 'requests', icon: FileText, label: 'Blood Requests', showBadge: (stats.pendingRequests || 0) > 0 },
        { id: 'donations', icon: HandHeart, label: 'Donation Offers', showBadge: (stats.pendingDonations || 0) > 0 },
        { id: 'camps', icon: MapPin, label: 'Camp Approvals', showBadge: (stats.pendingCamps || 0) > 0 },
        { id: 'profile-edits', icon: UserCheck, label: 'Profile Edits', showBadge: (stats.pendingProfileEdits || 0) > 0 },
        { id: 'support', icon: MessageSquare, label: 'User Support', showBadge: (stats.pendingSupport || 0) > 0 },
        { id: 'users', icon: User, label: 'Users' },
        { id: 'organizations', icon: Building2, label: 'Organizations' },

    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[var(--bg-primary)] flex flex-col md:flex-row relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <img src="/images/sanctuary_bg.png" className="w-full h-full object-cover opacity-[0.03] scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent"></div>
            </div>

            {/* Sidebar */}
            <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-80 bg-slate-950 text-white flex flex-col z-10 md:min-h-[calc(100vh-80px)] border-r border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.4)] relative">
                <div className="p-10 hidden md:block">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
                             <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black brand-font tracking-tighter uppercase">Nexus</h2>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 inline-block">
                        <p className="text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em]">Administrator</p>
                    </div>
                </div>
                <nav className="flex md:flex-col gap-3 p-6 md:p-8 overflow-x-auto">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap relative group
                                ${activeSection === item.id
                                    ? 'bg-white text-slate-950 shadow-2xl shadow-white/10 -translate-y-0.5'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            <div className="relative">
                                <item.icon className={`w-5 h-5 shrink-0 ${activeSection === item.id ? 'text-red-600' : ''}`} />
                                {item.showBadge && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                                )}
                                {item.showBadge && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                )}
                            </div>
                            <span className="hidden md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </motion.div>

            {/* Main Content */}
            <div className="flex-grow p-6 md:p-12 z-10 relative overflow-auto">
                <AnimatePresence mode="wait">

                    {/* MONITOR */}
                    {activeSection === 'monitor' && (
                        <motion.div key="monitor" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] brand-font mb-2 tracking-tight">System Monitor</h1>
                            <p className="text-[var(--text-muted)] mb-12 font-medium max-w-xl">Real-time infrastructure overview and blood supply analytics.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                                <StatCard label="Donors" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
                                <StatCard label="Orgs" value={stats.totalOrgs} icon={Building2} color="bg-indigo-500" />
                                <StatCard label="Pending Requests" value={stats.pendingRequests} icon={Clock3} color="bg-yellow-500" />
                                <StatCard label="Pending Camps" value={stats.pendingCamps} icon={MapPin} color="bg-orange-500" />
                                <StatCard label="Approved Camps" value={stats.approvedCamps} icon={CheckCircle} color="bg-green-500" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-1 bg-[var(--accent)] rounded-full"></div>
                                <h3 className="font-black text-[var(--text-primary)] uppercase tracking-widest text-sm">Blood Stock Inventory</h3>
                            </div>
                            
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                                {Object.entries(bloodStock).map(([bg, qty]) => (
                                    <motion.div 
                                        key={bg} 
                                        whileHover={{ y: -5 }}
                                        className="bg-[var(--bg-secondary)] backdrop-blur-xl rounded-[2rem] border border-[var(--border)] p-6 text-center shadow-sm hover:shadow-[var(--shadow)] transition-all"
                                    >
                                        <div className="text-[var(--accent)] font-black text-2xl brand-font mb-2">{bg}</div>
                                        <div className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">{qty}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-2 uppercase font-black tracking-widest">Units</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* BLOOD REQUESTS */}
                    {activeSection === 'requests' && (
                        <motion.div key="requests" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Blood Requests</h1>
                            <p className="text-[var(--text-muted)] mb-8 font-medium">Approve or reject incoming blood requests from hospitals.</p>
                            
                            <div className="grid gap-6">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Synchronizing Nexus...</div>
                                ) : requests.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl p-16 rounded-[3rem] border border-[var(--border)] text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-lg">
                                            <FileText className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">Zero pending requests</p>
                                    </div>
                                ) : (
                                    requests.map(req => (
                                        <div key={req.id} className="bg-[var(--bg-secondary)] backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:border-[var(--accent)]/40 transition-all group shadow-sm hover:shadow-[var(--shadow)] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-bl-[100%] z-0"></div>
                                            <div className="flex items-start gap-8 relative z-10">
                                                <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-3xl flex flex-col items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)] shadow-2xl transition-all">
                                                    <span className="text-[var(--accent)] font-black text-3xl leading-none tracking-tighter">{req.bloodGroup}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Type</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{req.hospitalName}</h3>
                                                    <div className="flex flex-wrap gap-5">
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em]">
                                                            <MapPin className="w-4 h-4 text-[var(--accent)]" /> {req.city}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em]">
                                                            <Droplet className="w-4 h-4 text-[var(--accent)]" /> {req.units} Units
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 w-full md:w-auto relative z-10 mt-4 md:mt-0">
                                                <button onClick={() => handleRequestAction(req.id, 'REJECTED')}
                                                    className="flex-grow md:flex-none px-8 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                    Dismiss
                                                </button>
                                                <button onClick={() => handleRequestAction(req.id, 'APPROVED')}
                                                    className="flex-grow md:flex-none px-12 py-5 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/40 hover:-translate-y-1 transition-all">
                                                    Validate
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* DONATION OFFERS */}
                    {activeSection === 'donations' && (
                        <motion.div key="donations" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Donation Pipeline</h1>
                            <p className="text-[var(--text-muted)] mb-8 font-medium">Verify and approve new blood donation offers from the community.</p>
                            
                            <div className="grid gap-6">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Scanning Bio-Data...</div>
                                ) : pendingDonations.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl p-16 rounded-[3rem] border border-[var(--border)] text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-lg">
                                            <HandHeart className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">No pending offers</p>
                                    </div>
                                ) : (
                                    pendingDonations.map(don => (
                                        <div key={don.id} className="bg-[var(--bg-secondary)] backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:border-[var(--accent)]/40 transition-all group shadow-sm hover:shadow-[var(--shadow)] relative overflow-hidden">
                                            <div className="flex items-start gap-8 relative z-10">
                                                <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-3xl flex flex-col items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)] shadow-2xl transition-all">
                                                    <span className="text-[var(--accent)] font-black text-3xl leading-none tracking-tighter">{don.bloodGroup}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Group</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{don.user?.name || 'Unknown Donor'}</h3>
                                                    <div className="flex flex-wrap gap-5">
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em]">
                                                            Age: {don.age}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em]">
                                                            Condition: {don.condition || 'Healthy'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 w-full md:w-auto relative z-10 mt-4 md:mt-0">
                                                <button onClick={() => handleDonationAction(don.id, 'REJECTED')}
                                                    className="flex-grow md:flex-none px-8 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                    Reject
                                                </button>
                                                <button onClick={() => handleDonationAction(don.id, 'APPROVED')}
                                                    className="flex-grow md:flex-none px-12 py-5 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/40 hover:-translate-y-1 transition-all">
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* CAMP APPROVALS */}
                    {activeSection === 'camps' && (
                        <motion.div key="camps" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Camp Operations</h1>
                            <p className="text-[var(--text-muted)] mb-8 font-medium">Coordinate and authorize regional donation camps.</p>
                            
                            <div className="grid gap-8">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Triangulating Coordinates...</div>
                                ) : pendingCamps.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl p-16 rounded-[3rem] border border-[var(--border)] text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-lg">
                                            <MapPin className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">No pending camps</p>
                                    </div>
                                ) : (
                                    pendingCamps.map(camp => (
                                        <div key={camp.id} className="bg-[var(--bg-secondary)] backdrop-blur-[60px] p-10 rounded-[3rem] border border-[var(--border)] shadow-xl hover:border-[var(--accent)]/50 transition-all relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-bl-[100%] z-0"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start flex-wrap gap-6 mb-10">
                                                    <div>
                                                        <h3 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-2">{camp.name}</h3>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                                                            <p className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.2em]">
                                                                Organized by {camp.organization?.orgName || camp.organization?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em]">
                                                        Pending Review
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Date</p>
                                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                            <Calendar className="w-4 h-4 text-[var(--accent)]" />
                                                            {(() => {
                                                                const d = new Date(camp.date);
                                                                return (camp.date && !isNaN(d.getTime())) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Time Buffer</p>
                                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                            <Clock3 className="w-4 h-4 text-[var(--accent)]" />
                                                            {camp.startTime} – {camp.endTime}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Location</p>
                                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                            <MapPin className="w-4 h-4 text-[var(--accent)]" />
                                                            {camp.city}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Capacity</p>
                                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                            <Users className="w-4 h-4 text-[var(--accent)]" />
                                                            {camp.totalSlots} Slots
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-[var(--bg-primary)]/50 border border-[var(--border)] p-6 rounded-2xl mb-8">
                                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">{camp.address}</p>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <button onClick={() => handleCampAction(camp.id, 'APPROVED')}
                                                        className="flex-grow bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/40 hover:-translate-y-1 transition-all">
                                                        Authorize Operation
                                                    </button>
                                                    <button onClick={() => handleCampAction(camp.id, 'REJECTED')}
                                                        className="px-10 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* PROFILE EDITS */}
                    {activeSection === 'profile-edits' && (
                        <motion.div key="profile-edits" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Profile Edit Requests</h1>
                            <p className="text-[var(--text-muted)] mb-8 font-medium">Review and validate user profile change requests.</p>
                            
                            <div className="grid gap-6">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Loading Requests...</div>
                                ) : profileEdits.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl p-16 rounded-[3rem] border border-[var(--border)] text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-lg">
                                            <UserCheck className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">No pending profile edits</p>
                                    </div>
                                ) : (
                                    profileEdits.map(req => {
                                        let proposed = {};
                                        try {
                                            proposed = typeof req.proposedData === 'string' ? JSON.parse(req.proposedData) : req.proposedData || {};
                                        } catch(e) { console.error('Error parsing JSON for proposedData', e); }
                                        return (
                                        <div key={req.id} className="bg-[var(--bg-secondary)] backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group shadow-sm hover:shadow-[var(--shadow)] relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                            
                                            <div className="flex gap-8 items-center w-full md:w-auto overflow-hidden">
                                                {/* Visual Avatar comparison if provided */}
                                                <div className="flex gap-4 items-center shrink-0">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 rounded-[1rem] bg-[var(--bg-primary)] border border-rose-500/30 overflow-hidden mb-2">
                                                            {req.user?.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-4 text-[var(--text-muted)]"/>}
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase text-rose-500">Current</span>
                                                    </div>
                                                    <div className="w-8 h-0 border-t border-dashed border-[var(--text-muted)]"></div>
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 rounded-[1rem] bg-[var(--bg-primary)] border border-green-500/50 overflow-hidden mb-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                                             {proposed.avatar ? <img src={proposed.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-4 text-[var(--text-muted)]"/>}
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase text-green-500">Proposed</span>
                                                    </div>
                                                </div>

                                                {/* Textual comparison */}
                                                <div className="space-y-3 flex-grow min-w-0">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="truncate">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Name</p>
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{req.user?.name}</p>
                                                            {proposed.name && proposed.name !== req.user?.name && (
                                                                <p className="text-sm font-bold text-green-500 truncate mt-1">→ {proposed.name}</p>
                                                            )}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Phone</p>
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{req.user?.phone || 'None'}</p>
                                                            {proposed.phone && proposed.phone !== req.user?.phone && (
                                                                <p className="text-sm font-bold text-green-500 truncate mt-1">→ {proposed.phone}</p>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2 truncate">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Location</p>
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{req.user?.city || 'No City'}, {req.user?.state || 'No State'}</p>
                                                            {(proposed.city || proposed.state) && (proposed.city !== req.user?.city || proposed.state !== req.user?.state) && (
                                                                <p className="text-sm font-bold text-green-500 truncate mt-1">→ {proposed.city || req.user?.city}, {proposed.state || req.user?.state}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                                                <button onClick={() => handleProfileEditAction(req.id, 'REJECTED')}
                                                    className="flex-grow md:flex-none px-6 py-4 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                    Reject
                                                </button>
                                                <button onClick={() => handleProfileEditAction(req.id, 'APPROVED')}
                                                    className="flex-grow md:flex-none px-8 py-4 rounded-xl bg-green-500 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/30 hover:-translate-y-1 transition-all">
                                                    Accept
                                                </button>
                                            </div>

                                        </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* USERS */}
                    {activeSection === 'users' && (
                        <motion.div key="users" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Subject Registry</h1>
                                    <p className="text-[var(--text-muted)] font-medium">Directory of all registered donors and users.</p>
                                </div>
                                <button onClick={fetchUsers} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-all group">
                                    <Activity className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                            
                            {isLoading ? (
                                <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Retrieving Profiles...</div>
                            ) : users.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)]/50 p-20 rounded-[3rem] border border-[var(--border)] text-center">
                                    <Users className="w-16 h-16 mx-auto mb-6 text-[var(--text-muted)] opacity-20" />
                                    <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">Registry is empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map(u => (
                                        <motion.div key={u.id} whileHover={{ y: -8 }}
                                            className="bg-[var(--bg-secondary)] backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border)] group-hover:bg-[var(--accent)] transition-all">
                                                    <User className="w-6 h-6 text-[var(--text-primary)] group-hover:text-white" />
                                                </div>
                                                <button onClick={() => handleRemoveUser(u.id, u.name)}
                                                    className="p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-4">{u.name}</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate">
                                                    <Mail className="w-3.5 h-3.5 text-[var(--accent)]" /> {u.email}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                                    <Droplet className="w-3.5 h-3.5 text-[var(--accent)]" /> Blood {u.bloodGroup || 'NA'}
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
                                                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Type</span>
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Donor</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ORGANIZATIONS */}
                    {activeSection === 'organizations' && (
                        <motion.div key="organizations" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                           <div className="mb-12">
                                <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Partner Organizations</h1>
                                <p className="text-[var(--text-muted)] font-medium">Management of collaborating clinics and donation centers.</p>
                            </div>
                            
                            {isLoading ? (
                                <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Connecting to Nexus...</div>
                            ) : orgs.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)]/50 p-20 rounded-[3rem] border border-[var(--border)] text-center">
                                    <Building2 className="w-16 h-16 mx-auto mb-6 text-[var(--text-muted)] opacity-20" />
                                    <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">No partners found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {orgs.map(org => (
                                        <motion.div key={org.id} whileHover={{ y: -8 }}
                                            className="bg-[var(--bg-secondary)] backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border)] group-hover:bg-indigo-600 transition-all">
                                                    <Building2 className="w-6 h-6 text-[var(--text-primary)] group-hover:text-white" />
                                                </div>
                                                <button onClick={() => handleRemoveUser(org.id, org.orgName || org.name)}
                                                    className="p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-2">{org.orgName || org.name}</h3>
                                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mb-6">Partner Center</p>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest truncate">
                                                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> {org.email}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                                    <Phone className="w-3.5 h-3.5 text-indigo-500" /> {org.orgPhone || 'N/A'}
                                                </div>
                                                <div className="flex items-start gap-3 text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] leading-relaxed">
                                                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" /> {org.orgAddress || 'Remote Partner'}
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
                                                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Status</span>
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified Partner</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* USER SUPPORT */}
                    {activeSection === 'support' && (
                        <motion.div key="support" variants={tabVars} initial="hidden" animate="visible" exit="exit">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">User Support Portal</h1>
                            <p className="text-[var(--text-muted)] mb-12 font-medium">Respond to user inquiries and resolve technical problems.</p>
                            
                            <div className="grid gap-8">
                                {isLoading && supportMessages.length === 0 ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs animate-pulse">Syncing Support Signal...</div>
                                ) : supportMessages.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 p-20 rounded-[3rem] border border-[var(--border)] text-center shadow-inner">
                                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-lg">
                                            <MessageSquare className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-sm">No support tickets found</p>
                                    </div>
                                ) : (
                                    supportMessages.map(msg => (
                                        <div key={msg.id} className="bg-[var(--bg-secondary)] backdrop-blur-[40px] p-8 md:p-10 rounded-[3rem] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group relative overflow-hidden shadow-sm hover:shadow-[var(--shadow)]">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-bl-[100%] z-0 translate-x-32 -translate-y-32 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000"></div>
                                            <div className="flex flex-col lg:flex-row gap-8 justify-between relative z-10">
                                                <div className="space-y-6 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden flex items-center justify-center shadow-xl">
                                                            {msg.user?.avatar ? <img src={msg.user.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-[var(--text-muted)]" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-[var(--text-primary)] brand-font tracking-tight">{msg.user?.name}</h3>
                                                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">{msg.user?.email}</p>
                                                        </div>
                                                        <span className={`ml-auto lg:ml-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${msg.status === 'OPEN' ? 'bg-orange-500/10 text-orange-500' : msg.status === 'REPLIED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                            {msg.status}
                                                        </span>
                                                    </div>

                                                    <div className="bg-[var(--bg-primary)]/50 p-6 rounded-3xl border border-[var(--border)] group-hover:border-[var(--accent)]/20 transition-colors">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Subject: {msg.subject}</p>
                                                        <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed italic">"{msg.message}"</p>
                                                    </div>

                                                    {msg.adminReply && (
                                                        <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 ml-8 relative shadow-2xl">
                                                            <div className="absolute -left-4 top-6 w-4 h-0.5 bg-red-500"></div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-2">Official Reply</p>
                                                            <p className="text-sm font-bold text-white leading-relaxed">"{msg.adminReply}"</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="lg:w-80 space-y-4 shrink-0">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Quick Response</label>
                                                        <textarea 
                                                            rows={4}
                                                            placeholder="Type your official response..."
                                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-4 text-sm font-bold text-[var(--text-primary)] resize-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]/50 outline-none transition-all shadow-inner"
                                                            value={replyTexts[msg.id] || ''}
                                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => handleSupportReply(msg.id)}
                                                            className="flex-1 bg-slate-950 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-1 transition-all shadow-2xl shadow-black/40 border border-white/5"
                                                        >
                                                            <Send className="w-3.5 h-3.5" /> {msg.adminReply ? 'Update' : 'Send Reply'}
                                                        </button>
                                                        {msg.status !== 'RESOLVED' && (
                                                            <button 
                                                                onClick={() => handleSupportResolve(msg.id)}
                                                                className="px-6 py-4 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[9px] uppercase tracking-widest hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 transition-all font-bold"
                                                            >
                                                                Resolve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
