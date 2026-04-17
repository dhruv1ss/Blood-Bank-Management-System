import React from 'react';
import { motion as Motion } from 'framer-motion';

const SVGMedal = ({ tier, size = "md" }) => {
    const sizeMap = {
        sm: "w-12 h-12",
        md: "w-20 h-20",
        lg: "w-32 h-32",
        xl: "w-48 h-48"
    };

    const shineVariants = {
        animate: {
            x: ["-100%", "200%"],
            transition: {
                duration: 3.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1.5
            }
        }
    };

    const floatVariants = {
        animate: {
            y: [-3, 3, -3],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    };

    const renderBadge = () => {
        switch (tier) {
            case 'Starter':
            case 'Star':
                return (
                    <Motion.g animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                        {/* 3D 5-pointed star */}
                        <path d="M50 10 L60 38 L90 40 L65 60 L75 88 L50 72 L25 88 L35 60 L10 40 L40 38 Z" fill="url(#starterBase)" stroke="#450a0a" strokeWidth="1" />
                        <path d="M50 10 L60 38 L50 50 Z" fill="#ffffff" opacity="0.5" />
                        <path d="M90 40 L65 60 L50 50 Z" fill="#000000" opacity="0.15" />
                        <path d="M75 88 L65 60 L50 50 Z" fill="#000000" opacity="0.3" />
                        <path d="M25 88 L50 72 L50 50 Z" fill="#ffffff" opacity="0.1" />
                        <path d="M10 40 L35 60 L50 50 Z" fill="#ffffff" opacity="0.4" />
                        <circle cx="50" cy="50" r="10" fill="url(#goldBase)" stroke="#B8860B" strokeWidth="1" />
                        <Motion.path d="M50 10 L60 38 L90 40 L65 60 L75 88 L50 72 L25 88 L35 60 L10 40 L40 38 Z" fill="url(#shineGrad)" variants={shineVariants} animate="animate" opacity="0.5" />
                    </Motion.g>
                );

            case 'Bronze':
            case 'Life Saver':
                return (
                    <Motion.g variants={floatVariants} animate="animate">
                        {/* Shield Base */}
                        <path d="M25 15 L75 15 L85 45 C85 75 50 95 50 95 C50 95 15 75 15 45 Z" fill="url(#bronzeGrad)" stroke="#5c2e0e" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
                        <path d="M25 15 L50 25 L75 15 L85 45 C85 70 50 90 50 90 C50 90 15 70 15 45 Z" fill="url(#bronzeHighlight)" />
                        {/* Center Engraving */}
                        <polygon points="50,30 65,50 50,75 35,50" fill="#5c2e0e" opacity="0.8" />
                        <polygon points="50,30 65,50 50,75 50,30" fill="#8B4513" />
                        <circle cx="50" cy="50" r="5" fill="#fca5a5" />
                        <Motion.path d="M25 15 L75 15 L85 45 C85 75 50 95 50 95 C50 95 15 75 15 45 Z" fill="url(#shineGrad)" variants={shineVariants} animate="animate" opacity="0.4" />
                    </Motion.g>
                );

            case 'Silver':
            case 'Guardian':
                return (
                    <Motion.g animate={{ rotateY: [0, 15, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                        {/* Metallic Wings */}
                        <path d="M5 40 L30 25 L30 75 L5 60 Z" fill="url(#silverGrad)" stroke="#475569" strokeWidth="1" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.2))" />
                        <path d="M95 40 L70 25 L70 75 L95 60 Z" fill="url(#silverGrad)" stroke="#475569" strokeWidth="1" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.2))" />
                        {/* Dual Layer Pentagon */}
                        <polygon points="50,10 80,30 80,75 50,95 20,75 20,30" fill="url(#silverGrad)" stroke="#E2E8F0" strokeWidth="2.5" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.4))" />
                        <polygon points="50,22 70,36 70,68 50,82 30,68 30,36" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3"/>
                        <circle cx="50" cy="52" r="14" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
                        <path d="M47 46 L53 46 L53 58 L47 58 Z" fill="#64748B" />
                        <Motion.polygon points="50,10 80,30 80,75 50,95 20,75 20,30" fill="url(#shineGrad)" variants={shineVariants} animate="animate" opacity="0.6" />
                    </Motion.g>
                );

            case 'Gold':
                return (
                    <Motion.g animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                        <g transform="rotate(0, 50, 50)">
                            {/* Majestic Sunburst Crest */}
                            <path d="M50 2 L58 18 L76 12 L70 30 L88 36 L76 48 L88 62 L70 68 L76 86 L58 80 L50 96 L42 80 L24 86 L30 68 L12 62 L24 48 L12 36 L30 30 L24 12 L42 18 Z" fill="url(#goldBase)" stroke="#B8860B" strokeWidth="1.5" filter="drop-shadow(0 6px 12px rgba(234,179,8,0.4))" />
                            <circle cx="50" cy="50" r="26" fill="#FFD700" stroke="#ffedd5" strokeWidth="2" />
                            <circle cx="50" cy="50" r="20" fill="none" stroke="#A16207" strokeWidth="1.5" strokeDasharray="2 3" />
                            <circle cx="50" cy="50" r="14" fill="url(#rubyGrad)" />
                            {/* Center Star Inside Ruby */}
                            <polygon points="50,38 52,44 58,45 53,49 55,55 50,51 45,55 47,49 42,45 48,44" fill="#ffffff" />
                        </g>
                    </Motion.g>
                );

            case 'Platinum':
                return (
                    <Motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                        {/* Floating Crystal Matrix */}
                        <path d="M50 5 L75 35 L85 65 L50 95 L15 65 L25 35 Z" fill="url(#platGrad)" stroke="#FFFFFF" strokeWidth="2" filter="drop-shadow(0 15px 20px rgba(2,132,199,0.3))" />
                        
                        {/* 3D Crystal Facets */}
                        <path d="M50 5 L75 35 L50 50 Z" fill="#FFFFFF" opacity="0.8" />
                        <path d="M50 5 L25 35 L50 50 Z" fill="#BAE6FD" opacity="0.4" />
                        <path d="M75 35 L85 65 L50 50 Z" fill="#0284C7" opacity="0.2" />
                        <path d="M25 35 L15 65 L50 50 Z" fill="#38BDF8" opacity="0.6" />
                        <path d="M85 65 L50 95 L50 50 Z" fill="#0369A1" opacity="0.4" />
                        <path d="M15 65 L50 95 L50 50 Z" fill="#7DD3FC" opacity="0.4" />
                        
                        {/* Glowing core */}
                        <circle cx="50" cy="50" r="6" fill="#FFFFFF" filter="blur(2px)" />
                        
                        <Motion.path d="M50 5 L75 35 L85 65 L50 95 L15 65 L25 35 Z" fill="url(#shineGrad)" variants={shineVariants} animate="animate" opacity="0.5" />
                    </Motion.g>
                );

            case 'Diamond':
                return (
                    <g>
                        {/* Ethereal Aura Rings */}
                        <Motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#diamondBase)" strokeWidth="3" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} strokeDasharray="20 10 5 10" opacity="0.6" />
                        <Motion.circle cx="50" cy="50" r="46" fill="none" stroke="#7DD3FC" strokeWidth="1" animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} strokeDasharray="4 8" opacity="0.8" />
                        
                        {/* Perfect Faceted Gem */}
                        <Motion.g animate={{ rotateY: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} transform-origin="50px 50px">
                            <path d="M28 35 L72 35 L85 48 L50 85 L15 48 Z" fill="url(#diamondBase)" stroke="#FFFFFF" strokeWidth="1.5" filter="drop-shadow(0 10px 25px rgba(2,132,199,0.5))" />
                            {/* Top Crown Facets */}
                            <path d="M28 35 L40 22 L60 22 L72 35 L50 48 Z" fill="#FFFFFF" opacity="0.9" />
                            <path d="M40 22 L60 22 L50 35 Z" fill="#E0F2FE" />
                            {/* Bottom Pavilion Facets */}
                            <path d="M28 35 L50 85 L50 48 Z" fill="#0EA5E9" opacity="0.4" />
                            <path d="M72 35 L50 85 L50 48 Z" fill="#0284C7" opacity="0.6" />
                            <path d="M15 48 L28 35 L50 48 Z" fill="#7DD3FC" opacity="0.7" />
                            <path d="M85 48 L72 35 L50 48 Z" fill="#38BDF8" opacity="0.5" />
                        </Motion.g>
                    </g>
                );

            case 'Legend':
                return (
                    <Motion.g animate={{ filter: ["drop-shadow(0px 0px 10px rgba(255,215,0,0.5))", "drop-shadow(0px 0px 25px rgba(255,215,0,0.8))", "drop-shadow(0px 0px 10px rgba(255,215,0,0.5))"] }} transition={{ duration: 4, repeat: Infinity }}>
                        {/* Imperial Wreath */}
                        <path d="M20 85 C5 60 5 30 25 15 M80 85 C95 60 95 30 75 15" stroke="url(#goldBase)" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M18 75 L28 65 M15 60 L28 50 M15 45 L28 35 M18 30 L28 20" stroke="url(#goldBase)" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M82 75 L72 65 M85 60 L72 50 M85 45 L72 35 M82 30 L72 20" stroke="url(#goldBase)" strokeWidth="2.5" strokeLinecap="round" />
                        
                        {/* Emperor Crown Body */}
                        <path d="M25 70 L15 40 L35 55 L50 20 L65 55 L85 40 L75 70 C75 80 25 80 25 70 Z" fill="url(#legendGrad)" stroke="#FFD700" strokeWidth="1.5" />
                        <path d="M25 70 L15 40 L35 55 L50 20 L65 55 L85 40 L75 70 C75 80 25 80 25 70 Z" fill="url(#shineGrad)" variants={shineVariants} animate="animate" opacity="0.5" />
                        
                        {/* Velvet Cushion */}
                        <path d="M25 70 C25 85 75 85 75 70 C75 75 25 75 25 70 Z" fill="#991B1B" />
                        <path d="M25 70 C25 80 75 80 75 70 C75 75 25 75 25 70 Z" fill="#000000" opacity="0.3" />
                        
                        {/* Royal Jewels (Ruby, Emerald, Sapphire, Diamond) */}
                        <circle cx="15" cy="40" r="3" fill="#FFFFFF" filter="drop-shadow(0 0 2px white)" />
                        <circle cx="35" cy="55" r="3.5" fill="#10B981" stroke="#FFD700" strokeWidth="0.5" />
                        <circle cx="50" cy="20" r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 0 5px #3B82F6)" />
                        <circle cx="65" cy="55" r="3.5" fill="#EF4444" stroke="#FFD700" strokeWidth="0.5" />
                        <circle cx="85" cy="40" r="3" fill="#FFFFFF" filter="drop-shadow(0 0 2px white)" />
                        
                        <circle cx="50" cy="62" r="5" fill="#D946EF" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 0 5px #D946EF)" />
                        <circle cx="35" cy="72" r="2.5" fill="#FFFFFF" />
                        <circle cx="65" cy="72" r="2.5" fill="#FFFFFF" />
                        
                        {/* Central Top Cross */}
                        <path d="M48 5 h4 v10 h-4 z M44 9 h12 v4 h-12 z" fill="#FFD700" />
                    </Motion.g>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`${sizeMap[size]} relative flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="starterBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#CD7F32" />
                        <stop offset="50%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#5c2e0e" />
                    </linearGradient>
                    <linearGradient id="bronzeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D2691E" />
                        <stop offset="100%" stopColor="#8B4513" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F8FAFC" />
                        <stop offset="50%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                    <linearGradient id="goldBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDE047" />
                        <stop offset="50%" stopColor="#EAB308" />
                        <stop offset="100%" stopColor="#A16207" />
                    </linearGradient>
                    <linearGradient id="platGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E0F2FE" />
                        <stop offset="50%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="diamondBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F0F9FF" />
                        <stop offset="50%" stopColor="#7DD3FC" />
                        <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                    <radialGradient id="rubyGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#7F1D1D" />
                    </radialGradient>
                    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {renderBadge()}

                {/* Ambient Particles around the Badge */}
                {[...Array(4)].map((_, i) => (
                    <Motion.circle
                        key={i}
                        cx={10 + ((i * 17) % 80)}
                        cy={10 + ((i * 23) % 80)}
                        r="1"
                        fill="white"
                        animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], y: [0, -10] }}
                        transition={{ duration: 2.5 + (i * 0.3), repeat: Infinity, delay: i * 0.5 }}
                    />
                ))}
            </svg>
        </div>
    );
};

const PremiumMedal = ({ tier = "Starter", size = "md" }) => {
    return <SVGMedal tier={tier} size={size} />;
};

export default PremiumMedal;
