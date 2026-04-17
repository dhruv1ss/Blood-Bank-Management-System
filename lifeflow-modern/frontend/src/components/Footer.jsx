/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useThemeStore } from '../context/themeStore';
import { useAuthStore } from '../context/authStore';
import AnimatedAvatar from './AnimatedAvatar';

const SOCIAL = [
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/lifeflowdonation',
        hoverBg: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400',
        hoverShadow: 'hover:shadow-[0_8px_30px_rgba(236,72,153,0.45)]',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
        ),
    },
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/profile.php?id=100051987066419',
        hoverBg: 'hover:bg-blue-600',
        hoverShadow: 'hover:shadow-[0_8px_30px_rgba(37,99,235,0.45)]',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        label: 'Twitter / X',
        href: 'https://x.com/DRajput31590',
        hoverBg: 'hover:bg-gray-900',
        hoverShadow: 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 5.895zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

const Footer = () => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('dashboard');
    const { isDark } = useThemeStore();
    const { isAuthenticated, user } = useAuthStore();

    // ── theme tokens
    const bg        = isDark ? 'bg-slate-950' : 'bg-gray-50';
    const border    = isDark ? 'border-slate-900' : 'border-gray-200';
    const heading   = isDark ? 'text-white'      : 'text-gray-900';
    const subtext   = isDark ? 'text-slate-400'  : 'text-gray-500';
    const linkText  = isDark ? 'text-slate-300 hover:text-red-500'  : 'text-gray-600 hover:text-red-600';
    const dot       = isDark ? 'bg-red-500'      : 'bg-red-500';
    const iconBox   = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200';
    const iconColor = isDark ? 'text-red-500'    : 'text-red-500';
    const socialBox = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
    const socialFg  = isDark ? 'text-slate-400'  : 'text-gray-400';
    const blobA     = isDark ? 'bg-red-600/10'   : 'bg-red-100';
    const blobB     = isDark ? 'bg-blue-600/5'   : 'bg-blue-50';
    const footerFg  = isDark ? 'text-slate-500'  : 'text-gray-400';
    const legalFg   = isDark ? 'text-slate-600 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600';
    const sectionLabel = isDark ? 'text-slate-500' : 'text-gray-400';

    return (
        <footer className={`${bg} text-white pt-24 pb-12 relative overflow-hidden transition-all duration-700 ${isDashboard ? 'lg:pl-80' : ''}`}>
            {/* Backdrop blobs */}
            <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-96 h-96 ${blobA} rounded-full blur-[120px]`} />
                <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${blobB} rounded-full blur-[120px]`} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand */}
                    <div className="space-y-8">
                        <h3 className={`text-3xl font-black flex items-center gap-4 brand-font tracking-tight group cursor-default ${heading}`}>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_10px_30px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform duration-500">
                                <Droplet className="w-8 h-8 text-white fill-white/20" />
                            </div>
                            LifeFlow
                        </h3>
                        <p className={`text-lg leading-relaxed font-light ${subtext}`}>
                            Designing the future of blood donation. Connecting life-savers with those in need through advanced nexus technology.
                        </p>

                        {/* User Profile Badge (if logged in) */}
                        {isAuthenticated && (
                            <Link 
                                to={user?.role === 'ADMIN' ? '/admin-dashboard' : user?.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard'}
                                className={`flex items-center gap-4 p-4 rounded-3xl transition-all hover:scale-105 active:scale-95 group ${isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white shadow-sm border border-gray-100'}`}
                            >
                                <AnimatedAvatar size="sm" user={user} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${sectionLabel}`}>Active Sanctuary</p>
                                    <p className={`text-sm font-bold truncate ${heading}`}>{user?.name}</p>
                                </div>
                            </Link>
                        )}

                        {/* Social icons */}
                        <div className="flex gap-3">
                            {SOCIAL.map(({ label, href, hoverBg, hoverShadow, svg }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={label}
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    whileTap={{ scale: 0.93 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center hover:text-white transition-all duration-300 ${socialBox} ${socialFg} ${hoverBg} ${hoverShadow}`}
                                >
                                    {svg}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Nexus navigation */}
                    <div className="lg:pl-10">
                        <h4 className={`text-xs font-black mb-10 uppercase tracking-[0.3em] brand-font ${sectionLabel}`}>Nexus Navigation</h4>
                        <ul className="space-y-5">
                            {[
                                { href: '/', label: 'Home Portal' },
                                { href: '/heroes', label: 'Hall of Heroes' },
                                { href: '/camps', label: 'Donation Matrix' },
                                { href: '/compatibility', label: 'Compatibility AI' },
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <a href={href} className={`text-sm transition-all duration-300 font-bold flex items-center gap-3 group ${linkText}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${dot} scale-0 group-hover:scale-100 transition-transform`} />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Protocol center */}
                    <div className="lg:pl-10">
                        <h4 className={`text-xs font-black mb-10 uppercase tracking-[0.3em] brand-font ${sectionLabel}`}>Protocol Center</h4>
                        <ul className="space-y-5">
                            {[
                                { to: '/protocols/support', label: 'Support Frequency' },
                                { to: '/protocols/faq',     label: 'FAQ Database' },
                                { to: '/protocols/privacy', label: 'Privacy Protocol' },
                            ].map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className={`text-sm transition-all duration-300 font-bold flex items-center gap-3 group ${linkText}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${dot} scale-0 group-hover:scale-100 transition-transform`} />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Emergency uplink */}
                    <div className="lg:pl-10">
                        <h4 className={`text-xs font-black mb-10 uppercase tracking-[0.3em] brand-font ${sectionLabel}`}>Emergency Uplink</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-5 group cursor-default">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${iconBox} ${iconColor} group-hover:border-red-500/30`}>
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${sectionLabel}`}>HQ Location</span>
                                    <span className={`text-sm font-bold block leading-relaxed ${heading}`}>Far From The West There Is A Land Called, Vinland</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-5 group cursor-default">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${iconBox} ${iconColor} group-hover:border-red-500/30`}>
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${sectionLabel}`}>Direct Line</span>
                                    <span className={`text-sm font-bold block ${heading}`}>+91 8780186981</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className={`pt-12 border-t ${border} flex flex-col md:flex-row justify-between items-center gap-8`}>
                    <p className={`text-xs font-black brand-font uppercase tracking-[0.2em] flex items-center gap-3 ${footerFg}`}>
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        &copy; {new Date().getFullYear()} LifeFlow Blood Bank • Zero Protocol Active
                    </p>
                    <div className="flex gap-8">
                        <Link to="/protocols/security" className={`text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${legalFg}`}>Security Policy</Link>
                        <Link to="/protocols/terms"    className={`text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${legalFg}`}>Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
