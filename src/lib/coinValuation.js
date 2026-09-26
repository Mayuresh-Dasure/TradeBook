/**
 * BookLoop Coin Valuation & Rule-based Grading Utilities
 * 
 * Rules:
 * - "Like New": 90% of entered original_price (no visible damage, no tears, tight spine)
 * - "Good": 70% of entered original_price (minor shelf wear/scuffing, clean pages)
 * - "Fair": 50% of entered original_price (visible wear, small tears, some notes/highlighting)
 * - "Worn": 25% of entered original_price (heavy wear, loose pages, heavy staining)
 * 
 * Coins are rounded to the nearest 5.
 */

export const GRADE_PERCENTAGES = {
  'Like New': 0.90,
  'Good':     0.70,
  'Fair':     0.50,
  'Worn':     0.25,
};

/**
 * Calculate BookCoins from original price and condition grade.
 * Rounded to nearest 5 coins.
 */
export function calculateBookCoins(originalPrice, conditionGrade) {
  const price = Math.max(0, Number(originalPrice) || 0);
  const percentage = GRADE_PERCENTAGES[conditionGrade] ?? 0.70;
  const rawCoins = price * percentage;
  // Round to nearest 5
  return Math.max(10, Math.round(rawCoins / 5) * 5);
}

/**
 * Calculate BookCoins asynchronously using the Fuzzy Valuation ML Engine.
 */
export async function calculateBookCoinsAsync(originalPrice, conditionGrade) {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/fuzzy-valuation`;
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conditionGrade,
          originalPrice
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.calculated_coins) {
          return result.data.calculated_coins;
        }
      }
    }
  } catch (err) {
    console.warn('[coinValuation] ML service valuation failed, falling back to static calculation.', err);
  }
  
  return calculateBookCoins(originalPrice, conditionGrade);
}

/**
 * Determine if a book listing requires manual review.
 * Triggered if confidence_score < 60 OR needs_manual_review is true.
 */
export function requiresManualReview(confidenceScore, needsManualReviewFlag) {
  const score = Number(confidenceScore) || 0;
  return score < 60 || Boolean(needsManualReviewFlag);
}
