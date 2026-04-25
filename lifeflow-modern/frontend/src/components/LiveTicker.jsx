import React from 'react';

const LiveTicker = () => {
  const events = [
    { text: "O+ Needed urgently in Ahmedabad Civil Hospital", type: "emergency" },
    { text: "John Doe reached 'Diamond' donor status", type: "achievement" },
    { text: "120 Units collected across Gujarat today", type: "stat" },
    { text: "New Camp 'Life Stream' live in Surat", type: "info" },
    { text: "B- Requested for emergency surgery in Vadodara", type: "emergency" }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[1001] w-full pointer-events-auto">
      <div className="h-10 glass px-6 shadow-2xl relative flex items-center gap-6 overflow-hidden" 
           style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        {/* Live Indicator */}
        <div className="flex items-center gap-2 shrink-0 border-r pr-6" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>Live Pulse</span>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...events, ...events, ...events].map((event, idx) => (
               <div key={idx} className="flex items-center gap-3 mx-12">
                 <span className={`w-1 h-1 rounded-full ${
                   event.type === 'emergency' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                   event.type === 'achievement' ? 'bg-yellow-400' : 'bg-emerald-400'
                 }`}></span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] shrink-0" style={{ color: 'var(--text-secondary)' }}>
                   {event.text}
                 </span>
               </div>
            ))}
          </div>
          {/* Edge Fades */}
          <div className="absolute inset-y-0 left-0 w-12 z-10" style={{ background: 'linear-gradient(to right, var(--bg-card), transparent)' }}></div>
          <div className="absolute inset-y-0 right-0 w-12 z-10" style={{ background: 'linear-gradient(to left, var(--bg-card), transparent)' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
