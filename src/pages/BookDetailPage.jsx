import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Share2,
  Bookmark,
  Loader,
} from 'lucide-react';
import ConditionBadge from '../components/ConditionBadge';
import BookCard from '../components/BookCard';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { normalizeBook } from '../lib/normalizeBook';

const PHOTO_LABELS = [
  '1. Front Cover (OCR Scanned)',
  '2. Back Cover & Barcode',
  '3. Spine & Binding Integrity',
  '4. Sample Internal Page',
  '5. Full Angle Distance',
];

const BookDetailPage = ({ bookId, onBack, onSelectBook, onOpenRedeemModal, onNavigate }) => {
  const { bookCoins, currentUser, addToast } = useApp();

  const [book, setBook]                     = useState(null);
  const [similarBooks, setSimilarBooks]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isSaved, setIsSaved]               = useState(false);

  // ─── Fetch the book by ID ───────────────────────────────────────────────────
  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setSelectedImageIdx(0);

    if (!supabase) {          // demo mode — no DB
      setLoading(false);
      return;
    }

    supabase
      .from('books')
      .select('*, users(id, name, campus_name, trust_score, avatar_url)')
      .eq('id', bookId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('Book fetch error:', error);
          setBook(null);
        } else {
          const normalized = normalizeBook(data);
          setBook(normalized);

          // Fetch similar books (same category, available, not this one)
          supabase
            .from('books')
            .select('*, users(id, name, campus_name, trust_score, avatar_url)')
            .eq('status', 'available')
            .eq('subject_category', data.subject_category)
            .neq('id', bookId)
            .limit(3)
            .then(({ data: simData }) => {
              setSimilarBooks((simData || []).map(normalizeBook).filter(Boolean));
            });
        }
        setLoading(false);
      });
  }, [bookId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Book link copied to clipboard!', 'info');
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
    addToast(isSaved ? 'Removed from saved wishlist' : 'Added to wishlist!', 'success');
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader size={36} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading book details…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Not found ─────────────────────────────────────────────────────────────
  if (!book) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Book Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          This book may have already been claimed or removed from the marketplace.
        </p>
        <button className="btn-primary" onClick={onBack} style={{ marginTop: '8px' }}>
          Back to Browse
        </button>
      </div>
    );
  }

  const images       = book.images && book.images.length > 0 ? book.images : [book.coverImage];
  const canAfford    = bookCoins >= book.coinPrice;
  const isOwnListing = book.seller?.id === currentUser?.id;

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '80px' }}>

      {/* ── Top Breadcrumbs & Action Bar ──────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{ padding: '6px 12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleSave}
            className="btn-ghost"
            style={{ border: '1px solid #DCE6DE', padding: '8px 14px', color: isSaved ? '#C8553D' : 'var(--text-main)' }}
          >
            <Bookmark size={15} style={{ fill: isSaved ? '#C8553D' : 'none' }} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="btn-ghost"
            style={{ border: '1px solid #DCE6DE', padding: '8px 14px' }}
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── Main Grid: Left Gallery, Right Details ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '40px', alignItems: 'start' }} className="book-detail-layout">

        {/* LEFT: 5-Photo Gallery */}
        <div>
          {/* Main Image */}
          <div style={{
            position: 'relative', height: '460px',
            backgroundColor: '#EBE5D8', borderRadius: '20px',
            overflow: 'hidden', boxShadow: '0 12px 36px rgba(22,36,28,0.09)',
            border: '1px solid #DCE6DF', marginBottom: '16px'
          }}>
            <img
              src={images[selectedImageIdx] || images[0]}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Condition badge overlay */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <ConditionBadge grade={book.conditionGrade} score={book.conditionScore} size="lg" showScore />
            </div>

            {/* Caption pill */}
            <div style={{
              position: 'absolute', bottom: '16px', left: '16px', right: '16px',
              backgroundColor: 'rgba(22,36,28,0.82)', backdropFilter: 'blur(8px)',
              borderRadius: '10px', padding: '8px 14px', color: '#FFFFFF',
              fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontWeight: '600' }}>
                {PHOTO_LABELS[selectedImageIdx] || `Inspection Photo #${selectedImageIdx + 1}`}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#A3B8AA' }}>AI CV Verified Frame</span>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '32px' }}>
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                style={{
                  height: '80px', borderRadius: '12px', overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImageIdx === idx ? '2.5px solid var(--primary-forest)' : '1px solid #D0DED4',
                  boxShadow: selectedImageIdx === idx ? '0 4px 14px rgba(63,98,72,0.3)' : 'none',
                  opacity: selectedImageIdx === idx ? 1 : 0.75,
                  transition: 'all 0.2s ease', backgroundColor: '#FAF6EC'
                }}
              >
                <img src={imgUrl} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* AI Condition Report Card */}
          <div className="card-white" style={{ padding: '24px', border: '1.5px solid #DCE6DE', borderRadius: '20px', boxShadow: '0 8px 24px rgba(22,36,28,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div className="icon-circle-badge" style={{ width: '32px', height: '32px' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>AI Multi-Angle Condition Report</h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Assessed with Computer Vision Inspection Model v4.2
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Spine & Binding',    value: book.conditionBreakdown?.binding },
                { label: 'Cover & Edges',      value: book.conditionBreakdown?.cover },
                { label: 'Page Annotations',   value: book.conditionBreakdown?.pages },
                { label: 'Paper Aging & Tone', value: book.conditionBreakdown?.yellowing },
              ].map(({ label, value }) => (
                <div key={label} style={{ backgroundColor: '#F8FAF8', padding: '12px', borderRadius: '12px', border: '1px solid #E5EFE7' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-forest)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              💡 <strong>Quality Assurance Guarantee:</strong> If the book condition does not match this AI appraisal at locker collection, your BookCoins are automatically refunded 100%.
            </p>
          </div>
        </div>

        {/* RIGHT: Details & Redemption */}
        <div>
          {/* Category & demand pills */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge-pill badge-subject">{book.category}</span>
            <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: '700' }}>
              🔥 {book.demandLevel}
            </span>
          </div>

          <h1 style={{ fontSize: '2.1rem', lineHeight: '1.2', marginBottom: '10px', color: 'var(--text-main)' }}>
            {book.title}
          </h1>
          <div style={{ fontSize: '1.02rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            by <strong style={{ color: 'var(--text-main)' }}>{book.author}</strong>
          </div>

          {/* Metadata strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '14px 18px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5ECE6', marginBottom: '24px', fontSize: '0.84rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Edition: </span><strong>{book.edition || 'Standard Academic Ed.'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>ISBN: </span><strong style={{ fontFamily: 'monospace' }}>{book.isbn || 'N/A'}</strong></div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status: </span>
              <strong style={{ color: book.status === 'redeemed' ? '#C8553D' : '#2D6A4F' }}>
                {book.status === 'redeemed' ? 'Claimed' : 'Available for Exchange'}
              </strong>
            </div>
          </div>

          {/* Pricing card */}
          <div className="card-white" style={{ padding: '24px', borderRadius: '20px', border: '2px solid #FDE68A', background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF6EC 100%)', boxShadow: '0 10px 30px rgba(217,119,6,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', color: '#92400E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  BookCoin Exchange Price
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Coins size={26} color="#D97706" style={{ fill: '#F59E0B' }} />
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#B45309', fontFamily: 'var(--font-serif)', lineHeight: '1' }}>
                    {book.coinPrice}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: '#92400E', fontWeight: '700' }}>BookCoins</span>
                </div>
              </div>

              {book.originalMrp > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Retail Value</span>
                  <div style={{ fontSize: '1rem', color: '#8CA393', textDecoration: 'line-through', fontWeight: '600' }}>₹{book.originalMrp}</div>
                  <div style={{ fontSize: '0.72rem', color: '#2D6A4F', fontWeight: '700' }}>100% Cash Free</div>
                </div>
              )}
            </div>

            {/* Balance status */}
            {currentUser && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: canAfford ? '#EAF5EE' : '#FEF2F2', border: canAfford ? '1px solid #A7D7B5' : '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '18px' }}>
                <span style={{ color: canAfford ? '#2D6A4F' : '#991B1B', fontWeight: '600' }}>
                  Your Balance: {bookCoins} BookCoins
                </span>
                <span style={{ fontSize: '0.78rem', color: canAfford ? '#2D6A4F' : '#991B1B', fontWeight: '700' }}>
                  {canAfford ? '✓ Sufficient' : `⚠️ Need ${book.coinPrice - bookCoins} more`}
                </span>
              </div>
            )}

            {/* Action button */}
            {book.status === 'redeemed' ? (
              <button disabled className="btn-secondary" style={{ width: '100%', padding: '14px', opacity: 0.6, cursor: 'not-allowed' }}>
                Already Claimed by a Student
              </button>
            ) : isOwnListing ? (
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-forest)', fontWeight: '600', padding: '8px' }}>
                This is your active listed book. Manage it in your Dashboard.
              </div>
            ) : !currentUser ? (
              <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }} onClick={() => onNavigate('auth')}>
                <span>Sign In to Redeem this Book</span>
              </button>
            ) : canAfford ? (
              <button className="btn-gold" style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }} onClick={() => onOpenRedeemModal(book)}>
                <Coins size={20} />
                <span>Redeem Book with {book.coinPrice} Coins</span>
              </button>
            ) : (
              <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }} onClick={() => onNavigate('list-book')}>
                <Coins size={18} />
                <span>List a Book to Earn {book.coinPrice - bookCoins} More Coins</span>
              </button>
            )}
          </div>

          {/* Campus Locker Location */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5ECE6', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Building2 size={18} color="var(--primary-forest)" />
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>Campus Locker Station</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>
              {book.campus} — {book.lockerLocation}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>Available for contactless 24/7 pickup via QR Pass.</span>
            </p>
          </div>

          {/* Seller Card */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5ECE6', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={book.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={book.seller?.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{book.seller?.name || 'Verified Student'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{book.seller?.college || book.campus}</div>
                <div style={{ fontSize: '0.75rem', color: '#2D6A4F', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} />
                  <span>★ {book.seller?.rating || 4.8} Trust Rating</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-forest)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
              Verified
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Seller Description & Notes</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {book.description || 'Academic textbook inspected and approved for exchange on BookLoop.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Similar Books Section ─────────────────────────────────── */}
      {similarBooks.length > 0 && (
        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #E2ECE4' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase' }}>
              Recommended for your course
            </span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '2px' }}>Similar Textbooks Available</h2>
          </div>
          <div className="grid-responsive-cards">
            {similarBooks.map((item) => (
              <BookCard key={item.id} book={item} onSelect={(id) => onSelectBook(id)} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .book-detail-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BookDetailPage;
