
import { requiresManualReview } from './coinValuation';
import { analyzeBookWithGemini, appraiseBookHeuristics } from './geminiVision';

const VALID_GRADES = ['Like New', 'Good', 'Fair', 'Worn'];

/**
 * Call the Appraisal Pipeline.
 *
 * Tier 1: Real Gemini Vision API (if VITE_GEMINI_API_KEY is set)
 * Tier 2: Heuristic fallback engine (if no API key)
 *
 * @param {Object} params
 * @param {Object} [params.photoFiles]  - Map of slot -> File object
 * @param {Object} [params.photos]      - Map of slot -> preview URL or data URI
 * @param {string} params.title         - Book title
 * @param {number} params.originalPrice - Book MRP entered by seller
 * @param {Object} [params.formData]    - Additional metadata (author, category, edition, etc.)
 * @returns {Promise<Object>} Normalised appraisal result with calculatedCoins & findings
 */
export async function callAppraisalEdgeFunction({ photoFiles = {}, photos = {}, photoUrls, title, originalPrice, formData = {} }) {
  const mergedFormData = {
    title: title || formData.title || 'Academic Textbook',
    author: formData.author || 'Standard Author',
    category: formData.category || 'Academic',
    edition: formData.edition || 'Student Edition',
    originalMrp: Number(originalPrice || formData.originalMrp) || 450,
    description: formData.description || '',
    conditionAssessment: formData.conditionAssessment || 'Like New',
  };

  const directApiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  if (directApiKey) {
    // Tier 1: Real Gemini Vision API — retry up to 2 times on 503 overload
    console.log('[bookAppraisal] Tier 1: Calling real Gemini Vision API...');
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const directResult = await analyzeBookWithGemini({
          photos,
          photoFiles,
          formData: mergedFormData,
          apiKey: directApiKey,
        });
        console.log('[bookAppraisal] Tier 1 Gemini Vision succeeded!');
        return directResult;
      } catch (err) {
        const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('overloaded');
        if (is503 && attempt < MAX_RETRIES) {
          console.warn(`[bookAppraisal] Gemini busy (503), retrying in 2s... (attempt ${attempt}/${MAX_RETRIES})`);
          await new Promise(r => setTimeout(r, 2000));
        } else if (is503) {
          // Gemini is overloaded — fall back to heuristic silently
          console.warn('[bookAppraisal] Gemini overloaded after retries, using heuristic fallback.');
          break;
        } else {
          // Any other error (bad key, CORS, etc.) — throw it to the UI
          throw err;
        }
      }
    }
  }

  // Tier 2: Heuristic engine (no API key configured)
  console.log('[bookAppraisal] No API key found. Using Tier 2: Heuristic Engine...');
  await new Promise(r => setTimeout(r, 600));

  const heuristicResult = await appraiseBookHeuristics({
    photos,
    photoFiles,
    formData: mergedFormData,
  });

  return heuristicResult;
}
