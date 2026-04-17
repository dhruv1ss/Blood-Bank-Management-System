/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Menu, X, HeartPulse, LogOut, Sun, Moon, Bell, CheckCheck, Droplets, ShieldCheck, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import AnimatedAvatar from './AnimatedAvatar';
import api from '../lib/api';

// -----------------------------------------------------------------------------
// Notification helpers
// -----------------------------------------------------------------------------
const getNotificationIcon = (type) => {
    if (type === 'DONATION_APPROVED') return <Droplets className="w-4 h-4 text-red-500" />;
    if (type === 'DONATION_REJECTED') return <ShieldCheck className="w-4 h-4 text-gray-400" />;
    return <Info className="w-4 h-4 text-blue-500" />;
};

const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

// -----------------------------------------------------------------------------
// Notification Bell Component
// -----------------------------------------------------------------------------
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const panelRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/user/notifications');
            if (res.data.status === 'success') {
                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
        // Poll every 60 seconds for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => setIsOpen((v) => !v);

    const handleOpenNotif = async (notif) => {
        setSelectedNotif(notif);
        if (!notif.read) {
            try {
                await api.put(`/user/notifications/${notif.id}/read`);
                setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch { /* silent */ }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/user/notifications/read-all');
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleOpen}
                className="relative p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Notifications"
            >
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Bell className="w-5 h-5" />
                </motion.div>

                {/* Red badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/40"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-[1000]"
                    >
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-sm font-black text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <p className="text-[10px] text-red-500 font-bold mt-0.5">{unreadCount} unread</p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider border border-blue-100 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-all"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Mark all read
                                </motion.button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center gap-3 text-center px-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-semibold">No messages yet.<br />Submit a request or donation to get started!</p>
                                </div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <motion.div
                                        key={notif.id || i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => handleOpenNotif(notif)}
                                        className={`flex gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/40' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-red-100' : 'bg-gray-100'}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                                {timeAgo(notif.createdAt)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="text-[11px] font-black text-red-600 hover:text-red-700 uppercase tracking-wider"
                                >
                                    View My Dashboard →
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Detail Modal — rendered in body via Portal */}
            {selectedNotif && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="notif-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={() => setSelectedNotif(null)}
                    >
                        <motion.div
                            key="notif-modal-card"
                            initial={{ opacity: 0, scale: 0.88, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 px-6 pt-6 pb-5 border-b border-gray-100">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${!selectedNotif.read ? 'bg-red-100' : 'bg-gray-100'}`}>
                                    <span className="scale-125">{getNotificationIcon(selectedNotif.type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-black text-gray-900 leading-snug">{selectedNotif.title}</h4>
                                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{timeAgo(selectedNotif.createdAt)}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100 shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6">
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedNotif.message}</p>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-6 pt-2">
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="w-full bg-gray-900 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20 hover:-translate-y-0.5"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------
// Navbar
// -----------------------------------------------------------------------------
const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Donation Camps', path: '/camps' },
        { name: 'Heroes', path: '/heroes' },
        { name: 'Community', path: '/community' },
        { name: 'Compatibility', path: '/compatibility' },
    ];

    if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
            navLinks.push({ name: 'Admin Panel', path: '/admin-dashboard' });
        } else if (user?.role === 'ORGANIZATION') {
            navLinks.push({ name: 'Create Camp', path: '/org-dashboard' });
        } else {
            navLinks.push({ name: 'My Dashboard', path: '/dashboard' });
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showBell = isAuthenticated && user?.role === 'DONOR';
    return (
        <nav
            className={`fixed w-full z-[999] top-10 transition-all duration-300 ${
                isScrolled ? 'bg-white bg-opacity-95 shadow-lg py-2 backdrop-blur-md border-b border-gray-100' : 'bg-white bg-opacity-70 py-4 glass'
            }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="text-3xl font-bold text-red-600 tracking-tighter flex items-center gap-2 brand-font transform transition hover:scale-105">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <HeartPulse className="text-red-500 w-8 h-8" />
                    </motion.div>
                    LifeFlow
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider font-semibold items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`transition-colors relative group ${
                                location.pathname === link.path ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                            }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <span className="text-gray-900 font-bold brand-font mr-1">HI {user?.name?.split(' ')[0].toUpperCase()}</span>
                            <Link to={user?.role === 'ADMIN' ? '/admin-dashboard' : user?.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard?section=edit-profile'} className="transition-transform active:scale-95" title="Edit Profile">
                                <AnimatedAvatar size="sm" user={user} />
                            </Link>

                            {/* Notification Bell — only for DONOR */}
                            {showBell && <NotificationBell />}

                            <button onClick={toggleTheme} className="text-gray-600 hover:text-gray-900 transition-colors" title="Toggle dark mode">
                                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button onClick={handleLogout} className="bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md hover:shadow-lg text-sm flex items-center gap-2 font-bold">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className="text-gray-600 hover:text-gray-900 transition-colors" title="Toggle dark mode">
                                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <Link to="/login" className="text-gray-700 hover:text-red-600 transition-colors">Login</Link>
                            <Link to="/register" className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-bold">Register</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700 hover:text-red-600 focus:outline-none transition-transform active:scale-95"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl"
                    >
                        <div className="container mx-auto px-6 py-4 flex flex-col space-y-4 font-bold text-center">
                            {navLinks.filter(link => {
                                const authPaths = ['/dashboard', '/admin-dashboard', '/org-dashboard'];
                                return !authPaths.includes(link.path);
                            }).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`py-2 ${location.pathname === link.path ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
                                <button onClick={toggleTheme} className="flex items-center justify-center gap-2 py-2 text-gray-700 hover:text-red-600 transition-colors">
                                    {isDark ? <><Sun className="w-5 h-5 text-yellow-500" /> Light Mode</> : <><Moon className="w-5 h-5" /> Dark Mode</>}
                                </button>
                                {isAuthenticated ? (
                                    <>
                                        <span className="text-gray-900 font-bold brand-font py-2">HI {user?.name?.split(' ')[0].toUpperCase()}</span>
                                        <Link to={user?.role === 'ADMIN' ? '/admin-dashboard' : user?.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard?section=edit-profile'} className="text-gray-700 hover:text-red-600 py-2">
                                            {user?.role === 'ADMIN' ? 'Admin Panel' : user?.role === 'ORGANIZATION' ? 'Create Camp' : 'Edit Profile'}
                                        </Link>
                                        <button onClick={handleLogout} className="bg-gray-900 text-white px-6 py-3 rounded-xl mx-auto w-1/2 min-w-[150px] flex items-center justify-center gap-2">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-gray-700 hover:text-red-600 py-2">Login</Link>
                                        <Link to="/register" className="bg-red-600 text-white px-6 py-3 rounded-xl mx-auto w-1/2 min-w-[150px]">Register</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
