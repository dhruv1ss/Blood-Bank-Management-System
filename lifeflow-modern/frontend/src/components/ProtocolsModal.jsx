import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const PROTOCOLS = {
    DONOR: {
        title: "Donor Protocols & Agreements",
        sections: [
            { title: "Eligibility Criteria", content: "Must be between 18-65 years of age. Weight must be at least 50 kg. Hemoglobin level should be ≥ 12.5 g/dL." },
            { title: "Health & Safety", content: "Must not have donated blood in the last 56 days (8 weeks). Should not have any active infection, cold, or flu." },
            { title: "Post-Donation Care", content: "Hydrate well and avoid strenuous physical activity for at least 24 hours. Do not consume alcohol for 24 hours." },
        ]
    },
    ORGANIZATION: {
        title: "Organization Protocols",
        sections: [
            { title: "Legal Verification", content: "Organizations must provide valid registration documents (NGO certificate, Hospital License, or Corporate ID) before hosting camps." },
            { title: "Medical Standards", content: "All camps hosted must be staffed by certified phlebotomists. Sterile equipment and proper biohazard disposal are strictly mandated." },
            { title: "Data Privacy", content: "Donor data collected during camps is strictly confidential and must adhere to national health data protection regulations." },
        ]
    }
};

const ProtocolsModal = ({ isOpen, onClose, onAgree, role }) => {
    if (!role || !PROTOCOLS[role]) return null;
    const data = PROTOCOLS[role];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative"
                    >
                        {/* Header Image / Gradient */}
                        <div className="h-32 bg-gradient-to-br from-[var(--accent)]/20 to-transparent relative overflow-hidden flex items-center px-8 border-b border-white/5">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 10, repeat: Infinity }}
                                className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent)] rounded-full blur-[60px] opacity-20 pointer-events-none"
                            />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)]/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                                    <FileText className="text-[var(--accent)] w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">{data.title}</h2>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Mandatory Guidelines</p>
                                </div>
                            </div>
                            
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-transparent to-slate-950">
                           <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                               <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                               <p className="text-[11px] leading-relaxed font-bold tracking-wide uppercase opacity-90">Please ensure you meet all criteria below. Compliance is heavily enforced within the Sanctuary network to ensure life-safety.</p>
                           </div>

                           <div className="space-y-6 pt-2">
                               {data.sections.map((sec, idx) => (
                                   <motion.div 
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.1 * idx }}
                                      key={idx} 
                                      className="group"
                                   >
                                       <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                                           <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" /> {sec.title}
                                       </h3>
                                       <p className="text-slate-400 text-sm leading-relaxed pl-5 border-l-2 border-white/5 group-hover:border-[var(--accent)]/50 transition-colors">
                                            {sec.content}
                                       </p>
                                   </motion.div>
                               ))}
                           </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-900 border-t border-white/5 flex justify-end gap-4">
                            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                                Dismiss
                            </button>
                            <button onClick={onAgree} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-2 border border-white/10">
                                <CheckCircle2 className="w-4 h-4" /> I Comprehend
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProtocolsModal;
