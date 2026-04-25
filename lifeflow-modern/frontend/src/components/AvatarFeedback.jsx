import React, { useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/** 
 * LifeFlow "LifeBot" SVG Logo Feedback
 * 
 * Success: Digital ^^ Eyes + Celebratory Spin + Holographic Badge
 * Error: Digital XX Eyes + Static Glitch + Red Warning Visor
 */

const LifeBotLogo = ({ status }) => {
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <radialGradient id="visorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        {/* FLOATING BODY CHASSIS */}
        <Motion.g
          animate={
            isSuccess ? { 
                rotate: [0, 360],
                y: [0, -20, 0]
            } : 
            isError ? {
                x: [0, -4, 4, -4, 4, 0]
            } :
            { y: [0, -10, 0] }
          }
          transition={{ duration: isSuccess ? 0.8 : 3, repeat: isSuccess ? 0 : Infinity, ease: "easeInOut" }}
        >
          {/* Main Body */}
          <circle cx="100" cy="100" r="70" fill="url(#bodyGrad)" stroke="#94a3b8" strokeWidth="2" />
          
          {/* Red Medical Stripe */}
          <rect x="30" y="90" width="140" height="20" fill="#ef4444" opacity="0.1" />

          {/* THE DIGITAL VISOR */}
          <Motion.rect
            x="45" y="65" width="110" height="60" rx="30"
            fill="url(#visorGrad)"
            stroke={isError ? "#ef4444" : "#38bdf8"}
            strokeWidth="2"
            animate={{ 
                stroke: isError ? ["#ef4444", "#7f1d1d", "#ef4444"] : "#38bdf8",
                opacity: isError ? [1, 0.7, 1] : 1
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />

          {/* DIGITAL EYES */}
          <g transform="translate(100, 95)">
             <AnimatePresence mode="wait">
                {isSuccess ? (
                  <Motion.g key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* ^^ Eyes */}
                    <path d="M -35 5 L -25 -5 L -15 5" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 15 5 L 25 -5 L 35 5" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                  </Motion.g>
                ) : isError ? (
                  <Motion.g key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* XX Eyes */}
                    <path d="M -30 -5 L -15 10 M -30 10 L -15 -5" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 15 -5 L 30 10 M 15 10 L 30 -5" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                  </Motion.g>
                ) : (
                  <Motion.g key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* -- Eyes */}
                    <Motion.rect 
                        x="-35" y="0" width="20" height="5" rx="2.5" fill="#38bdf8" 
                        animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2] }}
                    />
                    <Motion.rect 
                        x="15" y="0" width="20" height="5" rx="2.5" fill="#38bdf8" 
                        animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2], delay: 0.1 }}
                    />
                  </Motion.g>
                )}
             </AnimatePresence>
          </g>

          {/* Pulsing Heart Chest Logo */}
          <Motion.path
            d="M 100 155 C 95 150 85 150 85 135 C 85 125 95 125 100 132 C 105 125 115 125 115 135 C 115 150 105 150 100 155 Z"
            fill="#ef4444"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </Motion.g>

        {/* HOLOGRAPHIC STATUS NOTIFICATION */}
        <AnimatePresence>
          {isSuccess && (
            <g transform="translate(100, 40)">
              <Motion.g
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <rect x="-40" y="-15" width="80" height="30" rx="15" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" strokeWidth="1" />
                 <text x="0" y="5" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">VERIFIED</text>
              </Motion.g>
            </g>
          )}
        </AnimatePresence>
      </svg>

      {/* Digital Data Streams on Success */}
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <Motion.div
              key={i}
              className="absolute w-[2px] h-12 bg-sky-400/30 rounded-full"
              initial={{ top: '100%', left: `${15 + (i * 11)}%`, opacity: 0 }}
              animate={{ 
                top: '-20%', 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AvatarFeedback = ({ status = 'idle', onDismiss }) => {
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  const show = status !== 'idle';
  const isSuccess = status === 'success';

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-none"
          style={{ background: 'var(--bg-overlay, rgba(15, 23, 42, 0.85))', backdropFilter: 'blur(20px)' }}
        >
          {/* Digital Grid Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{ 
              backgroundImage: 'radial-gradient(var(--accent, #38bdf8) 1.5px, transparent 0)', 
              backgroundSize: '48px 48px' 
            }}
          />

          <Motion.div
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -30 }}
            className="flex flex-col items-center gap-12"
          >
            {/* The LifeBot Logo Mascot */}
            <LifeBotLogo status={status} />

            {/* Premium Tech Result Card */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-12 py-10 rounded-[4rem] text-center shadow-2xl relative overflow-hidden"
              style={{
                background: isSuccess 
                  ? 'var(--bg-card)' 
                  : 'linear-gradient(145deg, rgba(62, 4, 4, 0.98), rgba(42, 2, 2, 0.98))',
                border: `2px solid ${isSuccess ? 'var(--border)' : 'rgba(239, 68, 68, 0.4)'}`,
                minWidth: '420px',
                boxShadow: isSuccess 
                  ? '0 40px 100px -20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.15)' 
                  : '0 40px 100px -20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.15)',
              }}
            >
              {/* Scanline Sweep (Fixed to prevent stretching) */}
              <Motion.div 
                className="absolute left-0 right-0 h-[40%] bg-gradient-to-b from-transparent via-sky-400/5 to-transparent pointer-events-none"
                animate={{ y: ['-100%', '300%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <div className="flex flex-col items-center gap-1 relative z-10">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] mb-3 opacity-60" style={{ color: isSuccess ? '#38bdf8' : '#ef4444' }}>
                  {isSuccess ? 'LifeFlow Neural Link' : 'Security Breach'}
                </span>
                <h2 className="text-4xl font-black tracking-tight mb-3 text-[var(--text-primary)]">
                  {isSuccess ? 'Access Granted' : 'Access Restricted'}
                </h2>
                <p className="text-base font-medium opacity-70 mb-8 max-w-[300px] mx-auto" style={{ color: isSuccess ? 'var(--text-secondary)' : '#fecaca' }}>
                  {isSuccess 
                    ? 'Syncing biometric data with the donor network... Welcome back.' 
                    : 'System mismatch detected. Verification protocol failed.'}
                </p>

                {/* Cyberpunk Progress Bar */}
                {isSuccess && (
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <Motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                      className="h-full bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,1)]"
                    />
                  </div>
                )}
              </div>
            </Motion.div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarFeedback;
