/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Heart, X, AlertTriangle, MessageSquare, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatStore } from '../context/chatStore';

const EmergencyFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openChat } = useChatStore();

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="flex items-center gap-3"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black brand-font text-gray-900 border border-gray-100 shadow-sm uppercase tracking-wider text-right">Medical Assistant</span>
              <button
                onClick={() => {
                   setIsOpen(false);
                   openChat();
                }}
                className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl border border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="flex items-center gap-3"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black brand-font text-gray-900 border border-gray-100 shadow-sm uppercase tracking-wider">Find Camps</span>
              <Link
                to="/camps"
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl border border-gray-100 hover:bg-red-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MapPin className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black brand-font text-gray-900 border border-gray-100 shadow-sm uppercase tracking-wider">Check Compatibility</span>
              <Link
                to="/compatibility"
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl border border-gray-100 hover:bg-red-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="bg-red-600 px-3 py-1.5 rounded-lg text-xs font-black brand-font text-white shadow-xl shadow-red-500/20 uppercase tracking-wider">Emergency Call</span>
              <a
                href="tel:108"
                className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/30 hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative ${
          isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-red-600 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="alert"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              className="relative"
            >
              <HeartPulse className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default EmergencyFAB;
