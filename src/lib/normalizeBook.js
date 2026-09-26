/**
 * normalizeBook — maps Supabase snake_case DB rows to the camelCase shape
 * expected by BookCard, BookDetailPage, ConditionBadge etc.
 *
 * DB columns → Component fields
 *   subject_category   → category
 *   condition_grade    → conditionGrade
 *   coin_value         → coinPrice
 *   ai_confidence_score→ conditionScore
 *   original_price     → originalMrp
 *   front_photo_url    → images[0] / coverImage
 *   back_photo_url     → images[1]
 *   spine_photo_url    → images[2]
 *   inside_photo_url   → images[3]
 *   distance_photo_url → images[4]
 *   users.name         → seller.name
 *   users.campus_name  → campus / seller.college
 */

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80',
];

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

/**
 * Derive placeholder sub-scores from the overall ai_confidence_score so
 * BookDetailPage's 4-metric breakdown card has something to display.
 */
function deriveConditionBreakdown(score) {
  const s = Number(score) || 85;
  return {
    binding: `${Math.min(99, s + 3)}% Spine Integrity`,
    cover:   `${Math.min(99, s + 1)}% Cover Condition`,
    pages:   `${Math.min(99, s - 2)}% Page Cleanliness`,
    yellowing: s >= 90 ? '0% Pure White Stock' : s >= 75 ? 'Minimal yellowing' : 'Moderate aging',
  };
}

export function normalizeBook(row) {
  if (!row) return null;

  const seller = row.users || {};
  const images = [
    row.front_photo_url,
    row.back_photo_url,
    row.spine_photo_url,
    row.inside_photo_url,
    row.distance_photo_url,
  ].map((url, idx) => url || FALLBACK_IMAGES[idx]);

  return {
    // Identity
    id:             row.id,
    // Listing info
    title:          row.title,
    author:         row.author,
    category:       row.subject_category,
    edition:        row.edition_year,
    isbn:           row.isbn || '',
    description:    row.description || '',
    originalMrp:    row.original_price,
    coinPrice:      row.coin_value,
    conditionGrade: row.condition_grade,
    conditionScore: row.ai_confidence_score || 85,
    conditionBreakdown: deriveConditionBreakdown(row.ai_confidence_score),
    // Photos
    coverImage:     images[0],
    images,
    // Status / meta
    status:         row.status,
    dateListed:     row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recently',
    demandLevel:    'High',
    highlightTags:  ['AI Verified', 'Campus Drop-off'],
    // Campus & locker
    campus:         seller.campus_name || row.campus_name || 'Campus',
    lockerLocation: 'Central Library Smart Locker Point',
    // Seller
    seller: {
      id:        row.seller_id,
      name:      seller.name || 'Verified Student',
      college:   seller.campus_name || 'Campus',
      year:      'Student',
      rating:    seller.trust_score || 4.8,
      exchanges: 0,
      avatar:    seller.avatar_url || FALLBACK_AVATAR,
    },
  };
}

/**
 * Normalize a transactions DB row into the shape ProfilePage's Coin Ledger
 * already expects (type, category, description, amount, date, referenceId).
 */
export function normalizeTransaction(row) {
  if (!row) return null;
  const isCredit = row.transaction_type === 'credit';
  return {
    id:          row.id,
    type:        row.transaction_type,
    category:    isCredit ? 'Book Listed (AI Verified)' : 'Book Redeemed',
    description: row.description || (isCredit ? 'Listed textbook' : 'Claimed textbook'),
    amount:      isCredit ? row.coins_amount : -row.coins_amount,
    date:        row.transaction_date
      ? new Date(row.transaction_date).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : '',
    referenceId: row.reference_id || row.id?.slice(0, 8).toUpperCase(),
    status:      row.status || 'Completed',
  };
}
