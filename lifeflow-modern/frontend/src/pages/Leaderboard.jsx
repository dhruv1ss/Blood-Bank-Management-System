/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, MapPin, Droplet, Activity } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/user/leaderboard');
        if (res.data.status === 'success') {
          setLeaders(res.data.data);
        }
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);


  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col relative overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-yellow-300/20 to-red-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/30 border-4 border-white transform rotate-3"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-gray-900 brand-font mb-4 tracking-tight"
          >
            LifeFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-500">Heroes</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Celebrating the top donors in our community who consistently go above and beyond to save lives.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Activity className="w-10 h-10 text-red-500 animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-white/80 rounded-3xl border border-gray-100 p-20 text-center text-gray-400 shadow-sm backdrop-blur-xl">
            <Medal className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-2xl font-bold text-gray-900 brand-font mb-2">No Heroes Yet</h3>
            <p>Be the first to donate and claim your spot on the leaderboard!</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {/* Top 3 Podium (Visual grouping) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-12 md:mt-24 items-end">
              
              {/* Rank 2 */}
              {leaders[1] && (
                <motion.div variants={itemVariants} className="order-2 md:order-1 relative bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 border-2 border-gray-200 shadow-lg text-center transform md:-translate-y-4">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-2xl font-black text-gray-500 brand-font">#2</span>
                  </div>
                  <div className="mt-8 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{leaders[1].name}</h3>
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" /> {leaders[1].city || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex border border-red-200 bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                      <Droplet className="w-4 h-4 mr-1" /> {leaders[1].bloodGroup || '?'}
                    </div>
                    <div className="font-black text-2xl text-gray-900 brand-font">{leaders[1].points} <span className="text-sm text-gray-400 font-normal">pts</span></div>
                  </div>
                </motion.div>
              )}

              {/* Rank 1 */}
              {leaders[0] && (
                <motion.div variants={itemVariants} className="order-1 md:order-2 relative bg-gradient-to-b from-amber-50 to-white backdrop-blur-xl rounded-[2.5rem] p-8 border-2 border-amber-200 shadow-2xl shadow-amber-500/20 text-center z-10">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-yellow-500/40 border-4 border-white transform rotate-3">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md font-black text-amber-500 text-xl brand-font">#1</div>
                  
                  <div className="mt-8 mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      {leaders[0].badge} Rank
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 truncate brand-font">{leaders[0].name}</h3>
                    <div className="flex items-center justify-center gap-2 text-gray-500 mt-2">
                      <MapPin className="w-4 h-4" /> {leaders[0].city || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-5 border border-amber-100/50 flex justify-between items-center shadow-sm">
                    <div className="flex border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold">
                      <Droplet className="w-5 h-5 mr-1" /> {leaders[0].bloodGroup || '?'}
                    </div>
                    <div className="font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500 brand-font">
                      {leaders[0].points} <span className="text-lg text-gray-400 font-normal">pts</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Rank 3 */}
              {leaders[2] && (
                <motion.div variants={itemVariants} className="order-3 md:order-3 relative bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 border-2 border-orange-200/50 shadow-lg text-center transform md:-translate-y-2">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-2xl font-black text-white brand-font">#3</span>
                  </div>
                  <div className="mt-8 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{leaders[2].name}</h3>
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" /> {leaders[2].city || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex border border-red-200 bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                      <Droplet className="w-4 h-4 mr-1" /> {leaders[2].bloodGroup || '?'}
                    </div>
                    <div className="font-black text-2xl text-gray-900 brand-font">{leaders[2].points} <span className="text-sm text-gray-400 font-normal">pts</span></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List for Rank 4+ */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-gray-200/40 p-2 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-sm uppercase tracking-wider font-semibold">
                      <th className="p-4 rounded-tl-2xl">Rank</th>
                      <th className="p-4">Donor</th>
                      <th className="p-4 hidden sm:table-cell">City</th>
                      <th className="p-4 hidden md:table-cell">Blood</th>
                      <th className="p-4 text-right rounded-tr-2xl">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.slice(3).map((leader, index) => (
                      <motion.tr 
                        key={leader.id}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.8)', scale: 1.01 }}
                        className="border-b border-gray-50 last:border-0 group transition-all"
                      >
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            #{index + 4}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 uppercase">
                              {leader.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-md">{leader.name}</div>
                              <div className="text-xs text-gray-400 font-medium">{leader.badge}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 hidden sm:table-cell">
                          {leader.city || '-'}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                            {leader.bloodGroup || '?'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-black text-xl text-gray-900 brand-font">
                            {leader.points}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {leaders.length <= 3 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                          More heroes needed to fill the ranks!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
