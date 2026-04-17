import React, { useRef, useState } from 'react';
import { Download } from 'lucide-react';

const CertificateGenerator = ({ donorName, bloodGroup, date }) => {
    const certificateRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = async () => {
        if (!certificateRef.current) return;
        setIsGenerating(true);
        try {
            const html2canvas = window.html2canvas;
            const jsPDF = window.jspdf.jsPDF;
            if (!html2canvas || !jsPDF) throw new Error('Certificate scripts still loading.');

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0a0a0a',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`LifeFlow_Certificate_${donorName?.replace(/\s+/g, '_') || 'Donor'}.pdf`);
        } catch (error) {
            console.error('Certificate error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <>
            <button
                onClick={generatePdf}
                disabled={isGenerating}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent)]/30 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 shadow-sm"
            >
                {isGenerating
                    ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    : <Download className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Get Certificate'}
            </button>

            {/* ─── Hidden Certificate Canvas ─────────────────────────────── */}
            <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
                <div
                    ref={certificateRef}
                    style={{
                        width: '1200px',
                        height: '848px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Inter', sans-serif",
                        background: '#ffffff',
                        overflow: 'hidden',
                    }}
                >
                    {/* Mesh / Radial Gradients */}
                    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 70%)' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

                    {/* Background Pattern (subtle noise/grid) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
                        backgroundSize: '24px 24px', pointerEvents: 'none'
                    }} />

                    {/* Watermark Logo */}
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.03, pointerEvents: 'none', flexDirection: 'column'
                    }}>
                        <div style={{ fontSize: '200px' }}>🩸</div>
                        <span style={{ fontSize: '100px', fontWeight: 900, color: '#991b1b', letterSpacing: '-2px', fontFamily: "'Playfair Display', 'Times New Roman', serif" }}>
                            LifeFlow
                        </span>
                    </div>

                    {/* Elegant Double Borders */}
                    <div style={{ position: 'absolute', inset: '24px', border: '1px solid rgba(153,27,27,0.15)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: '32px', border: '2px solid rgba(153,27,27,0.6)', pointerEvents: 'none', boxShadow: 'inset 0 0 20px rgba(153,27,27,0.05)' }} />
                    
                    {/* Corner Ornaments */}
                    {[ { top: '28px', left: '28px' }, { top: '28px', right: '28px' }, { bottom: '28px', left: '28px' }, { bottom: '28px', right: '28px' } ].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', width: '40px', height: '40px',
                            borderTop: i < 2 ? '3px solid #991b1b' : 'none',
                            borderBottom: i >= 2 ? '3px solid #991b1b' : 'none',
                            borderLeft: i % 2 === 0 ? '3px solid #991b1b' : 'none',
                            borderRight: i % 2 === 1 ? '3px solid #991b1b' : 'none',
                            ...pos,
                        }} />
                    ))}

                    {/* Main Content Pane */}
                    <div style={{
                        position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', width: '920px', height: '720px',
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(153,27,27,0.1)',
                        borderRadius: '4px',
                        padding: '60px', textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                    }}>
                        {/* Top Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '35px' }}>
                            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #991b1b)' }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '8px', color: '#991b1b', textTransform: 'uppercase' }}>
                                LifeFlow Blood Donation Network
                            </span>
                            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #991b1b, transparent)' }} />
                        </div>

                        {/* Certificate Title */}
                        <div style={{ marginBottom: '45px' }}>
                            <h1 style={{
                                fontFamily: "'Playfair Display', 'Times New Roman', serif",
                                fontSize: '64px', fontWeight: 600, color: '#1e293b', letterSpacing: '6px',
                                textTransform: 'uppercase', margin: '0 0 10px 0', lineHeight: 1.1,
                            }}>
                                Certificate
                            </h1>
                            <h2 style={{
                                fontFamily: "'Playfair Display', 'Times New Roman', serif",
                                fontSize: '24px', fontWeight: 500, color: '#991b1b',
                                letterSpacing: '12px', textTransform: 'uppercase', margin: 0, fontStyle: 'italic'
                            }}>
                                of Appreciation
                            </h2>
                        </div>

                        {/* Presented To */}
                        <p style={{
                            fontSize: '14px', color: '#64748b', letterSpacing: '2px',
                            textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600
                        }}>
                            This certificate is proudly presented to
                        </p>

                        {/* Donor Name with elegant typography */}
                        <div style={{ marginBottom: '35px', position: 'relative' }}>
                            <h2 style={{
                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                fontSize: '64px', fontWeight: 400, color: '#0f172a', margin: 0,
                                letterSpacing: '3px',
                                textTransform: 'capitalize'
                            }}>
                                {donorName}
                            </h2>
                            <div style={{ 
                                height: '1px', width: '80%', margin: '15px auto 0',
                                background: 'linear-gradient(90deg, transparent, rgba(153,27,27,0.4), transparent)' 
                            }} />
                        </div>

                        {/* Text Body */}
                        <p style={{
                            fontSize: '16px', color: '#334155', maxWidth: '640px',
                            lineHeight: 1.9, marginBottom: 'auto',
                            fontFamily: "'Inter', sans-serif", fontWeight: 400
                        }}>
                            In profound recognition of their selfless and life-saving contribution of{' '}
                            <span style={{ color: '#991b1b', fontWeight: 800, fontSize: '18px' }}>{bloodGroup}</span>{' '}
                            blood to the community on{' '}
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>{formattedDate}</span>.
                            <br/><br/>
                            <span style={{ fontStyle: 'italic', color: '#475569' }}>"Their noble act embodies the highest ideals of humanity."</span>
                        </p>

                        {/* Signatures & Seal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '40px' }}>
                            
                            {/* Left Sig */}
                            <div style={{ textAlign: 'center', width: '220px' }}>
                                <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic', fontSize: '28px', color: '#0f172a', marginBottom: '10px', fontWeight: 600, letterSpacing: '1px' }}>
                                    Dhruv Rajput
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'rgba(15,23,42,0.2)', marginBottom: '8px' }} />
                                <p style={{ fontSize: '10px', color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
                                    Medical Director
                                </p>
                            </div>

                            {/* Ultimate SVG Seal */}
                            <div style={{
                                position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 15px 25px rgba(153,27,27,0.3))' }}>
                                    <defs>
                                        <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#bf953f"/>
                                            <stop offset="25%" stopColor="#fcf6ba"/>
                                            <stop offset="50%" stopColor="#b38728"/>
                                            <stop offset="75%" stopColor="#fbf5b7"/>
                                            <stop offset="100%" stopColor="#aa771c"/>
                                        </linearGradient>
                                        <linearGradient id="badgeRuby" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#450a0a"/>
                                            <stop offset="50%" stopColor="#991b1b"/>
                                            <stop offset="100%" stopColor="#450a0a"/>
                                        </linearGradient>
                                        <radialGradient id="rubyGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#f87171"/>
                                            <stop offset="100%" stopColor="#991b1b"/>
                                        </radialGradient>
                                    </defs>
                                    
                                    {/* Outer Rosette */}
                                    <g fill="url(#badgeRuby)" stroke="url(#badgeGold)" strokeWidth="2">
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(0 100 100)" />
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(15 100 100)" />
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(30 100 100)" />
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(45 100 100)" />
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(60 100 100)" />
                                        <rect x="25" y="25" width="150" height="150" rx="12" transform="rotate(75 100 100)" />
                                    </g>

                                    {/* Gold Inner Base */}
                                    <circle cx="100" cy="100" r="72" fill="#ffffff" />
                                    <circle cx="100" cy="100" r="72" fill="none" stroke="url(#badgeGold)" strokeWidth="4"/>
                                    
                                    {/* Ornate Dashed Ring */}
                                    <circle cx="100" cy="100" r="64" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeDasharray="4 4"/>
                                    
                                    {/* Inner Ruby Core */}
                                    <circle cx="100" cy="100" r="54" fill="url(#badgeRuby)"/>
                                    <circle cx="100" cy="100" r="54" fill="none" stroke="url(#badgeGold)" strokeWidth="2"/>
                                    
                                    {/* Subtle highlight in ruby core */}
                                    <circle cx="100" cy="100" r="48" fill="url(#rubyGlow)" opacity="0.3" />

                                    {/* Decorative Stars in the white border */}
                                    <path d="M100 15 L102 21 L108 21 L103 25 L105 31 L100 27 L95 31 L97 25 L92 21 L98 21 Z" fill="url(#badgeGold)"/>
                                    <path d="M100 185 L102 179 L108 179 L103 175 L105 169 L100 173 L95 169 L97 175 L92 179 L98 179 Z" fill="url(#badgeGold)"/>
                                    <path d="M15 100 L21 98 L21 92 L25 97 L31 95 L27 100 L31 105 L25 103 L21 108 L21 102 Z" fill="url(#badgeGold)"/>
                                    <path d="M185 100 L179 98 L179 92 L175 97 L169 95 L173 100 L169 105 L175 103 L179 108 L179 102 Z" fill="url(#badgeGold)"/>

                                    {/* Central Droplet */}
                                    <path d="M100 55 C100 55, 75 85, 75 105 C75 120, 85 130, 100 130 C115 130, 125 120, 125 105 C125 85, 100 55, 100 55 Z" fill="#ffffff" />
                                    
                                    {/* Golden Medical Cross Inside Droplet */}
                                    <path d="M96 95 H104 V103 H112 V111 H104 V119 H96 V111 H88 V103 H96 V95 Z" fill="url(#badgeGold)" />
                                </svg>

                                {/* Overlay Text */}
                                <div style={{ position: 'absolute', top: '35px', width: '100%', textAlign: 'center' }}>
                                    <span style={{ fontSize: '9px', color: '#991b1b', letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Verified</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: '35px', width: '100%', textAlign: 'center' }}>
                                    <span style={{ fontSize: '9px', color: '#991b1b', letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Donor</span>
                                </div>
                            </div>

                            {/* Right Sig */}
                            <div style={{ textAlign: 'center', width: '220px' }}>
                                <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic', fontSize: '28px', color: '#0f172a', marginBottom: '10px', fontWeight: 600, letterSpacing: '1px' }}>
                                    Govind Desai
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'rgba(15,23,42,0.2)', marginBottom: '8px' }} />
                                <p style={{ fontSize: '10px', color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
                                    Chief Executive
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CertificateGenerator;
