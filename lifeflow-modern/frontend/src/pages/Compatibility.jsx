/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Droplets, Info, CheckCircle2, AlertCircle, ArrowRightLeft, Users, Zap } from 'lucide-react';
import { useAuthStore } from '../context/authStore';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPATIBILITY_DATA = {
  'A+':  { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
  'A-':  { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
  'B+':  { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
  'B-':  { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
  'AB+': { give: ['AB+'], receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'AB-': { give: ['AB+', 'AB-'], receive: ['A-', 'B-', 'AB-', 'O-'] },
  'O+':  { give: ['A+', 'B+', 'AB+', 'O+'], receive: ['O+', 'O-'] },
  'O-':  { give: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receive: ['O-'] },
};

const Compatibility = () => {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState(() => {
    const bg = user?.bloodGroup;
    return BLOOD_TYPES.includes(bg) ? bg : 'O-';
  });
  const data = COMPATIBILITY_DATA[selected];

  return (
    <>
      <style>{`
        .compat-root {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Inter','Outfit',system-ui,sans-serif;
          overflow-x: hidden;
        }
        .compat-hero {
          position: relative;
          padding: 7rem 1.5rem 4rem;
          text-align: center;
          overflow: hidden;
        }
        .compat-hero-blob1 {
          position: absolute; top: -100px; left: -100px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(220,20,60,0.25) 0%, transparent 65%);
          pointer-events: none;
          animation: cb1 8s ease-in-out infinite alternate;
        }
        .compat-hero-blob2 {
          position: absolute; bottom: -80px; right: -80px;
          width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 65%);
          pointer-events: none;
          animation: cb1 11s ease-in-out infinite alternate-reverse;
        }
        @keyframes cb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,25px) scale(1.1); } }

        .compat-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(220,20,60,0.1);
          border: 1px solid rgba(220,20,60,0.25);
          border-radius: 100px; padding: 6px 16px;
          font-size: 0.72rem; font-weight: 700; color: #ff6680;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .compat-title {
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 900; color: var(--text-primary);
          letter-spacing: -0.03em; line-height: 1.05;
          margin-bottom: 1rem;
        }
        .compat-title span {
          background: linear-gradient(90deg, #ff3355, #ff8080);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .compat-sub {
          color: var(--text-muted); font-size: 1rem;
          max-width: 680px; margin: 0 auto; line-height: 1.7; font-weight: 400;
        }

        /* Selector grid */
        .compat-selector-wrap {
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 3rem;
        }
        .compat-selector-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 2rem;
          margin-bottom: 2rem;
        }
        .compat-selector-label {
          font-size: 0.72rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 1.2rem;
        }
        .compat-type-grid {
          display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px;
        }
        @media (max-width: 640px) {
          .compat-type-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .compat-type-btn {
          aspect-ratio: 1; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          background: var(--bg-primary);
          border: 1.5px solid var(--border);
          color: var(--text-muted);
          cursor: pointer; transition: all 0.22s ease;
          font-weight: 900; font-size: 1.1rem; font-family: inherit;
        }
        .compat-type-btn:hover {
          background: var(--bg-secondary);
          border-color: rgba(220,20,60,0.4); color: var(--text-primary);
        }
        .compat-type-btn.active {
          background: linear-gradient(135deg, #dc143c, #9b0023);
          border-color: rgba(220,20,60,0.6); color: #fff;
          box-shadow: 0 4px 24px rgba(220,20,60,0.4);
        }
        .compat-type-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted);
        }
        .compat-type-btn.active .compat-type-dot { background: rgba(255,255,255,0.8); }

        /* Results */
        .compat-results-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 640px) { .compat-results-grid { grid-template-columns: 1fr; } }

        .compat-result-card {
          border-radius: 20px; padding: 1.75rem;
          border: 1px solid var(--border);
          background: var(--bg-card);
          position: relative; overflow: hidden;
        }
        .compat-result-card.give {
          border-color: rgba(220,20,60,0.2);
          background: rgba(220,20,60,0.04);
        }
        .compat-result-card.receive {
          border-color: rgba(59,130,246,0.2);
          background: rgba(59,130,246,0.04);
        }
        .compat-result-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem;
        }
        .compat-result-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .compat-result-icon.give { background: rgba(220,20,60,0.15); color: #ff3355; }
        .compat-result-icon.receive { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .compat-result-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
        .compat-result-sub { font-size: 0.75rem; color: var(--text-muted); }

        .compat-tags {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.25rem;
        }
        .compat-tag {
          padding: 6px 16px; border-radius: 10px;
          font-size: 1rem; font-weight: 900; font-family: inherit;
        }
        .compat-tag.give {
          background: rgba(220,20,60,0.12); color: #ff3355;
          border: 1px solid rgba(220,20,60,0.2);
        }
        .compat-tag.receive {
          background: rgba(59,130,246,0.12); color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.2);
        }

        .compat-info-bar {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          font-size: 0.78rem; line-height: 1.6; font-weight: 500;
        }
        .compat-info-bar.give {
          background: rgba(220,20,60,0.08); color: rgba(255,150,150,0.9);
          border: 1px solid rgba(220,20,60,0.15);
        }
        .compat-info-bar.receive {
          background: rgba(59,130,246,0.08); color: rgba(150,190,255,0.9);
          border: 1px solid rgba(59,130,246,0.15);
        }

        /* Table */
        .compat-table-wrap {
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 5rem;
        }
        .compat-section-title {
          font-size: 1.1rem; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }
        .compat-table {
          width: 100%; border-collapse: collapse;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
        }
        .compat-table thead tr {
          background: rgba(220,20,60,0.08);
          border-bottom: 1px solid var(--border);
        }
        .compat-table th {
          padding: 14px 20px; text-align: left;
          font-size: 0.7rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .compat-table td {
          padding: 13px 20px;
          font-size: 0.85rem; color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .compat-table tr:last-child td { border-bottom: none; }
        .compat-table tr.hl td { background: rgba(220,20,60,0.06); }
        .compat-table tr:hover td { background: var(--bg-primary); }
        .compat-type-label { font-weight: 900; color: #ff3355; font-size: 1rem; }

        /* Fact cards */
        .compat-facts {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 4rem;
        }
        @media (max-width: 640px) { .compat-facts { grid-template-columns: 1fr; } }
        .compat-fact {
          padding: 1.4rem 1.5rem; border-radius: 18px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .compat-fact-icon {
          width: 36px; height: 36px; border-radius: 10px; margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center;
        }
        .compat-fact h4 { font-size: 0.88rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
        .compat-fact p { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; }
      `}</style>

      <div className="compat-root">
        {/* Hero */}
        <section className="compat-hero">
          <div className="compat-hero-blob1" />
          <div className="compat-hero-blob2" />
          <motion.div
            className="compat-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ArrowRightLeft size={12} /> Blood Compatibility Guide
          </motion.div>
          <motion.h1
            className="compat-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Know Your <span>Compatibility</span>
          </motion.h1>
          <motion.p className="compat-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Select your blood type to instantly see who you can donate to and who can donate to you.
          </motion.p>
        </section>

        {/* Selector */}
        <div className="compat-selector-wrap">
          <div className="compat-selector-card">
            <p className="compat-selector-label">Select Blood Type</p>
            <div className="compat-type-grid">
              {BLOOD_TYPES.map(t => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`compat-type-btn ${selected === t ? 'active' : ''}`}
                  onClick={() => setSelected(t)}
                >
                  {t}
                  <div className="compat-type-dot" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              className="compat-results-grid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Can Give To */}
              <div className="compat-result-card give">
                <div className="compat-result-header">
                  <div className="compat-result-icon give"><Heart size={18} /></div>
                  <div>
                    <div className="compat-result-title">Can Donate To</div>
                    <div className="compat-result-sub">{data.give.length} compatible type{data.give.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="compat-tags">
                  {data.give.map(t => <span key={t} className="compat-tag give">{t}</span>)}
                </div>
                <div className="compat-info-bar give">
                  <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  {selected === 'O-' ? 'Universal Donor — you can give to anyone!' : `${selected} blood can safely be donated to these groups.`}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="compat-result-card receive">
                <div className="compat-result-header">
                  <div className="compat-result-icon receive"><Droplets size={18} /></div>
                  <div>
                    <div className="compat-result-title">Can Receive From</div>
                    <div className="compat-result-sub">{data.receive.length} compatible type{data.receive.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="compat-tags">
                  {data.receive.map(t => <span key={t} className="compat-tag receive">{t}</span>)}
                </div>
                <div className="compat-info-bar receive">
                  <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  {selected === 'AB+' ? 'Universal Recipient — you can receive from anyone!' : `These donor types are compatible with ${selected}.`}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fact cards */}
        <div className="compat-facts">
          {[
            { icon: <Zap size={16} />, color: '#ff3355', bg: 'rgba(220,20,60,0.12)', title: 'O- Universal Donor', body: 'O-negative can be given to any patient in emergencies when time is critical.' },
            { icon: <Users size={16} />, color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', title: 'AB+ Universal Recipient', body: 'AB-positive individuals can safely receive blood from any other blood type.' },
            { icon: <Heart size={16} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)', title: 'One Pint, Three Lives', body: 'A single blood donation can be split into 3 components — red cells, plasma, and platelets.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="compat-fact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="compat-fact-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Full compatibility table */}
        <div className="compat-table-wrap">
          <p className="compat-section-title">Full Compatibility Matrix</p>
          <table className="compat-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Can Donate To</th>
                <th>Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {BLOOD_TYPES.map(t => (
                <tr key={t} className={selected === t ? 'hl' : ''}>
                  <td><span className="compat-type-label">{t}</span></td>
                  <td>{COMPATIBILITY_DATA[t].give.join(', ')}</td>
                  <td>{COMPATIBILITY_DATA[t].receive.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Compatibility;
