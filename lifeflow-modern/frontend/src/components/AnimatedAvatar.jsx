/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedAvatar = ({ size = 'sm', user }) => {
  const isLg = size === 'lg';
  const containerSize = isLg ? 'w-32 h-32' : 'w-10 h-10';
  const emojiSize = isLg ? 'text-5xl' : 'text-xl';
  
  // Get initial from name or default to 👤
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '👤';
  
  // Emojis that float out on hover
  const floatingEmojis = ['❤️', '🩸', '🌟', '🛡️', '✨'];

  return (
    <motion.div 
      className={`relative flex items-center justify-center ${containerSize} transition-all duration-300`}
      whileHover="hover"
    >
      {/* Floating Emojis on Hover */}
      <AnimatePresence>
        {floatingEmojis.map((emoji, i) => (
          <motion.span
            key={i}
            variants={{
              hover: {
                opacity: [0, 1, 0],
                y: [0, -40 - (i * 20)],
                x: [0, (i % 2 === 0 ? 20 : -20) * (i + 1)],
                scale: [0.5, 1.2, 0.8],
                rotate: [0, i % 2 === 0 ? 45 : -45],
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeOut"
                }
              }
            }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            className="absolute z-0 pointer-events-none select-none text-lg"
          >
            {emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main Avatar Circle */}
      <motion.div
        variants={{
          hover: { scale: 1.1, rotate: [0, -5, 5, 0] }
        }}
        className={`relative z-10 ${containerSize} rounded-[2rem] bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black brand-font shadow-lg border-4 border-white overflow-hidden group`}
      >
        {/* User Photo (if uploaded) or Initial */}
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback to initial if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div className={`w-full h-full items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}>
            {/* Animated Background Pulse */}
            <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-white/20 rounded-full"
            />

            {/* User Initial or Emoji */}
            <span className={`${emojiSize} relative z-10 drop-shadow-md group-hover:scale-110 transition-transform`}>
            {initial}
            </span>
        </div>
        
        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Decorative Outer Ring for LG */}
      {isLg && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute inset-[-8px] rounded-[2.5rem] border-2 border-dashed border-red-500/30 z-0"
        />
      )}

      {/* Status Indicator */}
      <motion.span 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`absolute ${isLg ? 'bottom-2 right-2 w-6 h-6 border-4' : 'bottom-0 right-0 w-3 h-3 border-2'} bg-green-500 rounded-full border-white shadow-sm z-20`}
      />
    </motion.div>
  );
};

export default AnimatedAvatar;
