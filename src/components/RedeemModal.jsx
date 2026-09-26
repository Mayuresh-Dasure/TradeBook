import React, { useState, useRef } from 'react';
import {
  X,
  Coins,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Loader,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConditionBadge from './ConditionBadge';

const RedeemModal = ({ book, onClose, onGoToDashboard, onGoToListBook }) => {
  const { bookCoins, redeemBook, campusHubs, addToast } = useApp();
  const [selectedHub, setSelectedHub] = useState(campusHubs[0]?.name || 'Central Library Smart Locker Point');
  const [step, setStep]               = useState('confirm'); // 'confirm' | 'loading' | 'success'
  const [generatedPass, setGeneratedPass] = useState(null);
  const [copiedPin, setCopiedPin]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');

  if (!book) return null;

  const canAfford    = bookCoins >= book.coinPrice;
  const balanceAfter = bookCoins - book.coinPrice;

  const handleConfirmRedemption = async () => {
    setStep('loading');
    setErrorMsg('');

    const result = await redeemBook(book.id, book.coinPrice, selectedHub, book.title);

    if (result.success) {
      setGeneratedPass(result.redemption);
      setStep('success');
    } else {
      setErrorMsg(result.reason === 'insufficient_funds'
        ? 'Insufficient BookCoins balance.'
        : result.reason === 'already_redeemed'
        ? 'This book was just claimed by another student.'
        : 'Redemption failed. Please try again.'
      );
      setStep('confirm');
    }
  };

  const copyPinToClipboard = (pin) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    addToast('Pickup PIN copied to clipboard!', 'info');
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(22, 36, 28, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card-white modal-animate"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F2',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* ── Loading Step ─────────────────────────────────────────── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader size={40} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Processing redemption…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Confirm Step ─────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Academic Book Exchange Pass
              </span>
              <h2 style={{ fontSize: '1.45rem', marginTop: '4px' }}>Confirm Book Redemption</h2>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#991B1B' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Book Preview */}
            <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#F7FAF7', borderRadius: '16px', border: '1px solid #E2ECE5', marginBottom: '20px' }}>
              <img
                src={book.coverImage || (book.images && book.images[0])}
                alt={book.title}
                style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <ConditionBadge grade={book.conditionGrade} score={book.conditionScore} size="sm" />
                  <span className="badge-pill badge-subject" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{book.category}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', lineHeight: '1.3', marginBottom: '4px' }}>{book.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>by {book.author}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-forest)', marginTop: '8px', fontWeight: '600' }}>
                  Seller: {book.seller?.name} ({book.campus})
                </div>
              </div>
            </div>

            {/* Coin breakdown */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5ECE6', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #EEF2EE', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Your Current Balance</span>
                <span style={{ fontWeight: '700', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Coins size={14} /> {bookCoins} BookCoins
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EEF2EE', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Redemption Cost</span>
                <span style={{ fontWeight: '700', color: '#C8553D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  - {book.coinPrice} BookCoins
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: '600' }}>Balance Remaining</span>
                <span style={{ fontWeight: '800', color: canAfford ? 'var(--primary-forest)' : '#C8553D' }}>
                  {canAfford ? `${balanceAfter} BookCoins` : 'Insufficient Coins'}
                </span>
              </div>
            </div>

            {/* Hub selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                Select Campus Pickup Locker Point
              </label>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D1DFD4', backgroundColor: '#FAFDFB', fontSize: '0.9rem', outline: 'none', color: 'var(--text-main)' }}
              >
                {campusHubs.map((hub) => (
                  <option key={hub.id} value={hub.name}>
                    {hub.campus} — {hub.name} ({hub.lockersAvailable} lockers free)
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="var(--primary-forest)" />
                Drop-off is verified with an automated electronic locker scan.
              </p>
            </div>

            {/* Actions */}
            {canAfford ? (
              <button className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} onClick={handleConfirmRedemption}>
                <Coins size={18} />
                <span>Confirm & Deduct {book.coinPrice} Coins</span>
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <AlertCircle size={16} />
                  <span>You need {book.coinPrice - bookCoins} more BookCoins to redeem this book.</span>
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => { onClose(); if (onGoToListBook) onGoToListBook(); }}>
                  <Coins size={18} />
                  <span>List a Book to Earn Coins Instantly</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Success Step ─────────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EAF5EE', color: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Redemption Successful!
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '4px', marginBottom: '8px' }}>Your Campus Pickup Pass is Ready</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Coins have been deducted. Use the pass below at your campus locker point.
            </p>

            {/* Digital Pass Card */}
            <div style={{ backgroundColor: '#16241C', color: '#FAF6EC', borderRadius: '20px', padding: '24px', textAlign: 'left', marginBottom: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #F59E0B, #10B981)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#A3B8AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BookLoop Campus Exchange Pass</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>{book.title}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(52,211,153,0.2)', color: '#34D399', fontSize: '0.74rem', fontWeight: '700' }}>Active</div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
                {/* Simulated QR */}
                <div style={{ width: '90px', height: '90px', backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px' }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{ backgroundColor: [0, 1, 3, 4, 5, 8, 9, 11, 12, 14, 15, 18, 20, 21, 23, 24].includes(i) ? '#16241C' : '#FFFFFF', borderRadius: '1px' }} />
                    ))}
                  </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#A3B8AA' }}>Pickup Verification PIN</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.1em', color: '#FDE68A', fontFamily: 'monospace' }}>
                      {generatedPass?.pickupPin || 'BL-0000'}
                    </span>
                    <button
                      onClick={() => copyPinToClipboard(generatedPass?.pickupPin || 'BL-0000')}
                      style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FAF6EC', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={11} />
                      <span>{copiedPin ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A3B8AA', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} color="#34D399" />
                    <span>Expires in 48 hours</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#C4D4C8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="#F59E0B" />
                <span>Station: {selectedHub}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={onClose}>Done</button>
              <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => { onClose(); if (onGoToDashboard) onGoToDashboard(); }}>
                <span>View in Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemModal;
