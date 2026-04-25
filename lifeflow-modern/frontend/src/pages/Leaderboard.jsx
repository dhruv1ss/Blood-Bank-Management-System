/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, MapPin, Droplet, Activity, Crown, Star, Zap } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const RANK_CONFIG = [
  { bg: 'linear-gradient(135deg, #fbbf24, #d97706)', shadow: 'rgba(251,191,36,0.2)', icon: <Crown size={20} />, label: 'Champion' },
  { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', shadow: 'rgba(148,163,184,0.15)', icon: <Star size={18} />, label: 'Runner-up' },
  { bg: 'linear-gradient(135deg, #cd7c2f, #92400e)', shadow: 'rgba(205,124,47,0.15)', icon: <Medal size={18} />, label: 'Third Place' },
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/leaderboard')
      .then(res => { if (res.data.status === 'success') setLeaders(res.data.data); })
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        .lb-root {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Inter','Outfit',system-ui,sans-serif;
          overflow-x: hidden;
          padding-bottom: 5rem;
        }

        /* Hero */
        .lb-hero {
          position: relative; padding: 7rem 1.5rem 3rem;
          text-align: center; overflow: hidden;
        }
        .lb-hero-blob {
          position: absolute; border-radius: 50%;
          pointer-events: none;
        }
        .lb-hero-blob1 {
          width: 500px; height: 500px;
          top: -200px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 65%);
          animation: lbBlob 9s ease-in-out infinite alternate;
        }
        .lb-hero-blob2 {
          width: 300px; height: 300px;
          bottom: -80px; right: 5%;
          background: radial-gradient(circle, rgba(220,20,60,0.15) 0%, transparent 65%);
          animation: lbBlob 12s ease-in-out infinite alternate-reverse;
        }
        @keyframes lbBlob {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(15px, 20px) scale(1.1); }
        }

        .lb-trophy-wrap {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #fbbf24, #d97706);
          border-radius: 20px; margin: 0 auto 1.5rem;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 36px rgba(251,191,36,0.4), 0 4px 20px rgba(0,0,0,0.3);
        }

        .lb-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.25);
          border-radius: 100px; padding: 5px 14px;
          font-size: 0.72rem; font-weight: 700; color: #fbbf24;
          letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 1.2rem;
        }
        .lb-title {
          font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900;
          letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 0.8rem;
        }
        .lb-title span {
          background: linear-gradient(90deg, #fbbf24, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .lb-sub { color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto; line-height: 1.7; }

        /* Container */
        .lb-container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }

        /* Top 3 podium */
        .lb-podium {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;
          align-items: end; margin-bottom: 2.5rem; margin-top: 1rem;
        }
        @media (max-width: 600px) {
          .lb-podium { grid-template-columns: 1fr; }
          .lb-podium-card { order: unset !important; }
        }

        .lb-podium-card {
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          border-radius: 20px; padding: 1.5rem 1.25rem;
          text-align: center; position: relative;
          transition: transform 0.2s;
        }
        .lb-podium-card:hover { transform: translateY(-4px); }
        .lb-podium-card.first {
          border-color: rgba(251,191,36,0.3);
          background: rgba(251,191,36,0.05);
          box-shadow: 0 0 40px rgba(251,191,36,0.1);
          padding: 2rem 1.5rem;
          order: 2; /* center on md */
        }
        .lb-podium-card.second { order: 1; }
        .lb-podium-card.third { order: 3; }

        .lb-rank-badge {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem; box-shadow: 0 4px 16px var(--rb-shadow);
        }
        .lb-rank-num {
          font-size: 1.5rem; font-weight: 900;
        }
        .lb-card-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; font-weight: 900; color: var(--text-secondary);
          margin: 0 auto 0.8rem; text-transform: uppercase;
        }
        .lb-card-name { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
        .lb-card-city {
          display: flex; align-items: center; justify-content: center; gap: 4px;
          font-size: 0.72rem; color: var(--text-muted); margin-bottom: 1rem;
        }
        .lb-card-stats {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-primary); border-radius: 10px; padding: 8px 12px;
        }
        .lb-blood-chip {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.78rem; font-weight: 800; color: #ff3355;
          background: rgba(220,20,60,0.12); border: 1px solid rgba(220,20,60,0.2);
          border-radius: 8px; padding: 4px 10px;
        }
        .lb-pts { font-size: 1.1rem; font-weight: 900; color: var(--text-primary); }
        .lb-pts span { font-size: 0.72rem; font-weight: 500; color: var(--text-muted); margin-left: 2px; }
        .first .lb-pts { color: #fbbf24; font-size: 1.3rem; }

        /* List */
        .lb-list-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 18px; overflow: hidden; margin-bottom: 1rem;
        }
        .lb-list-header {
          display: grid; grid-template-columns: 48px 1fr 80px 80px 80px;
          padding: 10px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        @media (max-width: 500px) {
          .lb-list-header { grid-template-columns: 40px 1fr 70px; }
          .lb-list-header .hide-sm, .lb-list-row .hide-sm { display: none; }
        }
        .lb-list-row {
          display: grid; grid-template-columns: 48px 1fr 80px 80px 80px;
          padding: 12px 20px; align-items: center;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .lb-list-row:last-child { border-bottom: none; }
        .lb-list-row:hover { background: var(--bg-primary); }
        .lb-list-rank {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--bg-primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 800; color: var(--text-muted);
        }
        .lb-list-name {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.88rem; font-weight: 700; color: var(--text-primary);
        }
        .lb-list-avatar {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: var(--bg-primary);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          font-size: 0.82rem; font-weight: 900; color: #ff6680;
          text-transform: uppercase;
        }
        .lb-list-badge-text { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; }
        .lb-list-city { font-size: 0.78rem; color: var(--text-muted); }
        .lb-list-blood {
          font-size: 0.78rem; font-weight: 800; color: #ff3355;
          background: rgba(220,20,60,0.1); border: 1px solid rgba(220,20,60,0.15);
          border-radius: 7px; padding: 3px 8px; display: inline-block;
        }
        .lb-list-pts { font-size: 0.92rem; font-weight: 900; color: var(--text-primary); text-align: right; }

        /* Empty / loading */
        .lb-empty {
          text-align: center; padding: 60px 20px;
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: 18px;
        }
        .lb-empty h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary); }
        .lb-empty p { color: var(--text-muted); font-size: 0.85rem; }
        .lb-loading {
          display: flex; align-items: center; justify-content: center;
          padding: 60px; color: #ff3355;
        }
      `}</style>

      <div className="lb-root">
        {/* Hero */}
        <section className="lb-hero">
          <div className="lb-hero-blob lb-hero-blob1" />
          <div className="lb-hero-blob lb-hero-blob2" />

          <motion.div
            className="lb-trophy-wrap"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <Trophy size={36} color="#fff" />
          </motion.div>

          <motion.div className="lb-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Zap size={11} /> Hall of Heroes
          </motion.div>
          <motion.h1 className="lb-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            LifeFlow <span>Champions</span>
          </motion.h1>
          <motion.p className="lb-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            Celebrating the top donors who consistently go above and beyond to save lives every day.
          </motion.p>
        </section>

        <div className="lb-container">
          {loading ? (
            <div className="lb-loading">
              <Activity size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : leaders.length === 0 ? (
            <div className="lb-empty">
              <Medal size={36} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 1rem', display: 'block' }} />
              <h3>No Heroes Yet</h3>
              <p>Be the first to donate and claim your spot on the leaderboard!</p>
            </div>
          ) : (
            <>
              {/* Podium — top 3 */}
              <div className="lb-podium">
                {[1, 0, 2].map(i => {
                  const l = leaders[i]; if (!l) return null;
                  const cfg = RANK_CONFIG[i];
                  const cls = i === 0 ? 'first' : i === 1 ? 'second' : 'third';
                  return (
                    <motion.div
                      key={l.id}
                      className={`lb-podium-card ${cls}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="lb-rank-badge" style={{ background: cfg.bg, '--rb-shadow': cfg.shadow }}>
                        {cfg.icon}
                      </div>
                      <div className="lb-card-avatar">{l.name.charAt(0)}</div>
                      <div className="lb-card-name">{l.name}</div>
                      <div className="lb-card-city"><MapPin size={11} /> {l.city || 'Unknown'}</div>
                      <div className="lb-card-stats">
                        <div className="lb-blood-chip"><Droplet size={11} /> {l.bloodGroup || '?'}</div>
                        <div className="lb-pts">{l.points}<span>pts</span></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Rank 4+ list */}
              {leaders.length > 3 && (
                <div className="lb-list-card">
                  <div className="lb-list-header">
                    <div>#</div>
                    <div>Donor</div>
                    <div className="hide-sm">City</div>
                    <div className="hide-sm">Blood</div>
                    <div style={{ textAlign: 'right' }}>Points</div>
                  </div>
                  {leaders.slice(3).map((l, i) => (
                    <motion.div
                      key={l.id}
                      className="lb-list-row"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="lb-list-rank">#{i + 4}</div>
                      <div className="lb-list-name">
                        <div className="lb-list-avatar">{l.name.charAt(0)}</div>
                        <div>
                          <div>{l.name}</div>
                          <div className="lb-list-badge-text">{l.badge}</div>
                        </div>
                      </div>
                      <div className="lb-list-city hide-sm">{l.city || '-'}</div>
                      <div className="hide-sm"><span className="lb-list-blood">{l.bloodGroup || '?'}</span></div>
                      <div className="lb-list-pts">{l.points}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
