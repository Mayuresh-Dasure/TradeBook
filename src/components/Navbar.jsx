import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Coins,
  PlusCircle,
  ChevronDown,
  User,
  Layers,
  Menu,
  X,
  ShieldCheck,
  Building2,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = ({ activePage, onNavigate }) => {
  const { currentUser, bookCoins, logout, setActiveModal } = useApp();
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    onNavigate('landing');
  };

  // First word of campus for the badge chip
  const campusBadge = currentUser?.campus_name
    ? currentUser.campus_name.split(' ')[0]
    : 'Campus';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'rgba(250, 246, 236, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(63, 98, 72, 0.12)',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>

        {/* Left: Brand Logo */}
        <div
          onClick={() => handleNavClick('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-forest)', color: '#FAF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(63,98,72,0.3)' }}>
            <BookOpen size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1' }}>
                Book<span style={{ color: 'var(--primary-forest)' }}>Loop</span>
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 6px', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {campusBadge}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>Academic Book Economy</span>
          </div>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
          <button
            className={`btn-ghost ${activePage === 'browse' ? 'active' : ''}`}
            onClick={() => handleNavClick('browse')}
            style={{ fontWeight: activePage === 'browse' ? '700' : '600', color: activePage === 'browse' ? 'var(--primary-forest)' : 'var(--text-main)', backgroundColor: activePage === 'browse' ? 'var(--primary-light)' : 'transparent', fontSize: '0.92rem' }}
          >
            Browse Books
          </button>
          <button
            className={`btn-ghost ${activePage === 'coin-guide' ? 'active' : ''}`}
            onClick={() => handleNavClick('coin-guide')}
            style={{ fontWeight: activePage === 'coin-guide' ? '700' : '600', color: activePage === 'coin-guide' ? 'var(--primary-forest)' : 'var(--text-main)', backgroundColor: activePage === 'coin-guide' ? 'var(--primary-light)' : 'transparent', fontSize: '0.92rem' }}
          >
            Coin Guide & Calculator
          </button>
          {currentUser && (
            <button
              className={`btn-ghost ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
              style={{ fontWeight: activePage === 'dashboard' ? '700' : '600', color: activePage === 'dashboard' ? 'var(--primary-forest)' : 'var(--text-main)', backgroundColor: activePage === 'dashboard' ? 'var(--primary-light)' : 'transparent', fontSize: '0.92rem' }}
            >
              Dashboard
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={() => setActiveModal({ type: 'campusHub' })}
            style={{ fontSize: '0.92rem', fontWeight: '500' }}
          >
            <Building2 size={15} />
            <span>Campus Lockers</span>
          </button>
        </nav>

        {/* Right: Actions & User Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          {/* Wallet Pill — shown only when logged in */}
          {currentUser && (
            <div
              onClick={() => handleNavClick('profile')}
              className="badge-pill badge-coin"
              style={{ cursor: 'pointer', padding: '7px 14px', fontSize: '0.88rem', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Your BookCoins Balance"
            >
              <Coins size={16} color="#D97706" style={{ fill: '#F59E0B' }} />
              <span>{bookCoins}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: '600' }}>Coins</span>
            </div>
          )}

          {/* List a Book CTA */}
          {currentUser && (
            <button
              className="btn-primary"
              onClick={() => handleNavClick('list-book')}
              style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={16} />
              <span className="hide-on-mobile">List a Book</span>
            </button>
          )}

          {/* User Profile Dropdown OR Sign In button */}
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: '9999px',
                  backgroundColor: dropdownOpen ? 'var(--primary-light)' : 'transparent',
                  border: '1px solid #DCE6DE',
                }}
              >
                {/* Initials Avatar */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-forest)',
                  color: '#FAF6EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: '1.5px solid var(--primary-forest)',
                }}>
                  {currentUser.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hide-on-mobile">
                  {currentUser.name?.split(' ')[0] || 'Student'}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="card-white modal-animate"
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '240px', padding: '12px', borderRadius: '18px', boxShadow: '0 12px 36px rgba(22,36,28,0.15)', zIndex: 1000 }}
                >
                  {/* User header */}
                  <div style={{ padding: '10px', borderBottom: '1px solid #EEF3EE', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{currentUser.campus_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: '#2D6A4F', fontWeight: '700' }}>
                      <ShieldCheck size={13} />
                      <span>Verified Student (Trust: {currentUser.trust_score}★)</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => handleNavClick('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%', textAlign: 'left' }} className="btn-ghost">
                      <Layers size={15} color="var(--primary-forest)" />
                      <span>My Dashboard</span>
                    </button>
                    <button onClick={() => handleNavClick('profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%', textAlign: 'left' }} className="btn-ghost">
                      <User size={15} color="var(--primary-forest)" />
                      <span>Profile & Coin Ledger</span>
                    </button>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', color: '#C8553D', width: '100%', textAlign: 'left', marginTop: '4px', borderTop: '1px solid #EEF3EE', paddingTop: '10px' }} className="btn-ghost">
                      <LogOut size={15} color="#C8553D" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary" onClick={() => handleNavClick('auth')} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              Sign In
            </button>
          )}

          {/* Mobile Hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '6px', display: 'none', color: 'var(--text-main)' }} className="show-on-mobile">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#FAF6EC', borderBottom: '1px solid #DCE6DE', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '1rem' }} onClick={() => handleNavClick('browse')}>Browse Books</button>
          <button className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '1rem' }} onClick={() => handleNavClick('coin-guide')}>Coin Guide & Calculator</button>
          {currentUser && (
            <>
              <button className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '1rem' }} onClick={() => handleNavClick('dashboard')}>Dashboard</button>
              <button className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '1rem' }} onClick={() => handleNavClick('profile')}>Profile & Transactions</button>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }} onClick={() => handleNavClick('list-book')}>
                <PlusCircle size={18} />
                <span>List a Book & Earn Coins</span>
              </button>
              <button className="btn-ghost" style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '1rem', color: '#C8553D' }} onClick={handleLogout}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          )}
          {!currentUser && (
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('auth')}>Sign In / Sign Up</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
