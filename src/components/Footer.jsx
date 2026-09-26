import React from 'react';
import { BookOpen, ShieldCheck, Coins, Building2, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Footer = ({ onNavigate }) => {
  const { ecoMetrics, setActiveModal } = useApp();

  return (
    <footer style={{
      backgroundColor: 'var(--bg-dark)',
      color: 'var(--text-on-dark)',
      paddingTop: '64px',
      paddingBottom: '36px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container">
        {/* Top Feature Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="icon-circle-badge dark" style={{ flexShrink: 0 }}>
              <ShieldCheck size={22} color="#34D399" />
            </div>
            <div>
              <h4 style={{ color: '#FAF6EC', fontSize: '1.05rem', marginBottom: '4px' }}>
                AI Vision Grade Guarantee
              </h4>
              <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                Every book undergoes automated multi-angle computer vision inspection before BookCoins are credited.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="icon-circle-badge dark" style={{ flexShrink: 0 }}>
              <Coins size={22} color="#F59E0B" />
            </div>
            <div>
              <h4 style={{ color: '#FAF6EC', fontSize: '1.05rem', marginBottom: '4px' }}>
                Zero-Cash BookCoin Wallet
              </h4>
              <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                Circulate knowledge frictionless. Earn BookCoins immediately on listing and redeem for required course texts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="icon-circle-badge dark" style={{ flexShrink: 0 }}>
              <Building2 size={22} color="#60A5FA" />
            </div>
            <div>
              <h4 style={{ color: '#FAF6EC', fontSize: '1.05rem', marginBottom: '4px' }}>
                Contactless Campus Lockers
              </h4>
              <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                Pick up and drop off books securely 24/7 at automated university hub lockers with zero peer coordination hassle.
              </p>
            </div>
          </div>
        </div>

        {/* Campus Network Strip */}
        <div style={{
          padding: '36px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A3B8AA', fontWeight: '700' }}>
              Active University Partner Network
            </span>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '12px'
            }}>
              {['IIT Delhi', 'BITS Pilani', 'AIIMS New Delhi', 'IIT Bombay', 'Delhi University', 'VIT Vellore'].map((campus, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: '#E8EFE9'
                  }}
                >
                  🏛️ {campus}
                </span>
              ))}
            </div>
          </div>

          {/* Eco Impact Pill */}
          <div style={{
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 211, 153, 0.2)',
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>
                {ecoMetrics.carbonSavedKg} kg CO₂ Averted
              </div>
              <div style={{ fontSize: '0.74rem', color: '#A3B8AA' }}>
                Across {ecoMetrics.exchangesCompleted.toLocaleString()} peer textbook exchanges
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-btn)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF6EC'
              }}>
                <BookOpen size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '800' }}>
                BookLoop
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-on-dark-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              The student-to-student academic textbook economy. Eliminating the high cost of higher education through computer vision appraisal and trusted campus drop-off lockers.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#79A887' }}>
              Built for campus sustainability & academic access.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ color: '#FAF6EC', fontSize: '0.92rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Marketplace
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-on-dark-muted)' }}>
              <li>
                <button onClick={() => onNavigate('browse')} style={{ color: 'inherit', textAlign: 'left' }}>
                  Browse All Textbooks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('list-book')} style={{ color: 'inherit', textAlign: 'left' }}>
                  List a Book (4-Step AI Flow)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('coin-guide')} style={{ color: 'inherit', textAlign: 'left' }}>
                  BookCoin Valuation Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal({ type: 'campusHub' })} style={{ color: 'inherit', textAlign: 'left' }}>
                  Campus Locker Network
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Categories */}
          <div>
            <h5 style={{ color: '#FAF6EC', fontSize: '0.92rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Disciplines
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-on-dark-muted)' }}>
              <li><span>Computer Science & IT</span></li>
              <li><span>JEE & NEET Preparation</span></li>
              <li><span>Mechanical & Electrical Engg</span></li>
              <li><span>Medical & Clinical Sciences</span></li>
              <li><span>Economics & Management</span></li>
            </ul>
          </div>

          {/* Student Trust */}
          <div>
            <h5 style={{ color: '#FAF6EC', fontSize: '0.92rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trust & Security
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-on-dark-muted)' }}>
              <li><span>AI OCR & Condition Guidelines</span></li>
              <li><span>Student ID Verification</span></li>
              <li><span>Locker PIN Cryptographic Pass</span></li>
              <li><span>Campus Sustainability Report</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-on-dark-muted)'
        }}>
          <div>
            © 2026 BookLoop Academic Exchange Network. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Campus Ambassador Program</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
