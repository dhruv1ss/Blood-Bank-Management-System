import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Activity, Users, ShieldCheck, ArrowRightLeft, Navigation, Play, ChevronRight, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import LifePulseMap from '../components/LifePulseMap';
import SurvivorGallery from '../components/SurvivorGallery';
import LifePath from '../components/LifePath';

const Counter = ({ end, duration = 2.5, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let frameId;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easing * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};



const LiquidHero = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
    const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

    const [drops] = useState(() => [...Array(6)].map((_, i) => ({
        id: i,
        delay: i * 2,
        duration: 15 + i * 2,
        initialX: (Math.random() * 80 + 10) + "%",
        targetX: (Math.random() * 80 + 10) + "%",
        initialY: (Math.random() * 80 + 10) + "%",
        targetY: (Math.random() * 80 + 10) + "%",
    })));
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 150);
            mouseY.set(e.clientY - 150);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {drops.map((drop) => (
                <Motion.div
                    key={drop.id}
                    initial={{ x: drop.initialX, y: drop.initialY, scale: 1 }}
                    animate={{ 
                        x: [drop.initialX, drop.targetX, drop.initialX],
                        y: [drop.initialY, drop.targetY, drop.initialY],
                        scale: [1, 1.2, 0.9, 1]
                    }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute w-64 h-64 bg-red-600/30 rounded-full liquid-drop"
                />
            ))}

            {/* Mouse Reactive Drop */}
            <Motion.div
                style={{
                    x: springX,
                    y: springY,
                }}
                className="absolute w-[300px] h-[300px] bg-red-500/40 rounded-full liquid-drop blur-3xl z-10"
            />
        </div>
    );
};

