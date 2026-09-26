import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  ShieldCheck,
  Layers,
  QrCode,
  History,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Clock,
  Settings,
  GraduationCap,
  Loader,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookCard from '../components/BookCard';
import ConditionBadge from '../components/ConditionBadge';
import { supabase } from '../lib/supabase';
import { normalizeBook, normalizeTransaction } from '../lib/normalizeBook';

const ProfilePage = ({ onNavigate, onSelectBook }) => {
  const { currentUser, bookCoins, campusHubs, addToast } = useApp();

  const [activeTab, setActiveTab]     = useState('listings');
  const [preferredHub, setPreferredHub] = useState(campusHubs[0]?.name || '');
  const [myListings, setMyListings]   = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    if (!supabase) {          // demo mode — no DB
      setLoading(false);
      return;
    }

    const [listRes, txRes] = await Promise.all([
      // My books
      supabase
        .from('books')
        .select('*, users(id, name, campus_name, trust_score, avatar_url)')
        .eq('seller_id', currentUser.id)
        .order('created_at', { ascending: false }),

      // All my transactions (credit + debit)
      supabase
        .from('transactions')
        .select('*, books(title, author, front_photo_url, condition_grade, ai_confidence_score)')
        .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order('transaction_date', { ascending: false }),
    ]);

    setMyListings((listRes.data || []).map(normalizeBook).filter(Boolean));

    const allTx = txRes.data || [];
    setTransactions(allTx.map(normalizeTransaction).filter(Boolean));

    // Pickup passes = debit transactions (redemptions I did as buyer)
    const passes = allTx
      .filter((tx) => tx.transaction_type === 'debit' && tx.buyer_id === currentUser.id)
      .map((tx) => ({
        id:              tx.id,
        status:          'Ready for Pickup',
        book: {
          title:         tx.books?.title || 'Unknown Book',
          author:        tx.books?.author || '',
          conditionGrade: tx.books?.condition_grade,
          conditionScore: tx.books?.ai_confidence_score || 85,
          images:        [tx.books?.front_photo_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'],
        },
        pickupPin:       `BL-${tx.reference_id?.slice(4, 8) || Math.floor(1000 + Math.random() * 9000)}`,
        pickupLockerHub: 'Central Library Smart Locker',
        redeemedDate:    tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-IN') : 'Recently',
      }));

    setMyRedemptions(passes);
    setLoading(false);
  }, [currentUser?.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast('Campus locker preferences updated!', 'success');
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h2>Please sign in to view your profile.</h2>
        <button className="btn-primary" onClick={() => onNavigate('auth')} style={{ marginTop: '16px' }}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>

      {/* ── Profile Header Card ────────────────────────────────────── */}
      <div className="card-white" style={{ padding: '32px', borderRadius: '24px', border: '1.5px solid #DCE6DE', boxShadow: '0 12px 36px rgba(22,36,28,0.06)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>

          {/* Initials Avatar & Credentials */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: 'var(--primary-forest)', color: '#FAF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', border: '3px solid var(--primary-forest)', boxShadow: '0 4px 14px rgba(63,98,72,0.2)', flexShrink: 0 }}>
              {currentUser.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{currentUser.name}</h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#EAF5EE', color: '#2D6A4F', fontSize: '0.75rem', fontWeight: '700' }}>
                  <ShieldCheck size={13} />
                  <span>Verified Student</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                <GraduationCap size={15} />
                <span>{currentUser.campus_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Member Since: <strong style={{ color: 'var(--text-main)' }}>{currentUser.created_at ? new Date(currentUser.created_at).getFullYear() : 'This Year'}</strong></span>
                <span>Trust Rating: <strong style={{ color: '#D97706' }}>★ {currentUser.trust_score || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* BookCoin Balance Pill */}
          <div style={{ background: 'linear-gradient(135deg, #FFFDF8 0%, #FEF3C7 100%)', border: '2px solid #FDE68A', borderRadius: '20px', padding: '18px 24px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '700', textTransform: 'uppercase' }}>Current BookCoin Balance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', justifyContent: 'flex-end' }}>
              <Coins size={24} color="#D97706" style={{ fill: '#F59E0B' }} />
              <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#B45309', fontFamily: 'var(--font-serif)', lineHeight: '1' }}>{bookCoins}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#92400E' }}>Coins</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '4px' }}>
              Redeemable for {Math.floor(bookCoins / 120)} - {Math.floor(bookCoins / 80)} textbooks
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #E2ECE5', marginBottom: '28px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'listings', label: `My Listings (${loading ? '…' : myListings.length})`, icon: Layers },
          { id: 'redemptions', label: `My Pickup Passes (${loading ? '…' : myRedemptions.length})`, icon: QrCode },
          { id: 'ledger', label: `Coin Ledger History (${loading ? '…' : transactions.length})`, icon: History },
          { id: 'settings', label: 'Campus & Locker Preferences', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderBottom: isActive ? '3px solid var(--primary-forest)' : '3px solid transparent',
                marginBottom: '-2px',
                color: isActive ? 'var(--primary-forest)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Loading overlay ────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader size={32} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── TAB 1: MY LISTINGS ────────────────────────────────────── */}
      {!loading && activeTab === 'listings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Books Uploaded by You</h3>
            <button className="btn-primary" onClick={() => onNavigate('list-book')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              <PlusCircle size={15} />
              <span>List New Book</span>
            </button>
          </div>
          {myListings.length > 0 ? (
            <div className="grid-responsive-cards">
              {myListings.map((book) => (
                <BookCard key={book.id} book={book} onSelect={(id) => onSelectBook(id)} />
              ))}
            </div>
          ) : (
            <div className="card-white" style={{ padding: '48px', textAlign: 'center', borderRadius: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                You haven't listed any textbooks yet. List a book with 5 quick photos and earn BookCoins instantly!
              </p>
              <button className="btn-primary" onClick={() => onNavigate('list-book')}>
                <PlusCircle size={16} />
                <span>List a Book Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY PICKUP PASSES ───────────────────────────────── */}
      {!loading && activeTab === 'redemptions' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Active Campus Locker Pickup Passes</h3>
          {myRedemptions.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {myRedemptions.map((item) => (
                <div key={item.id} className="card-white" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid #DCE6DE', boxShadow: '0 8px 24px rgba(22,36,28,0.05)' }}>
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                    <img src={item.book?.images?.[0]} alt={item.book?.title} style={{ width: '64px', height: '88px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <span className="badge-pill badge-grade-like-new" style={{ fontSize: '0.7rem', padding: '2px 8px', marginBottom: '4px' }}>{item.status}</span>
                      <div style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.3' }}>{item.book?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {item.book?.author}</div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#16241C', color: '#FAF6EC', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#A3B8AA', textTransform: 'uppercase' }}>Locker Verification PIN</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FDE68A', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{item.pickupPin}</div>
                    <div style={{ fontSize: '0.76rem', color: '#C4D4C8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#F59E0B" />
                      <span>{item.pickupLockerHub}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>Redeemed on {item.redeemedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-white" style={{ padding: '48px', textAlign: 'center', borderRadius: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                No active pickup passes. Explore books in the catalog and redeem with your BookCoins.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: COIN LEDGER ────────────────────────────────────── */}
      {!loading && activeTab === 'ledger' && (
        <div className="card-white" style={{ padding: '28px', borderRadius: '24px', border: '1.5px solid #DCE6DF' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>BookCoin Transaction Ledger</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Immutable audit trail of all rewards, bonuses, and textbook redemptions.</span>
          </div>
          {transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map((tx) => {
                const isCredit = tx.type === 'credit' || tx.amount > 0;
                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', backgroundColor: '#FAFDFB', border: '1px solid #E2ECE5', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isCredit ? '#EAF5EE' : '#FDF0ED', color: isCredit ? '#2D6A4F' : '#C8553D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{tx.category}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {tx.description} • <span style={{ fontFamily: 'monospace' }}>Ref: {tx.referenceId}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: isCredit ? '#2D6A4F' : '#C8553D', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Coins size={15} />
                        <span>{isCredit ? `+${Math.abs(tx.amount)}` : `-${Math.abs(tx.amount)}`} Coins</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tx.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No transactions yet. List a book to earn your first BookCoins!
            </p>
          )}
        </div>
      )}

      {/* ── TAB 4: CAMPUS PREFERENCES ─────────────────────────────── */}
      {!loading && activeTab === 'settings' && (
        <div className="card-white" style={{ padding: '36px', borderRadius: '24px', border: '1.5px solid #DCE6DF', maxWidth: '640px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Campus & Locker Preferences</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Select your primary locker point for instant drop-offs and notifications.
          </p>
          <form onSubmit={handleSavePreferences}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Home University Campus</label>
              <input type="text" value={currentUser.campus_name || ''} disabled style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D1DFD4', backgroundColor: '#F3F8F4', fontSize: '0.92rem', color: 'var(--text-main)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Preferred Campus Smart Locker Hub</label>
              <select value={preferredHub} onChange={(e) => setPreferredHub(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D1DFD4', backgroundColor: '#FFFFFF', fontSize: '0.92rem', color: 'var(--text-main)', outline: 'none' }}>
                {campusHubs.map((h) => (
                  <option key={h.id} value={h.name}>{h.campus} — {h.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Student Webmail Notification Address</label>
              <input type="email" defaultValue={currentUser.email || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #D1DFD4', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Save Locker Preferences</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
