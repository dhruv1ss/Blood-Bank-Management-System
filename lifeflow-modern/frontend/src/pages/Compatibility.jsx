/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplets, Info, CheckCircle2, AlertCircle, ArrowRightLeft, Users } from 'lucide-react';
import { useAuthStore } from '../context/authStore';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMPATIBILITY_DATA = {
  'A+': { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
  'A-': { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
  'B+': { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
  'B-': { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
  'AB+': { give: ['AB+'], receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'AB-': { give: ['AB+', 'AB-'], receive: ['A-', 'B-', 'AB-', 'O-'] },
  'O+': { give: ['A+', 'B+', 'AB+', 'O+'], receive: ['O+', 'O-'] },
  'O-': { give: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receive: ['O-'] },
};

const CompatibilityCard = ({ type, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2 ${
      isSelected 
        ? 'bg-red-600 border-red-600 text-white shadow-2xl shadow-red-500/40 translate-z-10' 
        : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:border-red-400'
    }`}
  >
    <Droplets className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-red-500'}`} />
    <span className="text-2xl font-black brand-font">{type}</span>
    {isSelected && (
      <motion.div
        layoutId="active-glow"
        className="absolute -inset-1 bg-red-400/20 blur-xl rounded-full -z-10"
      />
    )}
  </motion.button>
);

const Compatibility = () => {
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState(
    () => {
      const bg = user?.bloodGroup;
      return BLOOD_TYPES.includes(bg) ? bg : 'O-';
    }
  );

  const data = COMPATIBILITY_DATA[selectedType];

  return (
    <div className="min-h-screen pb-20 overflow-hidden">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 text-white py-20 px-6 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-black uppercase tracking-widest mb-6"
          >
            <ArrowRightLeft className="w-4 h-4" /> Comprehensive Guide
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black brand-font mb-6">Blood <span className="text-red-500">Compatibility</span> checker</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Understanding who you can help and who can help you is critical in an emergency. Select a blood type to visualize its compatibility network.
          </p>
        </div>
      </section>

      {/* Selector Section */}
      <section className="container mx-auto max-w-6xl px-6 -mt-12 relative z-20">
        <div className="bg-[var(--bg-primary)] rounded-[3rem] shadow-2xl shadow-black/10 p-10 border border-[var(--border)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {BLOOD_TYPES.map(type => (
              <CompatibilityCard
                key={type}
                type={type}
                isSelected={selectedType === type}
                onClick={() => setSelectedType(type)}
              />
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Can Give To */}
            <motion.div
              key={`give-${selectedType}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 border border-[var(--border)] relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black brand-font text-[var(--text-primary)]">Can Give To</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Potential recipients for {selectedType}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {data.give.map(type => (
                  <span key={type} className="px-6 py-3 rounded-2xl bg-red-600/10 text-red-600 font-black brand-font text-lg border border-red-600/20">
                    {type}
                  </span>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 leading-relaxed font-medium">
                  {selectedType === 'O-' ? 'As a Universal Donor, you can give to anyone in an emergency.' : `You can safely donate your blood to individuals with these types.`}
                </p>
              </div>
            </motion.div>

            {/* Can Receive From */}
            <motion.div
              key={`receive-${selectedType}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 border border-[var(--border)] relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Droplets className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black brand-font text-[var(--text-primary)]">Can Receive From</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Compatible donors for {selectedType}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {data.receive.map(type => (
                  <span key={type} className="px-6 py-3 rounded-2xl bg-blue-600/10 text-blue-600 font-black brand-font text-lg border border-blue-600/20">
                    {type}
                  </span>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                   {selectedType === 'AB+' ? 'As a Universal Recipient, you can receive blood from any donor.' : `In case of emergency, you can safely receive blood from these donor types.`}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facts & Table Section */}
      <section className="container mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black brand-font mb-8 text-[var(--text-primary)] uppercase tracking-tight">Compatibility Table</h2>
            <div className="overflow-x-auto rounded-[2rem] border border-[var(--border)] shadow-xl shadow-black/5 bg-[var(--bg-secondary)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-6 brand-font uppercase text-xs tracking-widest">Type</th>
                    <th className="p-6 brand-font uppercase text-xs tracking-widest">Can Give To</th>
                    <th className="p-6 brand-font uppercase text-xs tracking-widest">Can Receive From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {BLOOD_TYPES.map(type => (
                    <tr key={type} className={`hover:bg-red-50/50 transition-colors ${selectedType === type ? 'bg-red-50/80' : ''}`}>
                      <td className="p-6 font-black brand-font text-red-600">{type}</td>
                      <td className="p-6 text-[var(--text-secondary)] text-sm">{COMPATIBILITY_DATA[type].give.join(', ')}</td>
                      <td className="p-6 text-[var(--text-secondary)] text-sm">{COMPATIBILITY_DATA[type].receive.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black brand-font mb-8 text-[var(--text-primary)] uppercase tracking-tight">Fast Facts</h2>
            
            <motion.div 
               whileHover={{ x: 10 }}
               className="p-6 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-black brand-font uppercase tracking-tight">O- is Special</h4>
              </div>
              <p className="text-red-50 text-sm leading-relaxed opacity-90">
                O-negative blood is known as the "universal donor" because it can be given to patients of any blood type in an emergency when there is no time to crossmatch.
              </p>
            </motion.div>

            <motion.div 
               whileHover={{ x: 10 }}
               className="p-6 bg-gray-900 rounded-3xl text-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6" />
                <h4 className="font-black brand-font uppercase tracking-tight">AB+ Recipient</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AB-positive blood is the "universal recipient" because individuals with this type can safely receive blood from any other donor type.
              </p>
            </motion.div>

            <div className="p-8 rounded-[2rem] border-2 border-dashed border-red-200 text-center">
              <Heart className="w-10 h-10 text-red-100 mx-auto mb-4" />
              <p className="text-sm text-gray-500 italic">"The gift of blood is the gift of life."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compatibility;
