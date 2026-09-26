import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Coins, 
  Sparkles, 
  Building2,
  ArrowRight, 
  CheckCircle2, 
  Leaf, 
  Camera, 
  QrCode, 
  Zap, 
  ChevronRight
} from 'lucide-react';
import LiveScanWidget from '../components/LiveScanWidget';
import BookCard from '../components/BookCard';
import { supabase } from '../lib/supabase';
import { normalizeBook } from '../lib/normalizeBook';

const LandingPage = ({ onNavigate, onSelectBook }) => {
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!supabase) return;  // demo mode — no DB
    supabase
      .from('books')
      .select('*, users(id, name, campus_name, trust_score, avatar_url)', { count: 'exact' })
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data, count, error }) => {
        if (!error && data) {
          setFeaturedBooks(data.map(normalizeBook).filter(Boolean));
          setTotalCount(count || data.length);
        }
      });
  }, []);

  const stepsData = [
    {
      step: "01",
      title: "Snap 5 Quick Photos",
      desc: "Capture Front, Back, Spine/Binding, Sample Inside Page, and Full Distance. Our upload assistant guides you in under 60 seconds.",
      icon: Camera,
      badge: "60-Second Upload",
      details: [
        "Automated angle guidance",
        "ISBN & Title OCR extraction",
        "Preset demo books for fast testing"
      ],
      img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    },
    {
      step: "02",
      title: "Instant AI Vision Appraisal & Coin Credit",
      desc: "Our computer vision model analyzes spine integrity, page yellowing, and annotation density to grade the book and credit BookCoins immediately.",
      icon: Sparkles,
      badge: "Instant +145 to +450 Coins",
      details: [
        "Objective condition tiers (Like New, Good, Fair)",
        "Zero waiting for a buyer to agree",
        "Coins credited directly to your student wallet"
      ],
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
    },
    {
      step: "03",
      title: "Contactless Campus Locker Drop-off & Pickup",
      desc: "Place the book in your campus smart locker station anytime 24/7. Buyers claim books using digital QR passes with automated verification.",
      icon: QrCode,
      badge: "24/7 Smart Hubs",
      details: [
        "Zero awkward in-person student meetups",
        "Encrypted 4-digit locker verification PIN",
        "Same-day exchange on active campuses"
      ],
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* 1. Hero Section */}
      <section style={{
        paddingTop: '48px',
        paddingBottom: '64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background blur */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          backgroundColor: 'rgba(63, 98, 72, 0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center'
          }} className="hero-grid">
            {/* Left Hero Copy */}
            <div>
              {/* Top Pill Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid rgba(63, 98, 72, 0.2)',
                color: 'var(--primary-forest)',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '20px'
              }}>
                <Sparkles size={15} />
                <span>The Academic Book Exchange Economy</span>
              </div>

              {/* Serif Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                lineHeight: '1.15',
                marginBottom: '20px',
                fontWeight: '800',
                color: 'var(--text-main)'
              }}>
                Trade College Textbooks with <span style={{ color: 'var(--primary-forest)', fontStyle: 'italic' }}>AI Confidence</span> & BookCoins.
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--text-muted)',
                lineHeight: '1.65',
                marginBottom: '32px',
                maxWidth: '540px'
              }}>
                List your past semester books, get an instant computer-vision condition grade with immediate BookCoins credited, and claim required academic reading from campus smart lockers.
              </p>

              {/* Dual CTA Buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '40px'
              }}>
                <button 
                  className="btn-primary"
                  onClick={() => onNavigate('browse')}
                  style={{ padding: '14px 32px', fontSize: '1rem' }}
                >
                  <BookOpen size={18} />
                  <span>Explore Academic Books</span>
                </button>

                <button 
                  className="btn-gold"
                  onClick={() => onNavigate('list-book')}
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  <Coins size={18} />
                  <span>List a Book & Earn Coins</span>
                </button>
              </div>

              {/* Trust Indicators Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(63, 98, 72, 0.15)'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--primary-forest)' }}>
                    12,400+
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Books Circulated
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--primary-forest)' }}>
                    ₹42.8 Lakh
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Student Cash Saved
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--primary-forest)' }}>
                    4.95 ★
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Verified Trust Score
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive AI Scan Widget */}
            <div>
              <LiveScanWidget onTryListing={() => onNavigate('list-book')} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dual Split Cards: For Sellers vs. For Buyers */}
      <section style={{ padding: '40px 0 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Two-Sided Academic Circulation
            </span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '6px' }}>
              Engineered for Both Sides of Campus
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {/* Seller Card (Pure White) */}
            <div className="card-white" style={{
              padding: '36px',
              border: '1.5px solid #D6E3D8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 36px rgba(22, 36, 28, 0.08)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="icon-circle-badge lg">
                    <Camera size={26} />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-forest)',
                    fontSize: '0.78rem',
                    fontWeight: '700'
                  }}>
                    For Sellers
                  </span>
                </div>

                <h3 style={{ fontSize: '1.6rem', lineHeight: '1.25', marginBottom: '12px' }}>
                  Turn Idle Textbooks Into Instant BookCoins
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
                  Don’t let expensive textbooks gather dust after semester finals. List in 60 seconds and get coins immediately.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    "AI Computer Vision scans & auto-grades condition",
                    "Instant BookCoins credited before a buyer even claims it",
                    "Contactless 30-sec drop off at campus smart lockers",
                    "Boost your verified campus student trust rating"
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={17} color="#2D6A4F" style={{ flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px' }}
                onClick={() => onNavigate('list-book')}
              >
                <span>Start Listing a Book</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Buyer Card (Deep Charcoal-Green Contrast) */}
            <div className="card-dark" style={{
              padding: '36px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="icon-circle-badge dark lg">
                    <Coins size={26} color="#F59E0B" />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(245, 158, 11, 0.18)',
                    color: '#FDE68A',
                    fontSize: '0.78rem',
                    fontWeight: '700'
                  }}>
                    For Buyers & Students
                  </span>
                </div>

                <h3 style={{ fontSize: '1.6rem', lineHeight: '1.25', marginBottom: '12px', color: '#FAF6EC' }}>
                  Claim Required Course Books with Zero Rupee Cash
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-on-dark-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
                  Redeem textbooks with your earned BookCoins. Inspect verified condition breakdown and pick up securely from your college locker.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    "5-photo high resolution condition inspection on every book",
                    "Zero cash needed — fully powered by BookCoins",
                    "Digital QR pickup pass ready within minutes",
                    "Save ₹3,000 to ₹8,000 every single college semester"
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={17} color="#34D399" style={{ flexShrink: 0 }} />
                      <span style={{ color: '#E8EFE9', fontWeight: '500' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="btn-gold" 
                style={{ width: '100%', padding: '14px' }}
                onClick={() => onNavigate('browse')}
              >
                <span>Browse Campus Catalog</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-Pillar Deep Dive Section */}
      <section style={{
        padding: '60px 0',
        backgroundColor: '#F3EDE0',
        borderTop: '1px solid rgba(63, 98, 72, 0.1)',
        borderBottom: '1px solid rgba(63, 98, 72, 0.1)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              The BookLoop Ecosystem
            </span>
            <h2 style={{ fontSize: '2.1rem', marginTop: '6px', marginBottom: '12px' }}>
              Built on Three Pillars of Trust
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              We solved the friction of peer-to-peer textbook exchanges with computer vision, token economics, and automated lockers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Pillar 1 */}
            <div className="card-white hover-lift" style={{ padding: '32px' }}>
              <div className="icon-circle-badge lg" style={{ marginBottom: '20px' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>
                1. AI Photo Appraisal
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Our proprietary CV model inspects binding tightness, page yellowing, cover corner creases, and handwriting annotations across 5 photos, generating a verified condition grade.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card-white hover-lift" style={{ padding: '32px' }}>
              <div className="icon-circle-badge lg" style={{ marginBottom: '20px' }}>
                <Coins size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>
                2. BookCoin Economy
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Transparent valuation tiers: Like New (60-70% MRP), Good (45-55% MRP), and Fair (30-40% MRP). Coins are credited immediately upon automated verification.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card-white hover-lift" style={{ padding: '32px' }}>
              <div className="icon-circle-badge lg" style={{ marginBottom: '20px' }}>
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>
                3. Campus Smart Lockers
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                No awkward coordination or missed meetings. Drop off in automated campus locker points in library bays or student activity centers with encrypted QR pass codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive "How It Works" 3-Step Demo Slider */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Simple 3-Step Flow
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '6px' }}>
              How BookLoop Works in Practice
            </h2>
          </div>

          {/* Step Selection Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '36px',
            flexWrap: 'wrap'
          }}>
            {stepsData.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStepTab(idx)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  backgroundColor: activeStepTab === idx ? 'var(--primary-forest)' : '#FFFFFF',
                  color: activeStepTab === idx ? '#FAF6EC' : 'var(--text-main)',
                  border: '1px solid #D6E3D8',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: activeStepTab === idx ? '0 4px 14px rgba(63, 98, 72, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: activeStepTab === idx ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                  color: activeStepTab === idx ? '#FFFFFF' : 'var(--primary-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  {s.step}
                </span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase Card */}
          <div className="card-white" style={{
            padding: '40px',
            borderRadius: '24px',
            border: '1.5px solid #DCE6DF',
            boxShadow: '0 16px 40px rgba(22, 36, 28, 0.08)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '40px',
              alignItems: 'center'
            }} className="step-card-grid">
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}>
                  <Zap size={14} />
                  <span>{stepsData[activeStepTab].badge}</span>
                </div>

                <h3 style={{ fontSize: '1.8rem', lineHeight: '1.25', marginBottom: '14px' }}>
                  {stepsData[activeStepTab].title}
                </h3>

                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '24px' }}>
                  {stepsData[activeStepTab].desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                  {stepsData[activeStepTab].details.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} color="var(--primary-forest)" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '14px' }}>
                  <button 
                    className="btn-primary"
                    onClick={() => onNavigate('list-book')}
                  >
                    <span>Try This Flow Now</span>
                    <ArrowRight size={16} />
                  </button>

                  <button 
                    className="btn-secondary"
                    onClick={() => setActiveStepTab((prev) => (prev + 1) % stepsData.length)}
                  >
                    <span>Next Step</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Step Image Representation */}
              <div style={{
                position: 'relative',
                height: '320px',
                borderRadius: '18px',
                overflow: 'hidden',
                backgroundColor: '#16241C',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
              }}>
                <img 
                  src={stepsData[activeStepTab].img} 
                  alt={stepsData[activeStepTab].title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(22, 36, 28, 0.85) 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '24px'
                }}>
                  <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '1.1rem' }}>
                    Step {stepsData[activeStepTab].step} of 03 — Verified by BookLoop Network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Books Marketplace Carousel */}
      <section style={{ padding: '40px 0 70px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Live Marketplace
              </span>
              <h2 style={{ fontSize: '2.1rem', marginTop: '4px' }}>
                Featured Academic Books
              </h2>
            </div>

            <button 
              className="btn-secondary"
              onClick={() => onNavigate('browse')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View All {totalCount > 0 ? `${totalCount} ` : ''}Listings</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid-responsive-cards">
            {featuredBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onSelect={(id) => onSelectBook(id)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Closing Call to Action Banner */}
      <section style={{ padding: '0 0 40px' }}>
        <div className="container">
          <div className="card-dark" style={{
            padding: '60px 40px',
            borderRadius: '28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #16241C 0%, #1D3327 100%)'
          }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                color: '#34D399',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '18px'
              }}>
                <Leaf size={15} />
                <span>Join 18,000+ Students Recirculating Knowledge</span>
              </div>

              <h2 style={{
                fontSize: '2.5rem',
                color: '#FAF6EC',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                Ready to Turn Your Textbooks into Next Semester’s Reading?
              </h2>

              <p style={{
                fontSize: '1rem',
                color: 'var(--text-on-dark-muted)',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Upload in 60 seconds with 5 photos. Get instant BookCoins credited to your student wallet and pick up books from campus lockers.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-gold"
                  onClick={() => onNavigate('list-book')}
                  style={{ padding: '14px 32px', fontSize: '1.02rem' }}
                >
                  <Camera size={18} />
                  <span>List a Book & Earn Coins</span>
                </button>

                <button 
                  className="btn-secondary"
                  onClick={() => onNavigate('coin-guide')}
                  style={{
                    padding: '14px 28px',
                    fontSize: '1.02rem',
                    color: '#FAF6EC',
                    borderColor: 'rgba(255,255,255,0.3)'
                  }}
                >
                  <Coins size={18} />
                  <span>Calculate Book Valuation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Style */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid, .step-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
