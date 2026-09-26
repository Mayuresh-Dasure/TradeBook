import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  RefreshCw,
  PlusCircle,
  Loader,
} from 'lucide-react';
import BookCard from '../components/BookCard';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { normalizeBook } from '../lib/normalizeBook';

const CATEGORIES = [
  'All',
  'Computer Science',
  'JEE / Physics',
  'JEE / Chemistry',
  'Medical',
  'Engineering',
  'School / CBSE',
  'Economics / Management',
];

const CONDITIONS = ['All', 'Like New', 'Good', 'Fair', 'Worn'];
const CAMPUSES   = ['All', 'IIT Delhi', 'IIT Bombay', 'AIIMS Delhi', 'BITS Pilani', 'Delhi University', 'VIT Vellore'];

const BrowsePage = ({ onSelectBook, onNavigate }) => {
  const { globalSearchTerm, setGlobalSearchTerm, currentUser } = useApp();

  const [books, setBooks]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState(globalSearchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedCampus, setSelectedCampus] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy]                 = useState('recommended');

  // ─── Fetch available books from Supabase ───────────────────────────────────
  const fetchBooks = useCallback(async () => {
    setLoading(true);

    if (!supabase) {           // demo mode — no DB
      setBooks([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('books')
      .select('*, users(id, name, campus_name, trust_score, avatar_url)')
      .eq('status', 'available');

    // Server-side category filter
    if (selectedCategory !== 'All') {
      query = query.eq('subject_category', selectedCategory);
    }

    // Server-side condition filter
    if (selectedCondition !== 'All') {
      query = query.eq('condition_grade', selectedCondition);
    }

    // Server-side campus filter (via joined users table)
    if (selectedCampus !== 'All') {
      // We filter by users.campus_name; Supabase doesn't support filtering on
      // joined columns directly in .eq(), so we use a Postgres filter:
      query = query.filter('users.campus_name', 'eq', selectedCampus);
    }

    // Full-text search on title / author
    if (searchTerm.trim()) {
      const q = searchTerm.trim().replace(/'/g, "''");
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Browse fetch error:', error);
      setBooks([]);
    } else {
      const normalized = (data || []).map(normalizeBook).filter(Boolean);
      setBooks(normalized);
    }

    setLoading(false);
  }, [selectedCategory, selectedCondition, selectedCampus, searchTerm]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // ─── Client-side sort + price filter (applied on fetched subset) ───────────
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (selectedPriceRange === 'under150'  && book.coinPrice > 150)  return false;
        if (selectedPriceRange === '150-300'   && (book.coinPrice < 150 || book.coinPrice > 300)) return false;
        if (selectedPriceRange === 'above300'  && book.coinPrice < 300)  return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc')   return a.coinPrice - b.coinPrice;
        if (sortBy === 'price-desc')  return b.coinPrice - a.coinPrice;
        if (sortBy === 'condition')   return (b.conditionScore || 85) - (a.conditionScore || 85);
        if (sortBy === 'newest')      return new Date(b.dateListed) - new Date(a.dateListed);
        return 0;
      });
  }, [books, selectedPriceRange, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedCondition !== 'All' ||
    selectedCampus !== 'All' ||
    selectedPriceRange !== 'All' ||
    searchTerm.trim() !== '';

  const handleClearFilters = () => {
    setSearchTerm('');
    setGlobalSearchTerm('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedCampus('All');
    setSelectedPriceRange('All');
    setSortBy('recommended');
  };

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '80px' }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <span style={{
          fontSize: '0.8rem', fontWeight: '700',
          color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          Academic Marketplace
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '2.2rem', marginTop: '4px' }}>Browse Textbooks</h1>
          {currentUser && (
            <button
              className="btn-gold"
              onClick={() => onNavigate('list-book')}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <PlusCircle size={16} />
              <span>List a Book & Earn Coins</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        marginBottom: '20px',
        maxWidth: '620px'
      }}>
        <Search
          size={18}
          style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setGlobalSearchTerm(e.target.value); }}
          placeholder="Search by title, author, ISBN…"
          style={{
            width: '100%',
            padding: '13px 16px 13px 48px',
            borderRadius: '14px',
            border: '1.5px solid #D1DFD4',
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(22,36,28,0.05)',
            boxSizing: 'border-box',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setGlobalSearchTerm(''); }}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              padding: '4px', color: 'var(--text-muted)'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Category Chips ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: '600',
              backgroundColor: selectedCategory === cat ? 'var(--primary-forest)' : '#FFFFFF',
              color:           selectedCategory === cat ? '#FFFFFF' : 'var(--text-main)',
              border:          selectedCategory === cat ? '1.5px solid var(--primary-forest)' : '1.5px solid #D1DFD4',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Secondary Filters Row ────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          <SlidersHorizontal size={15} />
          <span style={{ fontWeight: '600' }}>Filters:</span>
        </div>

        {/* Condition */}
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '10px', border: '1.5px solid #D1DFD4', fontSize: '0.84rem', backgroundColor: '#FFFFFF', outline: 'none' }}
        >
          {CONDITIONS.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>)}
        </select>

        {/* Campus */}
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '10px', border: '1.5px solid #D1DFD4', fontSize: '0.84rem', backgroundColor: '#FFFFFF', outline: 'none' }}
        >
          {CAMPUSES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Campuses' : c}</option>)}
        </select>

        {/* Coin Range */}
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '10px', border: '1.5px solid #D1DFD4', fontSize: '0.84rem', backgroundColor: '#FFFFFF', outline: 'none' }}
        >
          <option value="All">Any Coin Price</option>
          <option value="under150">Under 150 Coins</option>
          <option value="150-300">150 – 300 Coins</option>
          <option value="above300">300+ Coins</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '10px', border: '1.5px solid #D1DFD4', fontSize: '0.84rem', backgroundColor: '#FFFFFF', outline: 'none' }}
        >
          <option value="recommended">Recommended</option>
          <option value="newest">Newest First</option>
          <option value="price-asc">Lowest Coins</option>
          <option value="price-desc">Highest Coins</option>
          <option value="condition">Best Condition</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '0.82rem', color: '#C8553D', fontWeight: '600',
              padding: '6px 12px', borderRadius: '9999px',
              border: '1px solid #FECACA', backgroundColor: '#FEF2F2'
            }}
          >
            <X size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* ── Results Count ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', fontSize: '0.88rem', color: 'var(--text-muted)'
      }}>
        <span>
          {loading ? 'Loading…' : `${filteredBooks.length} textbook${filteredBooks.length !== 1 ? 's' : ''} found`}
        </span>
        <button
          onClick={fetchBooks}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary-forest)', fontWeight: '600' }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Books Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', flexDirection: 'column', gap: '16px' }}>
          <Loader size={32} color="var(--primary-forest)" style={{ animation: 'spin 0.7s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching books from marketplace…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid-responsive-cards">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={(id) => onSelectBook(id)}
            />
          ))}
        </div>
      ) : (
        <div className="card-white" style={{ padding: '60px 24px', textAlign: 'center', borderRadius: '24px' }}>
          <BookOpen size={48} color="#C8CFC9" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
            {hasActiveFilters ? 'No books match your filters' : 'Marketplace is empty'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {hasActiveFilters
              ? 'Try adjusting your search term or removing some filters.'
              : 'Be the first to list an academic textbook and earn BookCoins!'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {hasActiveFilters && (
              <button className="btn-secondary" onClick={handleClearFilters}>
                <RefreshCw size={15} />
                <span>Clear Filters</span>
              </button>
            )}
            {currentUser && (
              <button className="btn-primary" onClick={() => onNavigate('list-book')}>
                <PlusCircle size={15} />
                <span>List a Book</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
