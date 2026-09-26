import React, { useState } from 'react';
import { 
  Coins, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Cpu
} from 'lucide-react';
import ConditionBadge from '../components/ConditionBadge';

const TIERS = [
  {
    grade: "Like New",
    range: "60% - 70% of MRP",
    pill: "Mint Condition",
    bgClass: "badge-grade-like-new",
    desc: "Looks virtually unread. Spine firm without any crease lines, cover corners sharp, zero pencil or highlighter marks, crisp white paper stock.",
    criteria: [
      "Spine & Binding: 95% - 100% Firm",
      "Cover: Spotless, no scratches or stains",
      "Pages: 100% Clean, zero markings",
      "Paper Aging: Pure white or pristine original tone"
    ]
  },
  {
    grade: "Good",
    range: "45% - 55% of MRP",
    pill: "Most Common (72% of Listings)",
    bgClass: "badge-grade-good",
    desc: "Typical semester textbook. Solid binding, light shelf handling, few neat pencil notes or gentle highlighters on key study formulas.",
    criteria: [
      "Spine & Binding: 85% - 94% Solid",
      "Cover: Minor shelf wear on corner tips",
      "Pages: Mild neat highlighters, clean problem statements",
      "Paper Aging: Standard natural paper tone"
    ]
  },
  {
    grade: "Fair",
    range: "30% - 40% of MRP",
    pill: "Budget Friendly",
    bgClass: "badge-grade-fair",
    desc: "Well-studied book with visible reading history. All text completely legible, binding holds securely, moderate marginalia or notes.",
    criteria: [
      "Spine & Binding: 75% - 84% Intact",
      "Cover: Noticeable creases or surface folds",
      "Pages: Moderate notes/highlights, all readable",
      "Paper Aging: Moderate toning or natural aging"
    ]
  },
  {
    grade: "Worn",
    range: "15% - 25% of MRP",
    pill: "Basic Utility",
    bgClass: "badge-grade-worn",
    desc: "Heavy usage. Front/back cover worn, significant student notes. Acceptable for quick revision or budget study.",
    criteria: [
      "Spine & Binding: 60% - 74% Intact",
      "Cover: Heavy edge scuffs",
      "Pages: Significant notes, 100% complete text",
      "Paper Aging: Yellowed newsprint stock"
    ]
  }
];

const FAQS = [
  {
    q: "How are BookCoins calculated for my listed textbook?",
    a: "Our algorithm uses 3 factors: (1) Original Publisher MRP, (2) AI Computer Vision condition grade (Like New gives ~60%, Good gives ~50%, Fair gives ~35%), and (3) Semester demand index for that subject. BookCoins are credited to your student wallet immediately upon listing approval."
  },
  {
    q: "What happens if a book in the locker doesn't match its AI condition report?",
    a: "BookLoop provides a 100% Quality Assurance Guarantee. When you unlock the locker and inspect the book, if it has unmentioned damage or torn pages, click 'Report Discrepancy' in your pass and your BookCoins are refunded to your wallet immediately."
  },
  {
    q: "Do BookCoins expire after semester finals?",
    a: "No! BookCoins remain permanently in your student account throughout your university tenure. You can accumulate coins in 1st year and redeem them for final year projects or competitive exam guides later."
  },
  {
    q: "How does the contactless campus locker system work?",
    a: "Every partner university (IIT Delhi, BITS, AIIMS, DU, etc.) has smart electronic locker banks in libraries or student centers. Sellers receive an assigned box number and PIN to drop off within 48 hours. Buyers use their digital QR pass to unlock and collect in 30 seconds."
  },
  {
    q: "Can I transfer BookCoins to my classmate or study group?",
    a: "Yes. From your Profile & Coin Ledger tab, you can transfer BookCoins to any verified student email on your campus network with zero fees."
  }
];

