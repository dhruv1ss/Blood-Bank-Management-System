/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, HeartPulse, ArrowRight, User, Droplet, CalendarDays, Building2, Phone, MapPin, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import AvatarFeedback from '../components/AvatarFeedback';
import ProtocolsModal from '../components/ProtocolsModal';

const ROLES = [
    { id: 'DONOR', label: 'Individual', desc: 'Donate or request blood', icon: User },
    { id: 'ORGANIZATION', label: 'Organization', desc: 'Host blood camps', icon: Building2 },
];

const Register = () => {
    const [role, setRole] = useState('DONOR');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        bloodGroup: '', age: '',
        orgName: '', orgPhone: '', orgAddress: ''
    });
    const [feedbackStatus, setFeedbackStatus] = useState('idle');
    const [showPassword, setShowPassword] = useState(false);
    const [isProtocolsOpen, setIsProtocolsOpen] = useState(false);
    const [protocolRole, setProtocolRole] = useState(null);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        const success = await register({ ...formData, role });
        if (success) {
            setFeedbackStatus('success');
            setTimeout(() => {
                if (role === 'ORGANIZATION') {
                    navigate('/org-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 2200);
        } else {
            setFeedbackStatus('error');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden bg-black font-sans py-12">
            <AvatarFeedback status={feedbackStatus} onDismiss={() => setFeedbackStatus('idle')} />
            <ProtocolsModal 
               isOpen={isProtocolsOpen} 
               onClose={() => setIsProtocolsOpen(false)} 
               onAgree={() => { setRole(protocolRole); setIsProtocolsOpen(false); }}
               role={protocolRole} 
            />
            
            {/* Cinematic Continuous Background */}
            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/90 z-10"></div>
              <Motion.img 
                initial={{ scale: 1 }}
                animate={{ scale: 1.15, rotate: -1 }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=2560" 
                alt="Medical gear"
                className="w-full h-full object-cover origin-center opacity-70"
              />
            </div>

            <div className="container mx-auto px-6 relative z-10 flex justify-center py-10 w-full">
                <Motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.8, ease: "easeOut" }} 
                  className="w-full max-w-2xl"
                >
                    <div className="bg-white/10 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden group">
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] pointer-events-none z-0 group-hover:bg-red-500/30 transition-colors duration-700"></div>
                        
                        <div className="text-center mb-10 relative z-10">
                            <Motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10"
                            >
                                <HeartPulse className="text-red-400 w-10 h-10" />
                            </Motion.div>
                            <h2 className="text-4xl font-black text-white brand-font mb-2 tracking-tight">Create Account</h2>
                            <p className="text-white/60 text-sm font-medium">Join our premier life-saving network.</p>
                        </div>

                        {/* Premium Role Selector */}
                        <div className="mb-10 relative z-10">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4 ml-2 text-center">I want to register as</p>
                            <div className="grid grid-cols-2 gap-4">
                                {ROLES.map(r => (
                                    <button 
                                        type="button" 
                                        key={r.id} 
                                        onClick={() => { setProtocolRole(r.id); setIsProtocolsOpen(true); }}
                                        className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden text-left focus:outline-none ${role === r.id
                                            ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}>
                                        {role === r.id && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-red-400" /></div>}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-xl ${role === r.id ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'}`}>
                                                <r.icon className="w-5 h-5"/>
                                            </div>
                                            <span className={`font-black text-xs md:text-sm uppercase tracking-wider ${role === r.id ? 'text-white' : 'text-white/70'}`}>{r.label}</span>
                                        </div>
                                        <div className="text-white/50 text-[10px] md:text-[11px] font-medium leading-relaxed mt-1 pl-[2.75rem]">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group/input">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">
                                        {role === 'ORGANIZATION' ? 'Contact Person' : 'Full Name'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><User className="w-5 h-5" /></div>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="e.g. John Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2 group/input">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><Mail className="w-5 h-5" /></div>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="email@example.com" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {role === 'ORGANIZATION' ? (
                                    <Motion.div key="org" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                                        <div className="space-y-2 group/input">
                                            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2 mt-2">Organization Name</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><Building2 className="w-5 h-5" /></div>
                                                <input type="text" name="orgName" value={formData.orgName} onChange={handleChange} required={role === 'ORGANIZATION'} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="Hospital / NGO Legal Name" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group/input">
                                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">Phone</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><Phone className="w-5 h-5" /></div>
                                                    <input type="tel" name="orgPhone" value={formData.orgPhone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="+1..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2 group/input">
                                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">City</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><MapPin className="w-5 h-5" /></div>
                                                    <input type="text" name="orgAddress" value={formData.orgAddress} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="City Location" />
                                                </div>
                                            </div>
                                        </div>
                                    </Motion.div>
                                ) : (
                                    <Motion.div key="donor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                                        <div className="space-y-2 group/input mt-2">
                                            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">Blood Group</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><Droplet className="w-5 h-5" /></div>
                                                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required={role === 'DONOR'}
                                                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold appearance-none backdrop-blur-sm shadow-inner">
                                                    <option value="" disabled className="text-gray-900">Select Type</option>
                                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg} className="text-gray-900">{bg}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 group/input mt-2">
                                            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">Age</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><CalendarDays className="w-5 h-5" /></div>
                                                <input type="number" name="age" min="18" max="65" value={formData.age} onChange={handleChange} required={role === 'DONOR'}
                                                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" placeholder="18–65" />
                                            </div>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2 group/input mt-2">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest ml-2">Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors"><Lock className="w-5 h-5" /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        minLength="6" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner"
                                        placeholder="••••••••" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group/btn disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-base">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></>}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/60 text-sm font-medium relative z-10">
                            Already have an account? <Link to="/login" className="text-red-400 font-bold hover:text-white transition-colors ml-1">Sign in here</Link>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </div>
    );
};

export default Register;
