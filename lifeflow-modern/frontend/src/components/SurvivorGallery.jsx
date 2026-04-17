import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Quote, Heart, ChevronRight } from 'lucide-react';

const stories = [
    {
        id: 1,
        name: "Aarav Sharma",
        email: "aarav@lifeflow.com",
        tagline: "The 4 AM Miracle",
        story: "Following a severe road accident in Delhi, Aarav needed a rare O-negative transfusion in the middle of the night. A LifeFlow donor responded within 8 minutes.",
        image: "/assets/survivors/aarav.png",
        stats: "3 Lives Impacted",
        hospital: "AIIMS, New Delhi",
        date: "Oct 24, 2025",
        gratitude: "I'm alive today because a stranger chose to be a hero at 4 AM. Now, I donate every 3 months to pay it forward."
    },
    {
        id: 2,
        name: "Priya Patel",
        email: "priya@lifeflow.com",
        tagline: "The Warrior's Recovery",
        story: "During her 2-year battle with leukemia in Mumbai, Priya received over 50 units of blood. Today, she is in complete remission and an active donor herself.",
        image: "/assets/survivors/priya.png",
        stats: "6 Donors Matched",
        hospital: "Tata Memorial, Mumbai",
        date: "Jan 12, 2026",
        gratitude: "Every unit was a second chance. The LifeFlow community gave me my life back, one drop at a time."
    },
    {
        id: 3,
        name: "Vikram Singh",
        email: "vikram@lifeflow.com",
        tagline: "A New Life Protected",
        story: "Complications during an emergency surgery in Jaipur required an immediate transfusion. Vikram credits the 'silent heroes' of LifeFlow for his recovery.",
        image: "/assets/survivors/vikram.png",
        stats: "15 Lives Impacted",
        hospital: "Fortis Hospital, Jaipur",
        date: "Dec 05, 2025",
        gratitude: "It was a race against time. Knowing there were people ready to help even in a different city was truly humbling."
    },
    {
        id: 4,
        name: "Ananya Iyer",
        email: "ananya@lifeflow.com",
        tagline: "Back on the Field",
        story: "A surprise sports injury in Bengaluru meant Ananya needed rare B-negative blood fast. The coordination between LifeFlow donors got her back to training.",
        image: "/assets/survivors/ananya.png",
        stats: "3 Lives Impacted",
        hospital: "Manipal Hospital, Bengaluru",
        date: "Feb 18, 2026",
        gratitude: "As an athlete, my body is my life. LifeFlow donors ensured that a setback didn't become an end. I'm forever grateful."
    }
];

const StoryCard = ({ story, idx, onOpen }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            className="group relative h-[600px] w-full rounded-[3.5rem] overflow-hidden cursor-pointer"
            onClick={onOpen}
        >
            {/* Background Image */}
            <Motion.img 
                src={story.image}
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-red-950/20 group-hover:bg-transparent transition-colors duration-700"></div>

            {/* Floating Stats Badge */}
            <Motion.div 
                whileHover={{ scale: 1.1 }}
                className="absolute top-8 right-8 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl"
            >
                {story.dynamicStats ? `${story.dynamicStats.livesImpacted} Lives Impacted` : story.stats}
            </Motion.div>

            {/* Content Area */}
            <div className="absolute inset-x-0 bottom-0 p-12 space-y-4">
                <Motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 text-red-500 mb-2"
                >
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">{story.tagline}</span>
                </Motion.div>

                <h3 className="text-4xl font-black text-white brand-font tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-500 leading-none">
                    {story.name}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed max-w-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 font-medium">
                    {story.story}
                </p>

                <div className="pt-8 flex justify-between items-center transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 bg-white/5 -mx-12 px-12 py-8 backdrop-blur-3xl border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                        Recovery Index: {story.id * 23}%
                    </span>
                    <button className="flex items-center gap-2 text-white font-black text-[10px] group/btn uppercase tracking-widest bg-red-600/20 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-600 hover:border-red-600 transition-all">
                        Read More <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Quote Icon */}
            <div className="absolute top-12 left-12 w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-700 shadow-2xl shadow-red-600/50 -rotate-12 group-hover:rotate-0">
                <Quote className="w-7 h-7" />
            </div>
        </Motion.div>
    );
};

import { AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Activity } from 'lucide-react';

const DetailsModal = ({ story, onClose }) => {
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!story) return null;
    
    return (
        <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050510]/95 backdrop-blur-2xl"
            onClick={onClose}
        >
            <Motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0a0a1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left: Image */}
                    <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
                        <img src={story.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a1a] hidden md:block"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent block md:hidden"></div>
                    </div>
                    
                    {/* Right: Content */}
                    <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
                        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white bg-white/5 p-3 rounded-2xl border border-white/10 transition-all">
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 text-red-500 mb-4">
                                    <Activity className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{story.tagline}</span>
                                </div>
                                <h2 className="text-5xl font-black text-white brand-font tracking-tight mb-2 leading-none">{story.name}</h2>
                                <p className="text-white/40 font-bold text-xs uppercase tracking-widest">
                                    {story.dynamicStats ? `${story.dynamicStats.livesImpacted} Lives Impacted` : story.stats}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 py-8 border-y border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> Location
                                    </p>
                                    <p className="text-white font-bold text-sm tracking-tight">{story.hospital}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Date
                                    </p>
                                    <p className="text-white font-bold text-sm tracking-tight">{story.date}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-white/70 text-lg leading-relaxed font-medium italic">"{story.gratitude}"</p>
                                <p className="text-white/40 text-sm leading-relaxed">{story.story}</p>
                            </div>
                            
                            <button className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 transition-all shadow-2xl shadow-red-600/40">
                                Send Love to {story.name.split(' ')[0]}
                            </button>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </Motion.div>
    );
}

const SurvivorGallery = () => {
    const [selectedStory, setSelectedStory] = React.useState(null);
    const [survivorStats, setSurvivorStats] = React.useState({});

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/community/survivor-stats');
                const result = await response.json();
                if (result.status === 'success') {
                    const statsMap = {};
                    result.data.forEach(s => {
                        statsMap[s.email] = s;
                    });
                    setSurvivorStats(statsMap);
                }
            } catch (error) {
                console.error('Failed to fetch survivor stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Enhance stories with dynamic data
    const enhancedStories = stories.map(s => ({
        ...s,
        dynamicStats: survivorStats[s.email]
    }));

    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
                    <div className="max-w-2xl space-y-6">
                        <Motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Heart className="w-4 h-4 text-red-500" />
                            Stories of Impact
                        </Motion.div>
                        <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight text-gray-900 leading-[0.9]">
                            Proof that a <br/>
                            <span className="text-red-600">single drop</span> matters.
                        </h2>
                    </div>
                    <p className="text-xl text-gray-400 font-medium max-w-sm leading-relaxed mb-4">
                        Behind every donation is a heartbeat saved. Explore the lives transformed by the silent heroes of LifeFlow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {enhancedStories.map((story, i) => (
                        <StoryCard 
                            key={story.id} 
                            story={story} 
                            idx={i} 
                            onOpen={() => setSelectedStory(story)}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {selectedStory && (
                        <DetailsModal 
                            story={selectedStory} 
                            onClose={() => setSelectedStory(null)} 
                        />
                    )}
                </AnimatePresence>

                {/* Call to Action Footer */}
                <Motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 p-12 rounded-[3.5rem] bg-gray-900 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600/40">
                            <Heart className="w-10 h-10 fill-current" />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-white brand-font tracking-tight">Ready to write your own legacy?</h4>
                            <p className="text-gray-400 font-medium">It takes less than 15 minutes to save up to three lives.</p>
                        </div>
                    </div>
                    <button className="relative z-10 px-10 py-5 bg-white rounded-full font-black text-gray-900 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase tracking-widest text-xs">
                        Start Your Journey
                    </button>
                </Motion.div>
            </div>
        </section>
    );
};

export default SurvivorGallery;
