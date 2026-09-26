import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CAMPUS_HUBS } from '../data/mockBooks';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── Auth & User ───────────────────────────────────────────────────────────
  const [session, setSession]         = useState(null);        // supabase session
  const [currentUser, setCurrentUser] = useState(null);        // { id, name, email, campus_name, bookcoin_balance, trust_score, ... }
  const [authLoading, setAuthLoading] = useState(true);        // true until first session resolved

  // ─── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts]         = useState([]);

  // ─── Modal ─────────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState(null);

  // ─── Global filters (shared between Navbar → BrowsePage) ──────────────────
  const [globalSearchTerm, setGlobalSearchTerm]   = useState('');
  const [selectedCategory, setSelectedCategory]   = useState('All');

  // ─── Toast helpers ─────────────────────────────────────────────────────────
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', subtext = '', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { id, message, type, subtext };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  // ─── Resolve user profile from public.users with self-healing fallback ────
  const resolveUserProfile = useCallback(async (authUser) => {
    if (!authUser || !supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile && !error) {
        return profile;
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    }

    // Self-healing: if public.users row is missing, construct and upsert it
    const fallbackProfile = {
      id:               authUser.id,
      name:             authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Student',
      email:            authUser.email || '',
      campus_name:      authUser.user_metadata?.campus_name || 'Campus',
      trust_score:      0,
      bookcoin_balance: 0,
    };

    try {
      const { data: created } = await supabase
        .from('users')
        .upsert(fallbackProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (created) return created;
    } catch (err) {
      console.warn('Profile auto-create warning:', err);
    }

    return fallbackProfile;
  }, []);

  // ─── Auth state — listen once on mount ─────────────────────────────────────
  useEffect(() => {
    // Demo mode: no Supabase client — skip auth entirely
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const profile = await resolveUserProfile(s.user);
        setCurrentUser(profile);
      }
      setAuthLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          const profile = await resolveUserProfile(s.user);
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [resolveUserProfile]);

  // ─── Refresh balance from DB (called after coin operations) ────────────────
  const refreshBalance = useCallback(async () => {
    if (!currentUser?.id || !supabase) return;
    const { data } = await supabase
      .from('users')
      .select('bookcoin_balance, trust_score')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (data) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
  }, [currentUser?.id]);

  // ─── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = async (email, password, name, campusName) => {
    if (!supabase) {
      addToast('Demo mode — Supabase not configured.', 'error', 'Copy .env.example → .env and add your credentials.');
      return { success: false, error: 'Demo mode' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          campus_name: campusName,
        },
      },
    });
    if (error) return { success: false, error: error.message };

    // Insert or upsert public profile row
    if (data?.user) {
      const profile = await resolveUserProfile(data.user);
      if (data.session) {
        setSession(data.session);
        setCurrentUser(profile);
      }
    }

    addToast(`Welcome to BookLoop, ${name}!`, 'success', `Registered at ${campusName}.`);
    return { success: true, session: data?.session };
  };

  // ─── Sign In ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (!supabase) {
      addToast('Demo mode — Supabase not configured.', 'error', 'Copy .env.example → .env and add your credentials.');
      return { success: false, error: 'Demo mode' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Email not confirmed. Please disable "Confirm email" in your Supabase Dashboard (Authentication -> Providers -> Email) or run the SQL update in SQL Editor.',
        };
      }
      return { success: false, error: error.message };
    }

    // Immediately resolve and set user profile so routing succeeds synchronously
    if (data?.user) {
      setSession(data.session);
      const profile = await resolveUserProfile(data.user);
      setCurrentUser(profile);
    }

    addToast('Welcome back!', 'success', 'Signed in to your BookLoop account.');
    return { success: true, user: data?.user };
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    addToast('Signed out successfully', 'info');
  };

  // ─── List a New Book ───────────────────────────────────────────────────────
  // bookData must contain:
  //   title, author, category, edition, originalMrp, isbn, description,
  //   detectedGrade, detectedScore, calculatedCoins,
  //   photoUrls: { front, back, spine, inside, distance }
  const listNewBook = async (bookData) => {
    if (!currentUser?.id) {
      addToast('You must be signed in to list a book', 'error');
      return { success: false };
    }
    if (!supabase) {
      addToast('Demo mode — cannot save listings without Supabase.', 'error');
      return { success: false, error: 'Demo mode' };
    }

    const earnedCoins = Number(bookData.calculatedCoins) || Math.round(Number(bookData.originalMrp) * 0.70);
    const isPendingReview = Boolean(bookData.needsManualReview) || (Number(bookData.detectedScore) < 60);
    const bookStatus = isPendingReview ? 'pending_review' : 'available';

    // 1. Insert book row
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        seller_id:          currentUser.id,
        title:              bookData.title,
        author:             bookData.author,
        subject_category:   bookData.category || 'General Academic',
        edition_year:       bookData.edition || '',
        isbn:               bookData.isbn || '',
        description:        bookData.description || bookData.conditionReasoning || '',
        original_price:     Number(bookData.originalMrp) || 0,
        condition_grade:    bookData.detectedGrade || 'Good',
        coin_value:         earnedCoins,
        ai_confidence_score: Number(bookData.detectedScore) || 85,
        front_photo_url:    bookData.photoUrls?.front    || bookData.images?.[0] || null,
        back_photo_url:     bookData.photoUrls?.back     || bookData.images?.[1] || null,
        spine_photo_url:    bookData.photoUrls?.spine    || bookData.images?.[2] || null,
        inside_photo_url:   bookData.photoUrls?.inside   || bookData.images?.[3] || null,
        distance_photo_url: bookData.photoUrls?.distance || bookData.images?.[4] || null,
        status:             bookStatus,
      })
      .select()
      .single();

    if (bookError) {
      console.error('Insert book error:', bookError);
      addToast('Failed to list book. Please try again.', 'error', bookError.message);
      return { success: false, error: bookError.message };
    }

    // 2. If pending review, do not credit coins immediately
    if (isPendingReview) {
      addToast(
        'Listing Submitted for Review',
        'info',
        'Our team will verify your listing before crediting BookCoins.'
      );
      return { success: true, book, pendingReview: true, earnedCoins };
    }

    // 3. Auto-approved: increment user balance
    const newBalance = (currentUser.bookcoin_balance || 0) + earnedCoins;
    const { error: balanceError } = await supabase
      .from('users')
      .update({ bookcoin_balance: newBalance })
      .eq('id', currentUser.id);

    if (balanceError) console.error('Balance update error:', balanceError);

    // 4. Insert credit transaction
    await supabase.from('transactions').insert({
      book_id:          book.id,
      seller_id:        currentUser.id,
      buyer_id:         null,
      transaction_type: 'credit',
      coins_amount:     earnedCoins,
      description:      `Listed '${bookData.title}' (AI Verified - ${bookData.detectedGrade})`,
      reference_id:     `LST-${book.id.slice(0, 8).toUpperCase()}`,
      status:           'completed',
    });

    // 5. Update local state
    setCurrentUser((prev) => ({ ...prev, bookcoin_balance: newBalance }));

    // 6. Toast
    addToast(
      `+${earnedCoins} BookCoins Credited!`,
      'coin',
      `'${bookData.title}' is now live on the marketplace.`
    );

    return { success: true, book, pendingReview: false, earnedCoins };
  };

  // ─── Redeem a Book ─────────────────────────────────────────────────────────
  // Returns { success, redemption } or { success: false, reason }
  const redeemBook = async (bookId, bookCoinPrice, preferredHub, bookTitle) => {
    if (!currentUser?.id) {
      addToast('You must be signed in to redeem a book', 'error');
      return { success: false, reason: 'unauthenticated' };
    }
    if (!supabase) {
      addToast('Demo mode — cannot redeem without Supabase.', 'error');
      return { success: false, reason: 'demo_mode' };
    }

    const currentBalance = currentUser.bookcoin_balance || 0;

    if (bookCoinPrice > currentBalance) {
      addToast(
        'Insufficient BookCoins Balance',
        'warning',
        `You need ${bookCoinPrice} coins. Current balance: ${currentBalance} coins.`
      );
      return { success: false, reason: 'insufficient_funds' };
    }

    // 1. Get the book to find seller_id
    const { data: bookRow, error: fetchError } = await supabase
      .from('books')
      .select('seller_id, status, title')
      .eq('id', bookId)
      .single();

    if (fetchError || !bookRow) {
      addToast('Book not found', 'error');
      return { success: false, reason: 'not_found' };
    }
    if (bookRow.status === 'redeemed') {
      addToast('This book has already been claimed', 'warning');
      return { success: false, reason: 'already_redeemed' };
    }

    // 2. Mark book as redeemed
    const { error: statusError } = await supabase
      .from('books')
      .update({ status: 'redeemed' })
      .eq('id', bookId);

    if (statusError) {
      addToast('Redemption failed. Please try again.', 'error');
      return { success: false, reason: 'update_failed' };
    }

    // 3. Deduct buyer balance
    const newBalance = currentBalance - bookCoinPrice;
    await supabase
      .from('users')
      .update({ bookcoin_balance: newBalance })
      .eq('id', currentUser.id);

    // 4. Insert debit transaction
    await supabase.from('transactions').insert({
      book_id:          bookId,
      buyer_id:         currentUser.id,
      seller_id:        bookRow.seller_id,
      transaction_type: 'debit',
      coins_amount:     bookCoinPrice,
      description:      `Claimed '${bookTitle || bookRow.title}'`,
      reference_id:     `RDM-${bookId.slice(0, 8).toUpperCase()}`,
      status:           'completed',
    });

    // 5. Update local balance
    setCurrentUser((prev) => ({ ...prev, bookcoin_balance: newBalance }));

    // 6. Generate cosmetic PIN pass (locker system is future scope)
    const pickupPin = `BL-${Math.floor(1000 + Math.random() * 9000)}`;
    const chosenHub = preferredHub || 'Central Library Smart Locker - Box #07';
    const redemptionRecord = {
      id:              `rdm-${bookId}`,
      book:            { title: bookTitle || bookRow.title, id: bookId },
      redeemedDate:    new Date().toLocaleString('en-IN'),
      pickupLockerHub: chosenHub,
      pickupPin,
      qrData:          `BOOKLOOP:${currentUser.campus_name}:${pickupPin}`,
      status:          'Ready for Pickup',
      expiresIn:       '48 hours remaining',
    };

    addToast(
      `Redeemed '${bookTitle || bookRow.title}'!`,
      'success',
      `Locker PIN: ${pickupPin} — collect within 48 hours.`
    );

    return { success: true, redemption: redemptionRecord };
  };

  // ─── Eco metrics (computed from real user data) ────────────────────────────
  const bookCoins = currentUser?.bookcoin_balance ?? 0;

  const ecoMetrics = {
    moneySaved:         42850 + bookCoins * 2,
    carbonSavedKg:      (84.5).toFixed(1),
    treesPreserved:     7,
    exchangesCompleted: 12480,
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        session,
        currentUser,
        authLoading,
        signUp,
        login,
        logout,
        refreshBalance,
        // Wallet (convenience alias from currentUser)
        bookCoins,
        // Actions
        listNewBook,
        redeemBook,
        // Toasts
        toasts,
        addToast,
        removeToast,
        // Modal
        activeModal,
        setActiveModal,
        // Search / Filters
        globalSearchTerm,
        setGlobalSearchTerm,
        selectedCategory,
        setSelectedCategory,
        // Static data
        ecoMetrics,
        campusHubs: CAMPUS_HUBS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
