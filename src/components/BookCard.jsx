import React from 'react';
import { Coins, MapPin, ArrowRight } from 'lucide-react';
import ConditionBadge from './ConditionBadge';

const BookCard = ({ book, onSelect }) => {
  if (!book) return null;

  return (
    <div 
      className="card-white hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        cursor: 'pointer'
      }}
      onClick={() => onSelect && onSelect(book.id)}
    >
      {/* Top Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        backgroundColor: '#EBE5D8',
        overflow: 'hidden'
      }}>
        <img 
          src={book.coverImage || (book.images && book.images[0])} 
          alt={book.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="book-card-img"
          loading="lazy"
        />
        
        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          <span className="badge-pill badge-subject" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(235, 242, 237, 0.92)' }}>
            {book.category}
          </span>
          <ConditionBadge grade={book.conditionGrade} score={book.conditionScore} size="sm" />
        </div>

        {/* Redeemed Watermark if redeemed */}
        {book.status === 'redeemed' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(22, 36, 28, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '1.1rem',
            letterSpacing: '0.05em'
          }}>
            <span style={{
              border: '2px solid #FFFFFF',
              padding: '6px 16px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              Claimed / In Exchange
            </span>
          </div>
        )}

        {/* Pending Review Watermark */}
        {book.status === 'pending_review' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(113, 63, 18, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FEF08A',
            fontWeight: '700',
            fontSize: '0.95rem',
            letterSpacing: '0.04em'
          }}>
            <span style={{
              border: '2px solid #FEF08A',
              padding: '6px 16px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              Under Manual Review
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{
          fontSize: '1.08rem',
          lineHeight: '1.35',
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.7em',
          fontWeight: '700'
        }}>
          {book.title}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          by {book.author}
        </p>

        {/* Campus & Locker location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: 'var(--primary-forest)',
          backgroundColor: 'var(--primary-light)',
          padding: '6px 10px',
          borderRadius: '8px',
          marginBottom: '16px',
          marginTop: 'auto'
        }}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>
            {book.campus} • {book.lockerLocation ? book.lockerLocation.split('-')[0].trim() : 'Library Hub'}
          </span>
        </div>

        {/* Bottom Price & Action Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #EEF2EE'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Coins size={17} color="#D97706" style={{ fill: '#FEF3C7' }} />
              <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#B45309' }}>
                {book.coinPrice}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Coins
              </span>
            </div>
            {book.originalMrp && (
              <span style={{ fontSize: '0.74rem', color: '#99A89D', textDecoration: 'line-through' }}>
                MRP ₹{book.originalMrp}
              </span>
            )}
          </div>

          <button 
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              borderRadius: '9999px',
              boxShadow: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(book.id);
            }}
          >
            <span>View</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
