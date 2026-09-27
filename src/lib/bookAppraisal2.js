
import { requiresManualReview  from './coinValuation';
import { analyzeBookWithGemini, appraiseBookHeuristics, fileOrUrlToGenerativePart  from './geminiVision';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL/functions/v1/analyze-book` : null;

const VALID_GRADES = ['Like New', 'Good', 'Fair', 'Worn'];
const EDGE_FUNCTION_TIMEOUT_MS = 8_000;

function validateAppraisalResult(data) {
  if (!data || typeof data !== 'object') return false;
  const r = data;
  if (typeof r.detected_title !== 'string') return false;
  if (typeof r.detected_author !== 'string') return false;
  if (!VALID_GRADES.includes(r.condition_grade)) return false;
  if (typeof r.condition_reasoning !== 'string') return false;
  if (typeof r.confidence_score !== 'number') return false;
  return true;


/**
 * Call the Appraisal Pipeline.
 *
 * TEMP MOCK - demo purpose, real ML integration pending
 * In demo mode, Tier 1 (Gemini direct) and Tier 2 (Supabase Edge Function)
 * are skipped. All calls fall through to Tier 3 heuristic engine.
 *
 * @param {Object params
 * @param {Object [params.photoFiles]  - Map of slot -> File object
 * @param {Object [params.photos]      - Map of slot -> preview URL or data URI
 * @param {string params.title         - Book title
 * @param {number params.originalPrice - Book MRP entered by seller
 * @param {Object [params.formData]    - Additional metadata (author, category, edition, etc.)
 * @returns {Promise<Object> Normalised appraisal result with calculatedCoins & findings
 */
export async function callAppraisalEdgeFunction({ photoFiles = {, photos = {, photoUrls, title, originalPrice, formData = { ) {
  const SLOTS = ['front', 'back', 'spine', 'pages', 'distance'];
  const mergedFormData = {
    title: title || formData.title || 'Academic Textbook',
    author: formData.author || 'Standard Author',
    category: formData.category || 'Academic',
    edition: formData.edition || 'Student Edition',
    originalMrp: Number(originalPrice || formData.originalMrp) || 450,
    description: formData.description || '',
  ;

  const directApiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (directApiKey) {
    
      console.log('[bookAppraisal] Attempting Tier 1: Direct Gemini Vision API…');
      const directResult = await analyzeBookWithGemini({
        photos,
        photoFiles,
        formData: mergedFormData,
        apiKey: directApiKey,
      );
      console.log('[bookAppraisal] Tier 1 Direct Gemini Vision succeeded!');
      return directResult;
    
      console.warn('[bookAppraisal] Tier 1 Direct Gemini failed, falling back:', directErr.message);
    
  
  // ── Tier 3: Intelligent Campus Vision Appraisal Engine 
  console.log('[bookAppraisal] Engaging Tier 3: Intelligent Campus Vision Appraisal Engine…');
  await new Promise(r => setTimeout(r, 600)); // Realistic inspection sensation

  const heuristicResult = await appraiseBookHeuristics({
    photos,
    photoFiles,
    formData: mergedFormData,
  );

  return heuristicResult;