const Home = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    livesSaved: 15420,
    activeDonors: 8750,
    successfulUnits: 21000,
    verifiedCenters: 450
  });
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('public-stats');
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full bg-white text-gray-900 overflow-hidden font-sans">

      
      {/* Cinematic Hero Section (Dark Image Backdrop) */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
         {/* Smooth Continuous Cinematic Background */}
         <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10"></div>
            <Motion.img 
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.08, rotate: 0.5 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=2560" 
              alt="Medical background"
              className="w-full h-full object-cover origin-center"
            />
            {/* Liquid Physics Layer */}
            <LiquidHero />
         </div>

         {/* Floating Glass Badges */}
         <Motion.div 
           animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[20%] right-[15%] z-20 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
         >
           <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
             <Heart className="w-5 h-5 fill-current" />
           </div>
           <div>
             <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Trusted Network</p>
             <p className="text-sm text-white font-bold">50+ Verified Hospitals</p>
           </div>
         </Motion.div>

         <Motion.div 
           animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="absolute bottom-[30%] left-[10%] z-20 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
         >
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
             <Activity className="w-5 h-5" />
           </div>
           <div>
             <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Live Status</p>
             <p className="text-sm text-white font-bold">Emergency Active</p>
           </div>
         </Motion.div>

         <div className="container mx-auto px-6 relative z-10 text-center">
             <Motion.div 
               style={{ opacity: opacityText }}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
             >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest uppercase mb-8 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Save Lives Today
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black mb-8 tracking-tighter leading-[1.02] brand-font text-white drop-shadow-sm">
                   Donate Blood. <br className="hidden md:block"/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-300 to-white">
                     Inspire Humanity.
                   </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/80 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                   Join an elite network of heroes. Every drop you give fuels the future, saving up to three lives with a single heroic act.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                   <Link to={user ? (user.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard') : '/register'} 
                         className="group relative px-10 py-5 bg-red-600 rounded-full font-bold text-white overflow-hidden w-full sm:w-auto text-center transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(220,38,38,0.4)]">
                     <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                        {user ? 'Go to Dashboard' : 'Become a Hero'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                     </span>
                     <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </Link>
                   
                   <Link to="/camps" 
                         className="group px-10 py-5 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full font-bold text-white transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 text-lg">
                     <Navigation className="w-5 h-5 text-red-400 group-hover:-translate-y-0.5 transition-transform"/> Find Active Camps
                   </Link>
                </div>
             </Motion.div>
         </div>

         {/* Bottom Fade into Light Mode */}
         <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent z-10"></div>
      </section>

      {/* Stats Section with Light Glassmorphism */}
      <section className="relative z-20 py-20 bg-gray-50 px-6">
         <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Heart, label: "Lives Saved", value: stats.livesSaved, suffix: "+", color: "text-red-500", bg: "bg-red-50", fill: "rgba(239, 68, 68, 0.08)" },
                  { icon: Users, label: "Active Donors", value: stats.activeDonors, suffix: "+", color: "text-blue-500", bg: "bg-blue-50", fill: "rgba(59, 130, 246, 0.08)" },
                  { icon: Activity, label: "Successful Units", value: stats.successfulUnits, suffix: "", color: "text-emerald-500", bg: "bg-emerald-50", fill: "rgba(16, 185, 129, 0.08)" },
                  { icon: ShieldCheck, label: "Verified Centers", value: stats.verifiedCenters, suffix: "", color: "text-purple-500", bg: "bg-purple-50", fill: "rgba(168, 85, 247, 0.08)" },
                ].map((stat, idx) => (
                  <Motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative p-8 rounded-[2rem] bg-white border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/40 transition-all cursor-pointer"
                  >
                    {/* Liquid Impact Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <Motion.svg 
                            viewBox="0 0 100 100" 
                            className="absolute bottom-0 left-0 w-full h-[150%] opacity-100"
                            initial={{ y: "100%" }}
                            whileInView={{ y: "45%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 + idx * 0.1 }}
                        >
                            <Motion.path 
                                animate={{ 
                                    d: [
                                        "M 0 50 Q 25 40 50 50 T 100 50 V 100 H 0 Z",
                                        "M 0 50 Q 25 60 50 50 T 100 50 V 100 H 0 Z",
                                        "M 0 50 Q 25 40 50 50 T 100 50 V 100 H 0 Z"
                                    ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                fill={stat.fill}
                            />
                        </Motion.svg>
                    </div>

                    {/* Hover Glow */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg.replace('50', '200')}`}></div>
                    
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 ${stat.color} border border-white shadow-inner relative z-10`}>
                       <stat.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-black text-gray-900 brand-font mb-2 relative z-10">
                       <Counter end={stat.value} suffix={stat.suffix} />
                    </h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs relative z-10">{stat.label}</p>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>

      <LifePulseMap />

      <SurvivorGallery />

      <LifePath />

      {/* Editorial 'How it Works' Cards */}
Line 284:
      <section className="py-24 bg-white relative">
         <div className="container mx-auto px-6">
            <Motion.div 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once:true }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
               <h2 className="text-sm font-black text-red-600 tracking-[0.2em] uppercase mb-4 bg-red-50 inline-block px-4 py-2 rounded-full">The Process</h2>
               <h3 className="text-4xl md:text-6xl font-black brand-font tracking-tight text-gray-900 mt-4">Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Donate Blood?</span></h3>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800", title: "Safe & Clinical", desc: "Equipped with state-of-the-art sterile tools, the process takes merely 10 minutes in a comforting environment.", num: "01" },
                  { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", title: "Health Vitals Check", desc: "Every donor receives a complimentary advanced mini-physical, tracking pulse, blood pressure, and hemoglobin.", num: "02" },
                  { img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800", title: "Maximize Impact", desc: "A single pint is separated into plasma, platelets, and red cells—amplifying your heroic impact to save three lives.", num: "03" }
                ].map((card, i) => (
                  <Motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 hover:shadow-red-200/40 aspect-[4/5]"
                  >
                     <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                     {/* Light Mode Overlay (Semi-transparent white gradient) */}
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
                     
                     <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                        <span className="text-white/80 font-black text-6xl brand-font mb-4 block transform group-hover:-translate-y-2 transition-transform duration-500 opacity-90">{card.num}</span>
                        <h4 className="text-3xl font-black text-white mb-3 transform group-hover:-translate-y-2 transition-transform duration-500 leading-tight">{card.title}</h4>
                        <p className="text-white/80 text-base font-medium leading-relaxed transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                          {card.desc}
                        </p>
                     </div>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>      {/* THE LEGACY OF KARL LANDSTEINER */}
      <section className="py-32 bg-white relative overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-4 bg-red-600/5 rounded-[4rem] blur-2xl group-hover:bg-red-600/10 transition-colors duration-700"></div>
                     <div className="relative rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Karl_Landsteiner_nobel.jpg" 
                          alt="Karl Landsteiner" 
                          className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-10 left-10 text-white">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">Nobel Laureate</p>
                           <h4 className="text-2xl font-black brand-font tracking-tight">Karl Landsteiner <span className="text-red-500">.</span></h4>
                        </div>
                     </div>
                     
                     {/* Floating Badge */}
                     <Motion.div 
                       animate={{ y: [0, -15, 0] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white border border-gray-100 shadow-xl flex flex-col items-center justify-center p-6 text-center z-10"
                     >
                        <span className="text-3xl font-black text-red-600 brand-font mb-0.5">1930</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Nobel Prize Physiology</span>
                     </Motion.div>
                  </div>
               </Motion.div>

               {/* Content Side */}
               <div className="flex-1 space-y-10">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                     <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8">
                        <Activity className="w-4 h-4 text-red-500" />
                        The Father of Transfusion Medicine
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight leading-[1] text-gray-900 mb-8">
                        Discovering the <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">ABO Blood Matrix.</span>
                     </h2>
                     <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                        In 1900, Austrian-American biologist Karl Landsteiner made a discovery that would change the course of human history. By identifying that blood from different individuals clumped together when mixed, he mapped the 3 primary blood groups: A, B, and O.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-black brand-font border border-white shadow-inner">
                              01
                           </div>
                           <h5 className="text-lg font-black text-gray-900 brand-font">Safe Transfusions</h5>
                           <p className="text-sm text-gray-400 font-medium leading-relaxed">His research transformed blood donation from a dangerous ritual into a safe, routine clinical procedure.</p>
                        </div>
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black brand-font border border-white shadow-inner">
                              02
                           </div>
                           <h5 className="text-lg font-black text-gray-900 brand-font">Polio Research</h5>
                           <p className="text-sm text-gray-400 font-medium leading-relaxed">Beyond blood groups, he co-discovered the Polio virus, further cementing his status as a titan of science.</p>
                        </div>
                     </div>
                  </Motion.div>

                  <Motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 -skew-x-12 translate-x-16 -translate-y-8"></div>
                     <p className="text-gray-600 font-medium italic relative z-10">
                        "As long as there is any chance that a human life can be saved, it is the physician's duty to attempt a transfusion."
                     </p>
                     <div className="flex items-center gap-4 mt-6 relative z-10">
                        <div className="w-10 h-1 h-px bg-red-400 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">The Landsteiner Legacy</span>
                     </div>
                  </Motion.div>
               </div>
            </div>
         </div>
      </section>


      {/* THE LEGACY OF CHARLES R. DREW */}
      <section className="py-32 bg-gray-50/50 relative overflow-hidden">
         <div className="container mx-auto px-6 text-left">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
               
               {/* Content Side */}
               <div className="flex-1 space-y-10">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                     <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
                        <Droplets className="w-4 h-4 text-red-500" />
                        The Father of Blood Banks
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight leading-[1] text-gray-900 mb-8">
                        Innovating <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Blood Plasma Storage.</span>
                     </h2>
                     <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                        Dr. Charles Richard Drew was a pioneering African-American surgeon who revolutionized medicine by developing a technique for long-term blood plasma storage. His innovation directly led to the first large-scale blood banks in the United States.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black brand-font shadow-lg">
                              01
                           </div>
                           <h5 className="text-lg font-black text-gray-900 brand-font uppercase tracking-tight">Blood for Britain</h5>
                           <p className="text-sm text-gray-400 font-medium leading-relaxed">During WWII, he organized the successful "Blood for Britain" program, shipping life-saving plasma to protect lives across the Atlantic.</p>
                        </div>
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-600 font-black brand-font border border-gray-100 shadow-sm">
                              02
                           </div>
                           <h5 className="text-lg font-black text-gray-900 brand-font uppercase tracking-tight">Concept of Banking</h5>
                           <p className="text-sm text-gray-400 font-medium leading-relaxed">He established the first blood bank for the American Red Cross and pioneered the standardized processing of blood donations.</p>
                        </div>
                     </div>
                  </Motion.div>
               </div>

               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-4 bg-red-600/5 rounded-[4rem] blur-2xl group-hover:bg-red-600/10 transition-colors duration-700"></div>
                     <div className="relative rounded-[3.5rem] overflow-hidden border border-white shadow-2xl shadow-gray-200/50">
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2tJ6R2Gk0sSKTcaBOCyIViZCVwlu4YU2MPid9SYuXR-hDOG5r_LlDrePF57k_NGYUBx_og3Fely_A-P7KlqQtVZgE4SngEc4cVYCrZg&s=10" 
                          alt="Charles R. Drew" 
                          className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-10 right-10 text-white text-right">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">Surgeon & Pioneer</p>
                           <h4 className="text-2xl font-black brand-font tracking-tight">Dr. Charles R. Drew <span className="text-red-500">.</span></h4>
                        </div>
                     </div>
                     
                     {/* History Pin */}
                     <Motion.div 
                       animate={{ y: [0, 15, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -bottom-10 -left-10 w-40 h-16 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center gap-3 px-6 z-10"
                     >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                           <Droplets className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Plasma Pioneer</span>
                     </Motion.div>
                  </div>
               </Motion.div>

            </div>
         </div>
      </section>

      {/* AI Compatibility Mesh Gradient Section */}
      <section className="py-32 relative overflow-hidden bg-gray-50 border-t border-gray-100">
         {/* Animated Pastel Mesh Gradient Background */}
         <div className="absolute inset-0 opacity-50">
            <Motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-100 blur-[100px] mix-blend-multiply"
            />
            <Motion.div 
              animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-100 blur-[100px] mix-blend-multiply"
            />
         </div>
         
         <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 bg-white/70 p-10 md:p-16 rounded-[3rem] border border-white backdrop-blur-2xl shadow-2xl shadow-gray-200/50">
               <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-red-600 shadow-sm text-xs font-black tracking-widest uppercase mb-6">
                   <Droplets className="w-4 h-4 text-red-500" />
                   AI Powered
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black brand-font mb-6 leading-[1.1] tracking-tighter text-gray-900">
                   Check Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Compatibility.</span>
                 </h2>
                 <p className="text-xl text-gray-500 font-medium mb-10 max-w-lg leading-relaxed">
                   Instantly discover who you can donate to and receive from utilizing our state-of-the-art interactive blood matrix.
                 </p>
                 <Link to="/compatibility" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white hover:bg-red-600 font-black rounded-full text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/20">
                   Launch Matrix System
                 </Link>
               </div>
               
               <div className="flex-1 w-full max-w-md">
                 <div className="grid grid-cols-4 gap-3">
                   {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type, i) => (
                     <Motion.div 
                       key={type} 
                       initial={{ opacity: 0, scale: 0.8 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.05 }}
                       whileHover={{ scale: 1.1, backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#b91c1c" }}
                       className="aspect-square rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-black brand-font text-xl text-gray-400 cursor-pointer transition-colors hover:shadow-md hover:shadow-red-200/50"
                     >
                       {type}
                     </Motion.div>
                   ))}
                 </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
