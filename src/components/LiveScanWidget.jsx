import React, { useState, useEffect } from 'react';
import { Scan, CheckCircle2, Cpu, Coins } from 'lucide-react';
import ConditionBadge from './ConditionBadge';

const DEMO_ITEMS = [
  {
    title: "Concepts of Physics (Vol 1)",
    author: "Dr. H.C. Verma",
    edition: "2024 Edition",
    mrp: 450,
    coverImg: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    condition: "Like New",
    score: 96,
    coins: 145,
    metrics: [
      { label: "Spine & Binding", val: "99% Firm", status: "pass" },
      { label: "Cover Surface", val: "96% Spotless", status: "pass" },
      { label: "Page Marginalia", val: "0% Clean", status: "pass" }
    ],
    ocrSnippet: "CONCEPTS OF PHYSICS • BHARATI BHAWAN • PART 1"
  },
  {
    title: "Introduction to Algorithms",
    author: "CLRS (MIT Press)",
    edition: "4th Global Edition",
    mrp: 1899,
    coverImg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    condition: "Good",
    score: 88,
    coins: 310,
    metrics: [
      { label: "Spine & Binding", val: "92% Solid", status: "pass" },
      { label: "Cover Surface", val: "88% Minor wear", status: "pass" },
      { label: "Page Marginalia", val: "8% Pencil notes", status: "warning" }
    ],
    ocrSnippet: "ALGORITHMS • CORMEN • LEISERSON • RIVEST • STEIN"
  },
  {
    title: "Organic Chemistry",
    author: "Morrison & Boyd",
    edition: "7th Edition",
    mrp: 995,
    coverImg: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80",
    condition: "Good",
    score: 86,
    coins: 195,
    metrics: [
      { label: "Spine & Binding", val: "90% Intact", status: "pass" },
      { label: "Cover Surface", val: "85% Clean", status: "pass" },
      { label: "Page Marginalia", val: "5% Highlights", status: "warning" }
    ],
    ocrSnippet: "ORGANIC CHEMISTRY • PEARSON EDUCATION • BHATTACHARJEE"
  }
];

const LiveScanWidget = ({ onTryListing }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  const activeItem = DEMO_ITEMS[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 1200);
      setCurrentIndex((prev) => (prev + 1) % DEMO_ITEMS.length);
    }, 4800);

    return () => clearInterval(timer);
  }, []);

  const handleManualSwitch = (idx) => {
    setIsScanning(true);
    setCurrentIndex(idx);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="card-white" style={{
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 20px 45px rgba(22, 36, 28, 0.12)',
      border: '1px solid #DCE6DF',
      position: 'relative',
      maxWidth: '520px',
      margin: '0 auto',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBF9 100%)'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid #EBF0EC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#E8EFE9',
            color: 'var(--primary-forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={15} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Vision Appraisal Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isScanning ? '#F59E0B' : '#10B981',
            boxShadow: isScanning ? '0 0 8px #F59E0B' : '0 0 8px #10B981'
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {isScanning ? 'Processing Frames...' : 'Appraised 99.4%'}
          </span>
        </div>
      </div>

      {/* Book & Scanner Viewport */}
      <div style={{
        position: 'relative',
        height: '210px',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#16241C',
        marginBottom: '18px'
      }}>
        <img 
          src={activeItem.coverImg} 
          alt={activeItem.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
            filter: isScanning ? 'contrast(1.15) brightness(0.9)' : 'none',
            transition: 'all 0.5s ease'
          }}
        />

        {/* Laser Scanner Line */}
        <div className="laser-scan-line" />

        {/* OCR Overlay Tags */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(22, 36, 28, 0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          borderRadius: '8px',
          padding: '4px 10px',
          color: '#34D399',
          fontSize: '0.72rem',
          fontFamily: 'monospace',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Scan size={12} />
          <span>OCR: {activeItem.ocrSnippet}</span>
        </div>

        {/* Real-time Bounding Box Simulation */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          borderRadius: '10px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <ConditionBadge grade={activeItem.condition} score={activeItem.score} size="sm" showScore />
        </div>
      </div>

      {/* Inspection Metrics Breakdown */}
      <div style={{
        backgroundColor: '#F7FAF7',
        border: '1px solid #E2EBE4',
        borderRadius: '14px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {activeItem.title}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            MRP ₹{activeItem.mrp}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          paddingTop: '6px',
          borderTop: '1px dashed #D6E3D9'
        }}>
          {activeItem.metrics.map((m, i) => (
            <div key={i} style={{ fontSize: '0.74rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{m.label}</div>
              <div style={{
                fontWeight: '700',
                color: m.status === 'pass' ? '#2D6A4F' : '#B58300',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <CheckCircle2 size={11} />
                <span>{m.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Output & CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
        border: '1px solid #FDE68A',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div 
          onClick={() => onTryListing && onTryListing()}
          style={{ cursor: onTryListing ? 'pointer' : 'default' }}
          title={onTryListing ? "Click to scan your own textbook" : ""}
        >
          <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '600', textTransform: 'uppercase' }}>
            Instant Credit Reward
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={18} color="#D97706" style={{ fill: '#F59E0B' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#B45309' }}>
              +{activeItem.coins} BookCoins
            </span>
            {onTryListing && (
              <span style={{ fontSize: '0.75rem', color: '#92400E', textDecoration: 'underline', marginLeft: '4px', fontWeight: '600' }}>
                Scan Yours →
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {DEMO_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleManualSwitch(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: currentIndex === idx ? '#B45309' : '#E5D5BA',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              title={`Demo Book ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScanWidget;
