import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CAMPUS_OPTIONS = [
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'BITS Pilani',
  'AIIMS Delhi',
  'Delhi University',
  'VIT Vellore',
  'NIT Trichy',
  'IIM Ahmedabad',
  'Other',
];

const AuthPage = ({ onNavigate }) => {
  const { login, signUp, currentUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name:       '',
    email:      '',
    password:   '',
    campusName: 'IIT Delhi',
  });

  // If already logged in, redirect to dashboard smoothly
  useEffect(() => {
    if (currentUser) {
      onNavigate('dashboard');
    }
  }, [currentUser, onNavigate]);

  if (currentUser) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <Loader size={36} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Redirecting to your Dashboard…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    let result;
    if (isSignUp) {
      if (!formData.name.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      result = await signUp(formData.email, formData.password, formData.name.trim(), formData.campusName);
    } else {
      result = await login(formData.email, formData.password);
    }

    setLoading(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setErrorMsg(result.error || 'Something went wrong. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #D1DFD4',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '700',
    marginBottom: '4px',
    color: 'var(--text-main)',
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="card-white auth-card-layout" style={{
        width: '100%',
        maxWidth: '880px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(22, 36, 28, 0.1)',
        border: '1.5px solid #DCE6DE',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr'
      }}>

        {/* ── Left Side: Campus Branding ───────────────────────── */}
        <div style={{
          backgroundColor: '#16241C',
          color: '#FAF6EC',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-btn)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF6EC'
              }}>
                <BookOpen size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: '800' }}>
                BookLoop
              </span>
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#FAF6EC', lineHeight: '1.25', marginBottom: '14px' }}>
              Verified Campus Student Network
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-on-dark-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
              Join thousands of students exchanging academic textbooks with zero cash and instant BookCoin rewards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Institutional student email verification',
                'Instant AI photo condition appraisal',
                '24/7 automated campus locker drop points',
                '100% money-back condition guarantees',
              ].map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={15} color="#34D399" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#E8EFE9' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.74rem',
            color: '#A3B8AA'
          }}>
            🔒 Protected by Supabase Row-Level Security.
          </div>
        </div>

        {/* ── Right Side: Auth Form ────────────────────────────── */}
        <div style={{ padding: '40px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
                {isSignUp ? 'Create Student Account' : 'Student Sign In'}
              </h3>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                style={{ fontSize: '0.82rem', color: 'var(--primary-forest)', fontWeight: '700', textDecoration: 'underline' }}
              >
                {isSignUp ? 'Have an account? Sign In' : 'New student? Sign Up'}
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Use your university email to access campus lockers and the BookCoin economy.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              color: '#991B1B',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name — Sign Up only */}
            {isSignUp && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Aakash Gupta"
                  style={inputStyle}
                  required
                />
              </div>
            )}

            {/* Campus — shown for both (used on sign-up, cosmetic on sign-in) */}
            {isSignUp && (
              <div>
                <label style={labelStyle}>University Campus</label>
                <select
                  value={formData.campusName}
                  onChange={handleChange('campusName')}
                  style={inputStyle}
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>University Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="rollno@campus.ac.in"
                style={inputStyle}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder={isSignUp ? 'Min 6 characters' : '••••••••'}
                style={inputStyle}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '0.96rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  <span>{isSignUp ? 'Creating Account…' : 'Signing In…'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Register & Join BookLoop' : 'Sign In to Campus Hub'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Responsive layout */}
      <style>{`
        @media (max-width: 768px) {
          .auth-card-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuthPage;
