import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastHub from './components/ToastHub';
import RedeemModal from './components/RedeemModal';
import CampusHubModal from './components/CampusHubModal';

// Pages
import LandingPage    from './pages/LandingPage';
import BrowsePage     from './pages/BrowsePage';
import BookDetailPage from './pages/BookDetailPage';
import ListBookPage   from './pages/ListBookPage';
import DashboardPage  from './pages/DashboardPage';
import ProfilePage    from './pages/ProfilePage';
import CoinGuidePage  from './pages/CoinGuidePage';
import AuthPage       from './pages/AuthPage';

// Pages that require authentication
const PROTECTED_PAGES = ['dashboard', 'list-book', 'profile'];

const AppContent = () => {
  const [currentPage, setCurrentPage]       = useState('landing');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [redeemBookTarget, setRedeemBookTarget] = useState(null);
  const { activeModal, setActiveModal, currentUser, session, authLoading } = useApp();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedBookId]);

  // When user logs in and is on auth page, automatically switch to dashboard
  useEffect(() => {
    if ((currentUser || session) && currentPage === 'auth') {
      setCurrentPage('dashboard');
    }
  }, [currentUser, session, currentPage]);

  const navigateTo = (page, bookId = null) => {
    // Route guard: redirect unauthenticated users to auth
    if (PROTECTED_PAGES.includes(page) && !currentUser && !session) {
      setCurrentPage('auth');
      return;
    }
    if (bookId) {
      setSelectedBookId(bookId);
      setCurrentPage('book-detail');
    } else {
      setCurrentPage(page);
    }
  };

  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('book-detail');
  };

  const handleOpenRedeem = (book) => {
    setRedeemBookTarget(book);
  };

  // Show a full-screen loading spinner while we resolve the Supabase session
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-warm)',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid var(--primary-light)',
          borderTopColor: 'var(--primary-forest)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Loading BookLoop…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If user tries to access a protected page while not logged in, redirect to auth
  const activePage = PROTECTED_PAGES.includes(currentPage) && !currentUser && !session ? 'auth' : currentPage;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-warm)' }}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={(page) => navigateTo(page)}
      />

      {/* 2. Main Page Router */}
      <main style={{ flexGrow: 1 }}>
        {activePage === 'landing' && (
          <LandingPage
            onNavigate={(page) => navigateTo(page)}
            onSelectBook={handleSelectBook}
          />
        )}

        {activePage === 'browse' && (
          <BrowsePage
            onSelectBook={handleSelectBook}
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {activePage === 'book-detail' && (
          <BookDetailPage
            bookId={selectedBookId}
            onBack={() => navigateTo('browse')}
            onSelectBook={handleSelectBook}
            onOpenRedeemModal={handleOpenRedeem}
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {activePage === 'list-book' && (
          <ListBookPage
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            onNavigate={(page) => navigateTo(page)}
            onSelectBook={handleSelectBook}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            onNavigate={(page) => navigateTo(page)}
            onSelectBook={handleSelectBook}
          />
        )}

        {activePage === 'coin-guide' && (
          <CoinGuidePage
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage
            onNavigate={(page) => navigateTo(page)}
          />
        )}

        {/* 404 Fallback — unknown page, redirect to landing */}
        {!['landing','browse','book-detail','list-book','dashboard','profile','coin-guide','auth'].includes(activePage) && (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3.5rem' }}>📭</div>
            <h2 style={{ color: 'var(--primary-forest)', margin: 0 }}>Page not found</h2>
            <p style={{ color: 'var(--text-muted)' }}>This page doesn&apos;t exist.</p>
            <button id="not-found-go-home" className="btn-primary" onClick={() => navigateTo('landing')}>Go to Home</button>
          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={(page) => navigateTo(page)}
      />

      {/* 4. Global Modals */}
      {redeemBookTarget && (
        <RedeemModal
          book={redeemBookTarget}
          onClose={() => setRedeemBookTarget(null)}
          onGoToDashboard={() => navigateTo('dashboard')}
          onGoToListBook={() => navigateTo('list-book')}
        />
      )}

      {activeModal?.type === 'campusHub' && (
        <CampusHubModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 5. Floating Toast Notification Queue */}
      <ToastHub />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