const CoinGuidePage = ({ onNavigate }) => {
  // Interactive Calculator State
  const [calcMrp, setCalcMrp] = useState(850);
  const [calcGrade, setCalcGrade] = useState("Good");
  const [calcCategory, setCalcCategory] = useState("standard");
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Dynamic Valuation Algorithm
  const gradePercentages = {
    "Like New": 0.60,
    "Good": 0.50,
    "Fair": 0.35,
    "Worn": 0.20
  };

  const categoryMultipliers = {
    "standard": 1.0,
    "jee_neet": 1.12,
    "medical": 1.15,
    "cs_core": 1.08
  };

  const calculatedCoins = Math.round(
    calcMrp * (gradePercentages[calcGrade] || 0.5) * (categoryMultipliers[calcCategory] || 1.0) * 0.42
  );

  const estimatedCashSaved = Math.round(calcMrp * (gradePercentages[calcGrade] || 0.5));

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          backgroundColor: '#FEF3C7',
          color: '#B45309',
          fontSize: '0.82rem',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          <Coins size={16} />
          <span>Transparent Campus Economics</span>
        </div>

        <h1 style={{ fontSize: '2.6rem', lineHeight: '1.2', marginBottom: '14px' }}>
          The BookCoin Economy & Valuation Guide
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Discover how textbooks are priced fairly, how condition tiers are appraised, and calculate your instant BookCoins rewards before listing.
        </p>
      </div>

      {/* 1. Interactive BookCoin Valuation Calculator */}
      <div className="card-white" style={{
        padding: '40px',
        borderRadius: '28px',
        border: '2px solid #FDE68A',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 100%)',
        boxShadow: '0 16px 45px rgba(217, 119, 6, 0.1)',
        marginBottom: '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div className="icon-circle-badge" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <Calculator size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>
              Live BookCoin Valuation Calculator
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Estimate the exact BookCoins you will earn when uploading your textbook.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }} className="calculator-layout">
          
          {/* Controls Left */}
          <div>
            {/* Input 1: MRP */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                  Original Retail MRP (₹)
                </label>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-forest)' }}>
                  ₹{calcMrp}
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="3500"
                step="50"
                value={calcMrp}
                onChange={(e) => setCalcMrp(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary-forest)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>₹150</span>
                <span>₹1,500</span>
                <span>₹3,500+</span>
              </div>
            </div>

            {/* Input 2: Condition Tier */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '10px' }}>
                Estimated Condition Grade
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {["Like New", "Good", "Fair", "Worn"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setCalcGrade(grade)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: calcGrade === grade ? '2px solid var(--primary-forest)' : '1px solid #DCE6DE',
                      backgroundColor: calcGrade === grade ? 'var(--primary-light)' : '#FFFFFF',
                      fontWeight: calcGrade === grade ? '700' : '600',
                      fontSize: '0.88rem',
                      color: calcGrade === grade ? 'var(--primary-forest)' : 'var(--text-main)',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Subject Demand */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px' }}>
                Academic Discipline Demand
              </label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="standard">Standard Engineering / Pure Sciences (1.0x)</option>
                <option value="jee_neet">JEE & NEET Competitive Preparation (+12% Demand)</option>
                <option value="medical">Medical Clinical Sciences (+15% Demand)</option>
                <option value="cs_core">Computer Science Core Textbooks (+8% Demand)</option>
              </select>
            </div>
          </div>

          {/* Result Card Right */}
          <div style={{
            backgroundColor: '#16241C',
            color: '#FAF6EC',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 14px 40px rgba(0,0,0,0.25)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top gold accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #F59E0B, #10B981)'
            }} />

            <span style={{ fontSize: '0.78rem', color: '#A3B8AA', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              Instant Listing Reward Estimate
            </span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px', marginBottom: '8px' }}>
              <Coins size={38} color="#F59E0B" style={{ fill: '#FDE68A' }} />
              <span style={{ fontSize: '3.6rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: '#FDE68A', lineHeight: '1' }}>
                +{calculatedCoins}
              </span>
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              BookCoins Credited to Wallet
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              fontSize: '0.82rem',
              color: '#C4D4C8',
              marginBottom: '24px'
            }}>
              <div>Equivalent Cash Value: <strong style={{ color: '#FFFFFF' }}>₹{estimatedCashSaved}</strong></div>
              <div style={{ marginTop: '2px', fontSize: '0.74rem', color: '#34D399' }}>
                ✓ Zero commission or cash withdrawal fees
              </div>
            </div>

            <button
              className="btn-gold"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              onClick={() => onNavigate('list-book')}
            >
              <span>List This Book Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Transparent Valuation Tiers */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quality Standards
          </span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
            BookLoop Condition Grading Tiers
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className="card-white"
              style={{
                padding: '28px',
                borderRadius: '20px',
                border: '1.5px solid #DCE6DE',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <ConditionBadge grade={tier.grade} size="lg" />
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {tier.pill}
                  </span>
                </div>

                <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--primary-forest)', marginBottom: '8px' }}>
                  {tier.range}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
                  {tier.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #EEF3EE' }}>
                  {tier.criteria.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                      <CheckCircle2 size={13} color="var(--primary-forest)" style={{ flexShrink: 0 }} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Vision Inspection Explainer */}
      <div className="card-dark" style={{
        padding: '48px 40px',
        borderRadius: '28px',
        marginBottom: '64px'
      }}>
        <div style={{ maxWidth: '640px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={20} color="#34D399" />
            <span style={{ fontSize: '0.8rem', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              How Computer Vision Appraisal Works
            </span>
          </div>
          <h2 style={{ fontSize: '2rem', color: '#FAF6EC', marginBottom: '10px' }}>
            Objective AI Condition Assessment
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-on-dark-muted)', lineHeight: '1.6' }}>
            Human grading is subjective and creates disputes. BookLoop processes 5 standardized photographic angles using neural computer vision models.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#F59E0B', fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              01. OCR Match
            </div>
            <h4 style={{ color: '#FAF6EC', fontSize: '1rem', marginBottom: '6px' }}>Optical Text Extraction</h4>
            <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
              Matches cover title, edition details, and ISBN barcodes against central university syllabus registries.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#34D399', fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              02. Binding Test
            </div>
            <h4 style={{ color: '#FAF6EC', fontSize: '1rem', marginBottom: '6px' }}>Spine Integrity Check</h4>
            <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
              Detects vertical spine cracking, loose glue seams, and edge fraying from the spine thumbnail.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#60A5FA', fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              03. Marginalia
            </div>
            <h4 style={{ color: '#FAF6EC', fontSize: '1rem', marginBottom: '6px' }}>Annotation Density</h4>
            <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
              Calculates stroke density of yellow highlighter ink, pencil checkmarks, and margin notes.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQ Accordion */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Common Questions
          </span>
          <h2 style={{ fontSize: '2.1rem', marginTop: '4px' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="card-white"
                style={{
                  borderRadius: '16px',
                  border: '1px solid #DCE6DF',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
              >
                <div style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '1rem',
                  color: 'var(--text-main)'
                }}>
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary-forest)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>

                {isOpen && (
                  <div style={{
                    padding: '0 24px 20px',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    borderTop: '1px solid #EEF3EE',
                    paddingTop: '14px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 860px) {
          .calculator-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CoinGuidePage;
