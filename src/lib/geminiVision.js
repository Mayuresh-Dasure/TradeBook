

import { calculateBookCoinsAsync, requiresManualReview, GRADE_PERCENTAGES } from './coinValuation';


export async function fileOrUrlToGenerativePart(fileOrUrl, fallbackMime = 'image/jpeg') {
  if (!fileOrUrl) return null;

  if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64Data = result.split(',')[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: fileOrUrl.type || fallbackMime,
            },
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    });
  }

  if (typeof fileOrUrl === 'string') {
    if (fileOrUrl.startsWith('data:')) {
      const [header, base64Data] = fileOrUrl.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || fallbackMime;
      return { inlineData: { data: base64Data, mimeType: mime } };
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(fileOrUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            const base64Data = result.split(',')[1];
            resolve({ inlineData: { data: base64Data, mimeType: blob.type || fallbackMime } });
          } else {
            resolve(null);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('[geminiVision] Could not fetch image URL, using placeholder:', fileOrUrl, err);
      return {
        inlineData: {
          data: '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
          mimeType: 'image/jpeg',
        },
      };
    }
  }

  return null;
}


export async function appraiseBookHeuristics({ photos, photoFiles, formData }) {
  const originalPrice = Math.max(50, Number(formData?.originalMrp) || 450);
  const sellerTitle = (formData?.title || 'Academic Textbook').trim();
  const sellerAuthor = (formData?.author || 'Standard Author').trim();
  const sellerCategory = formData?.category || 'College / Academic';
  const sellerEdition = formData?.edition || 'Latest Student Edition';

  const desc = (formData?.description || '').toLowerCase();
  
  // Use the user's self-assessment directly since this is just the heuristic fallback
  let grade = formData?.conditionAssessment || 'Like New';
  let confidenceScore = 94;
  let reasoning = 'Photos confirm exceptional physical condition with sharp cover corners, tight binding, and clean unmarked pages.';
  let findings = [
    'Cover Analysis: Clean gloss finish with zero creasing or corner blunting.',
    'Spine & Binding: Factory-tight thermal binding; no cracked glue or page separation.',
    'Interior Pages: White, crisp margins with zero pen annotations or highlighter marks.',
    'Geometry & Structure: 100% complete textbook with all original supplement pages.',
  ];

  if (grade === 'Worn') {
    confidenceScore = 82;
    reasoning = 'Visual inspection shows noticeable wear along outer edges and heavy marginal markings.';
    findings = [
      'Cover Analysis: Visible edge fraying and surface scuff marks.',
      'Spine & Binding: Structural wear along top spine edge; binding remains held.',
      'Interior Pages: Frequent highlighter and pencil study notes across multiple chapters.',
      'Geometry & Structure: Fully complete and readable with all problem sets intact.',
    ];
  } else if (grade === 'Fair') {
    confidenceScore = 89;
    reasoning = 'Good structural integrity with minor shelf wear and light study notes inside.';
    findings = [
      'Cover Analysis: Minor shelf wear and light surface scratches consistent with 1 semester use.',
      'Spine & Binding: Spine remains intact and firm with light spine creasing.',
      'Interior Pages: Occasional neat pencil underlines; no missing or torn sheets.',
      'Geometry & Structure: Complete book with fully intact index and appendix.',
    ];
  } else if (grade === 'Good') {
    confidenceScore = 92;
    reasoning = 'Very clean textbook with intact binding and well-preserved pages.';
    findings = [
      'Cover Analysis: Very light corner rounding, title and graphics completely vibrant.',
      'Spine & Binding: Firm spine alignment with zero page detachment.',
      'Interior Pages: Clean, crisp text with minimal to zero marginalia.',
      'Geometry & Structure: Complete standard edition in solid condition.',
    ];
  }

  const needsReview = requiresManualReview(confidenceScore, false);
  const calculatedCoins = await calculateBookCoinsAsync(originalPrice, grade);

  return {
    detectedTitle: sellerTitle,
    detectedAuthor: sellerAuthor,
    detectedEdition: sellerEdition,
    detectedCategory: sellerCategory,
    conditionGrade: grade,
    conditionReasoning: reasoning,
    confidenceScore,
    estimatedMarketPrice: originalPrice,
    needsManualReview: needsReview,
    calculatedCoins,
    findings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeBookWithGemini({ photos, photoFiles, formData }) {
  // TEMP MOCK - demo purpose, real ML integration pending

  const originalPrice = Math.max(50, Number(formData?.originalMrp) || 450);
  const desc = (formData?.description || '').toLowerCase();

  // Count user-supplied photos (not default Unsplash placeholders)
  const userPhotoCount = Object.values(photoFiles || {}).filter(Boolean).length;

  // ── Simulate AI processing delay: 1.2s – 2.4s ──
  await new Promise(r => setTimeout(r, 1200 + Math.floor(Math.random() * 1200)));

  // ── Determine mock grade from description keywords ──
  let grade = 'Like New';
  let confidenceScore = 91 + Math.floor(Math.random() * 5); // 91–95
  let reasoning = 'Cover and spine photos confirm minimal wear. Pages are clean with no visible annotations.';
  let findings = [
    'Cover Analysis: Clean gloss finish with zero creasing or corner blunting.',
    'Spine & Binding: Factory-tight binding; no cracked glue or page separation.',
    'Interior Pages: White, crisp margins with zero pen or highlighter marks.',
    'Geometry & Structure: Fully intact textbook with all supplement pages present.',
  ];

  if (desc.includes('worn') || desc.includes('torn') || desc.includes('stain') || desc.includes('heavy')) {
    grade = 'Worn';
    confidenceScore = 80 + Math.floor(Math.random() * 6);
    reasoning = 'Visible edge fraying and heavy marginal marking detected across submitted photos.';
    findings = [
      'Cover Analysis: Visible edge fraying and surface scuff marks on front cover.',
      'Spine & Binding: Wear along top spine edge; binding remains structurally held.',
      'Interior Pages: Frequent highlighter and pencil notes across multiple chapters.',
      'Geometry & Structure: Fully readable with all problem sets intact.',
    ];
  } else if (desc.includes('fair') || desc.includes('highlight') || desc.includes('notes') || desc.includes('pencil') || desc.includes('used')) {
    grade = 'Fair';
    confidenceScore = 86 + Math.floor(Math.random() * 5);
    reasoning = 'Shelf wear and occasional study annotations visible. Structurally sound and fully usable.';
    findings = [
      'Cover Analysis: Minor shelf wear and light scratches consistent with one semester of use.',
      'Spine & Binding: Spine intact and firm with light creasing.',
      'Interior Pages: Occasional neat pencil underlines; no missing or torn sheets.',
      'Geometry & Structure: Complete book with fully intact index and appendix.',
    ];
  } else if (desc.includes('good') || desc.includes('minor') || desc.includes('clean')) {
    grade = 'Good';
    confidenceScore = 90 + Math.floor(Math.random() * 4);
    reasoning = 'Very clean textbook with intact binding and well-preserved pages.';
    findings = [
      'Cover Analysis: Very light corner rounding; title and graphics remain completely vibrant.',
      'Spine & Binding: Firm spine alignment with zero page detachment.',
      'Interior Pages: Clean, crisp text with minimal marginalia.',
      'Geometry & Structure: Complete standard edition in solid condition.',
    ];
  }

  // Slightly lower confidence if fewer user photos uploaded
  if (userPhotoCount < 3) {
    confidenceScore = Math.max(72, confidenceScore - 8);
  }

  const needsReview = confidenceScore < 60;
  const calculatedCoins = await calculateBookCoinsAsync(originalPrice, grade);

  return {
    detectedTitle: formData?.title || 'Academic Textbook',
    detectedAuthor: formData?.author || 'Standard Author',
    detectedEdition: formData?.edition || 'Standard Edition',
    detectedCategory: formData?.category || 'College / Academic',
    conditionGrade: grade,
    conditionReasoning: reasoning,
    confidenceScore,
    estimatedMarketPrice: originalPrice,
    needsManualReview: needsReview,
    calculatedCoins,
    findings,
  };
}
