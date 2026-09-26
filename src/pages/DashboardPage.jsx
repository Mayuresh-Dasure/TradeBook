import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Layers,
  Leaf,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Building2,
  Copy,
  BookOpen,
  Loader,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ConditionBadge from '../components/ConditionBadge';
import BookCard from '../components/BookCard';
import { supabase } from '../lib/supabase';
import { normalizeBook } from '../lib/normalizeBook';

const DashboardPage = ({ onNavigate, onSelectBook }) => {
  const { currentUser, bookCoins, ecoMetrics, setActiveModal, addToast } = useApp();

  const [myListings, setMyListings]       = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [annRecommending, setAnnRecommending]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [copiedPassId, setCopiedPassId]   = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    if (!supabase) {           // demo mode — no DB
      setLoading(false);
      return;
    }

    // 1. My listings
    const { data: listingsData } = await supabase
      .from('books')
      .select('*, users(id, name, campus_name, trust_score, avatar_url)')
      .eq('seller_id', currentUser.id)
      .order('created_at', { ascending: false });

    setMyListings((listingsData || []).map(normalizeBook).filter(Boolean));

    // 2. My redemption passes (transactions where I am buyer)
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, books(title, author, condition_grade, ai_confidence_score, front_photo_url, coin_value)')
      .eq('buyer_id', currentUser.id)
      .eq('transaction_type', 'debit')
      .order('transaction_date', { ascending: false });

    // Transform into the shape DashboardPage pickup pass cards expect
    const passes = (txData || []).map((tx) => ({
      id:              tx.id,
      status:          'Ready for Pickup',
      book: {
        title:         tx.books?.title || 'Unknown Book',
        author:        tx.books?.author || '',
        conditionGrade: tx.books?.condition_grade,
        conditionScore: tx.books?.ai_confidence_score || 85,
        coverImage:    tx.books?.front_photo_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        images:        [tx.books?.front_photo_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'],
      },
      pickupPin:       `BL-${tx.reference_id?.slice(4, 8) || Math.floor(1000 + Math.random() * 9000)}`,
      pickupLockerHub: 'Central Library Smart Locker',
      redeemedDate:    tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-IN') : 'Recently',
      expiresIn:       '48 hours remaining',
    }));

    setMyRedemptions(passes);

    // 3. Fetch candidate books for ANN recommendation
    const { data: recData } = await supabase
      .from('books')
      .select('*, users(id, name, campus_name, trust_score, avatar_url)')
      .eq('status', 'available')
      .neq('seller_id', currentUser.id)
      .limit(20)
      .order('created_at', { ascending: false });

    const candidates = (recData || []).map(normalizeBook).filter(Boolean);

    // 4. Try ANN recommendation — rank candidates by neural network score
    const CATEGORY_MAP = {
      'Engineering':  [1, 0, 0, 0],
      'Commerce':     [0, 1, 0, 0],
      'Science':      [0, 0, 1, 0],
      'Arts':         [0, 0, 0, 1],
      'General Academic': [0, 0, 0, 0],
    };

    const getCategoryVec = (cat) =>
      CATEGORY_MAP[cat] || [0, 0, 0, 0];

    // User features: inferred from their past redemptions + campus
    const userCatVec = getCategoryVec(currentUser.campus_name);
    const userAvgCoin = passes.length > 0
      ? Math.min(1.0, (passes.reduce((s, p) => s + (p.book?.coinValue || 200), 0) / passes.length) / 500)
      : 0.5;
    const userFeatures = [...userCatVec, userAvgCoin]; // length 5

    try {
      setAnnRecommending(true);
      const ML_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';
      const bookPayload = candidates.map((b) => ({
        id: b.id,
        features: [
          ...getCategoryVec(b.subjectCategory || b.subject_category),
          Math.min(1.0, (b.coinValue || b.coin_value || 200) / 500),
        ],
      }));

      const res = await fetch(`${ML_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_features: userFeatures, books: bookPayload }),
        signal: AbortSignal.timeout(4000), // 4 s timeout
      });

      if (res.ok) {
        const json = await res.json();
        const ranked = json.data || [];
        // Re-order candidates by ANN match_probability
        const scoreMap = Object.fromEntries(ranked.map((r) => [r.book_id, r.match_probability]));
        const sorted = [...candidates].sort(
          (a, b) => (scoreMap[b.id] || 0) - (scoreMap[a.id] || 0)
        );
        setRecommendedBooks(sorted.slice(0, 4));
      } else {
        setRecommendedBooks(candidates.slice(0, 4));
      }
    } catch (_) {
      // ML service offline — fall back to recency order
      setRecommendedBooks(candidates.slice(0, 4));
    } finally {
      setAnnRecommending(false);
    }

    setLoading(false);
  }, [currentUser?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCopyPin = (pin, passId) => {
    navigator.clipboard.writeText(pin);
    setCopiedPassId(passId);
    addToast(`PIN ${pin} copied!`, 'info');
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h2>Please sign in to access your Dashboard</h2>
        <button className="btn-primary" onClick={() => onNavigate('auth')} style={{ marginTop: '16px' }}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Student Hub & Economy Portal
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#EAF5EE', color: '#2D6A4F', padding: '2px 8px', borderRadius: '9999px', fontWeight: '700' }}>
              Live Wallet
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginTop: '4px' }}>
            Welcome back, {currentUser.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {currentUser.campus_name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-gold" onClick={() => onNavigate('list-book')} style={{ padding: '12px 24px', fontSize: '0.92rem' }}>
            <PlusCircle size={16} />
            <span>List Book (+Earn Coins)</span>
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('browse')} style={{ padding: '12px 20px', fontSize: '0.92rem' }}>
            <BookOpen size={16} />
            <span>Browse Catalog</span>
          </button>
        </div>
      </div>

      {/* ── Wallet Hero & Quick Stats ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '36px' }} className="dashboard-hero-grid">

        {/* Wallet Balance Card */}
        <div className="card-white" style={{ padding: '32px', borderRadius: '24px', border: '2px solid #FDE68A', background: 'linear-gradient(135deg, #FFFDF9 0%, #FEF9EE 100%)', boxShadow: '0 12px 36px rgba(217,119,6,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your BookCoin Economy Balance</span>
              <span style={{ fontSize: '0.74rem', backgroundColor: 'rgba(217,119,6,0.12)', color: '#B45309', padding: '4px 10px', borderRadius: '9999px', fontWeight: '700' }}>Instant Redemption Ready</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <Coins size={36} color="#D97706" style={{ fill: '#F59E0B' }} />
              <span style={{ fontSize: '3.4rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: '#B45309', lineHeight: '1' }}>{bookCoins}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#92400E' }}>BookCoins</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#78350F', marginBottom: '20px' }}>
              Worth ~₹{bookCoins * 2.8} in textbook purchasing power. Never expires across active semesters.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px dashed #E6D7B8', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onNavigate('coin-guide')} style={{ fontSize: '0.84rem', padding: '9px 18px' }}>
              <Coins size={15} />
              <span>Valuation Guide & Calculator</span>
            </button>
            <button className="btn-ghost" onClick={() => onNavigate('profile')} style={{ fontSize: '0.84rem', color: '#78350F', border: '1px solid #E6D7B8' }}>
              <span>View Coin Ledger</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Activity Card */}
        <div className="card-white" style={{ padding: '28px', borderRadius: '24px', border: '1.5px solid #DCE6DF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Your Semester Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>My Listed Textbooks</span>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {loading ? '—' : `${myListings.length} Books`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Claimed Pickup Passes</span>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#2D6A4F' }}>
                  {loading ? '—' : `${myRedemptions.length} Active`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Campus Trust Score</span>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ★ {currentUser.trust_score || 0} / 5.0
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#F3F8F4', borderRadius: '12px', fontSize: '0.78rem', color: 'var(--primary-forest)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <ShieldCheck size={16} />
            <span>Connected to {currentUser.campus_name} Drop-Off Locker Hub</span>
          </div>
        </div>
      </div>

      {/* ── Eco Impact ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '18px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase' }}>Environmental & Financial Metrics</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Your Circular Impact on Campus</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <StatCard icon={Coins} label="Total Money Saved" value={`₹${ecoMetrics.moneySaved.toLocaleString()}`} subtext="Calculated vs new retail book prices" trend="+100% Cash Free" />
          <StatCard icon={Leaf} label="Carbon Emissions Averted" value={`${ecoMetrics.carbonSavedKg} kg`} subtext="Paper processing & logistics saved" trend="CO₂ Negative" />
          <StatCard icon={Layers} label="Trees Preserved" value={`${ecoMetrics.treesPreserved} Trees`} subtext="Through circular campus reuse" trend="Green Campus" />
          <StatCard icon={ShieldCheck} label="Campus Exchanges" value={ecoMetrics.exchangesCompleted.toLocaleString()} subtext="Across 6 partner universities" trend="Verified" />
        </div>
      </div>

      {/* ── Active Pickup Passes ───────────────────────────────────── */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase' }}>Pickup Verification</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Active Campus Pickup Passes</h2>
          </div>
          <button className="btn-ghost" onClick={() => setActiveModal({ type: 'campusHub' })} style={{ fontSize: '0.84rem' }}>
            <Building2 size={15} />
            <span>Locker Stations Map</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={28} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : myRedemptions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {myRedemptions.map((item) => (
              <div key={item.id} className="card-white" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid #DCE6DE', boxShadow: '0 8px 24px rgba(22,36,28,0.05)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img src={item.book?.coverImage || item.book?.images?.[0]} alt={item.book?.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.98rem', lineHeight: '1.3', marginBottom: '4px' }}>{item.book?.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>by {item.book?.author}</div>
                      <div style={{ marginTop: '4px' }}>
                        <ConditionBadge grade={item.book?.conditionGrade} score={item.book?.conditionScore} size="sm" />
                      </div>
                    </div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#EAF5EE', color: '#2D6A4F', fontSize: '0.72rem', fontWeight: '700' }}>{item.status}</span>
                </div>
                <div style={{ backgroundColor: '#16241C', color: '#FAF6EC', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#A3B8AA', textTransform: 'uppercase' }}>Locker Entry PIN</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FDE68A', fontFamily: 'monospace' }}>{item.pickupPin}</div>
                    </div>
                    <button onClick={() => handleCopyPin(item.pickupPin, item.id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FAF6EC', borderRadius: '6px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={12} />
                      <span>{copiedPassId === item.id ? 'Copied' : 'Copy PIN'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#C4D4C8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#F59E0B" />
                    <span>Station: {item.pickupLockerHub}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>Redeemed: {item.redeemedDate} ({item.expiresIn})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-white" style={{ padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You haven't claimed any books yet. Browse the marketplace and redeem books with your BookCoins!
            </p>
          </div>
        )}
      </div>

      {/* ── My Active Listings ────────────────────────────────────── */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase' }}>Your Uploaded Textbooks</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '2px' }}>My Active Listings ({loading ? '…' : myListings.length})</h2>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('list-book')} style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <PlusCircle size={15} />
            <span>List Another Book</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={28} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : myListings.length > 0 ? (
          <div className="grid-responsive-cards">
            {myListings.map((book) => (
              <BookCard key={book.id} book={book} onSelect={(id) => onSelectBook(id)} />
            ))}
          </div>
        ) : (
          <div className="card-white" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Active Listings Yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Earn +145 to +450 BookCoins immediately by uploading photos of past semester books.
            </p>
            <button className="btn-primary" onClick={() => onNavigate('list-book')}>
              <PlusCircle size={16} />
              <span>List Your First Book</span>
            </button>
          </div>
        )}
      </div>

      {/* ── ANN Recommended Books ───────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase' }}>AI-Powered · ANN Recommendations</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
                borderRadius: '9999px', backgroundColor: '#EEF2FF', color: '#4F46E5',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {annRecommending ? '⚡ Ranking…' : '🧠 Neural Network'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Recommended for You</h2>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('browse')} style={{ fontSize: '0.85rem' }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={28} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : recommendedBooks.length > 0 ? (
          <div className="grid-responsive-cards">
            {recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} onSelect={(id) => onSelectBook(id)} />
            ))}
          </div>
        ) : (
          <div className="card-white" style={{ padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No recommendations yet. Be the first to list a book!</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) { .dashboard-hero-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DashboardPage;
