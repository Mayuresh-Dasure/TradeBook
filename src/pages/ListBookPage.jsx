import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Coins,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  RefreshCw,
  Upload,
  Loader,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Info,
  Clock,
  SkipForward,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import ConditionBadge from '../components/ConditionBadge';
import { supabase } from '../lib/supabase';
import { callAppraisalEdgeFunction } from '../lib/bookAppraisal';
import { compressImageFile } from '../lib/imageCompressor';
import { GRADE_PERCENTAGES } from '../lib/coinValuation';

const PHOTO_STEPS = [
  { id: 'front', label: '1. Front Cover', desc: 'Captures title and cover cleanliness', defaultImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80' },
  { id: 'back', label: '2. Back Cover', desc: 'Captures barcode and publisher information', defaultImg: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80' },
  { id: 'spine', label: '3. Spine & Binding', desc: 'Evaluates binding tightness & glue integrity', defaultImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80' },
  { id: 'pages', label: '4. Sample Inside Page', desc: 'Inspects highlighter marks, marginalia & yellowing', defaultImg: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80' },
  { id: 'distance', label: '5. Full Distance View', desc: 'Confirms overall shape, corners & edge condition', defaultImg: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80' }
];

const ListBookPage = ({ onNavigate }) => {
  const { listNewBook, currentUser, addToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Photos, 3: AI Review, 4: Celebration

  // Step 1: Form Details
  const [formData, setFormData] = useState({
    title: "Concepts of Physics (Vol 1)",
    author: "Dr. H.C. Verma",
    category: "JEE / Physics",
    edition: "2024 Revised Edition",
    originalMrp: "450",
    conditionAssessment: "Like New",
    courseCode: "JEE-PHY",
    isbn: "978-8177091878",
    description: "Pristine condition textbook. Used briefly during semester prep. Zero pen or highlighter marks."
  });

  // Step 2: 5 Photos — preview URLs (data: or Unsplash fallback)
  const [photos, setPhotos] = useState({
    front: PHOTO_STEPS[0].defaultImg,
    back: PHOTO_STEPS[1].defaultImg,
    spine: PHOTO_STEPS[2].defaultImg,
    pages: PHOTO_STEPS[3].defaultImg,
    distance: PHOTO_STEPS[4].defaultImg,
  });
  // Actual File objects for upload
  const [photoFiles, setPhotoFiles] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Refs for hidden file inputs
  const fileInputRefs = {
    front: useRef(null),
    back: useRef(null),
    spine: useRef(null),
    pages: useRef(null),
    distance: useRef(null),
  };

  const handlePhotoSelect = (slotId) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress to max 1024px / JPEG 80% before storing
    let compressedFile;
    try {
      compressedFile = await compressImageFile(file);
    } catch {
      compressedFile = file; // fallback to original on canvas error
    }
    const previewUrl = URL.createObjectURL(compressedFile);
    setPhotos((prev) => ({ ...prev, [slotId]: previewUrl }));
    setPhotoFiles((prev) => ({ ...prev, [slotId]: compressedFile }));
  };

  // ── Step 3: AI Appraisal State ───────────────────────────────────────────
  const [scanProgress, setScanProgress]   = useState(0);
  const [scanPhase,    setScanPhase]       = useState('');
  const [aiLoading,    setAiLoading]       = useState(false);
  const [aiError,      setAiError]         = useState(null);
  const [attemptCount, setAttemptCount]    = useState(0); // track retries (max 2)
  const [isPendingReview,   setIsPendingReview]   = useState(false);
  const [finalEarnedCoins,  setFinalEarnedCoins]  = useState(0);
  // Strictly null until a valid appraisal completes
  const [aiResult, setAiResult] = useState(null);

  // ── Phase-driven progress animation ──────────────────────────────────────
  // Phases are tied to real work milestones:
  //  0% → 20%: Uploading compressed photos to Supabase Storage
  // 20% → 60%: AI Edge Function call in flight
  // 60% → 85%: Parsing + coin calculation
  // 85% → 100%: Done

  const executeAiInspection = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setScanProgress(5);
    setScanPhase('Preparing photos for AI inspection…');

    // Soft progress ticker — ensures bar always moves forward during the call
    const progressTicks = [
      { delay: 800,  pct: 20, label: 'Uploading compressed photos to secure storage…' },
      { delay: 3000, pct: 40, label: 'Sending to Gemini Vision AI…' },
      { delay: 6000, pct: 58, label: 'Analysing cover, spine & binding integrity…' },
      { delay: 9000, pct: 72, label: 'Inspecting pages, annotations & paper tone…' },
      { delay: 12000, pct: 84, label: 'Calculating BookCoin valuation…' },
      // Cap at 84 — final 100 only fires on real success
    ];
    const timers = progressTicks.map(({ delay, pct, label }) =>
      setTimeout(() => {
        setScanProgress(p => Math.max(p, pct));
        setScanPhase(label);
      }, delay)
    );
    const clearTimers = () => timers.forEach(clearTimeout);

    try {
      // ── Phase 1: Upload photos to Supabase Storage first ──────────────────
      const slots = ['front', 'back', 'spine', 'pages', 'distance'];
      const slotToDbKey = { front: 'front', back: 'back', spine: 'spine', pages: 'inside', distance: 'distance' };
      const uploadedUrls = {};

      for (const slot of slots) {
        const file = photoFiles[slot];
        if (file && currentUser?.id && supabase) {
          const path = `${currentUser.id}/${Date.now()}-${slot}.jpg`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('book-photos')
            .upload(path, file, { upsert: true, contentType: 'image/jpeg' });
          if (uploadErr) {
            console.warn(`[ListBookPage] Upload failed for ${slot}:`, uploadErr.message);
            uploadedUrls[slotToDbKey[slot]] = photos[slot];
          } else {
            const { data: pub } = supabase.storage.from('book-photos').getPublicUrl(uploadData.path);
            uploadedUrls[slotToDbKey[slot]] = pub.publicUrl;
          }
        } else {
          uploadedUrls[slotToDbKey[slot]] = photos[slot];
        }
      }

      // Collect non-placeholder URLs for the Edge Function
      const publicPhotoUrls = Object.values(uploadedUrls).filter(Boolean);

      setScanProgress(22);
      setScanPhase('Sending to Gemini Vision AI…');

      // ── Phase 2: Call secure Edge Function / Hybrid Vision Pipeline ─────
      const analysis = await callAppraisalEdgeFunction({
        photoFiles,
        photos,
        title: formData.title,
        originalPrice: Number(formData.originalMrp) || 500,
        formData,
      });

      clearTimers();
      setScanProgress(90);
      setScanPhase('Calculating BookCoin valuation…');

      // Small UX pause so user sees 90% before jumping to 100%
      await new Promise(r => setTimeout(r, 400));

      setScanProgress(100);
      setScanPhase('AI appraisal complete! ✓');

      setAiResult({
        detectedTitle:      analysis.detectedTitle,
        detectedAuthor:     analysis.detectedAuthor,
        detectedEdition:    analysis.detectedEdition,
        detectedCategory:   analysis.detectedCategory,
        detectedGrade:      analysis.conditionGrade,
        detectedScore:      analysis.confidenceScore,
        confidence:         `${analysis.confidenceScore}%`,
        conditionReasoning: analysis.conditionReasoning,
        needsManualReview:  analysis.needsManualReview,
        calculatedCoins:    analysis.calculatedCoins,
        findings:           analysis.findings || [],
        // Store the final uploaded URLs so handleFinalConfirm can reuse them
        _uploadedUrls:      uploadedUrls,
      });

      // Auto-fill empty seller fields with OCR detections
      setFormData(prev => ({
        ...prev,
        title:   prev.title  || analysis.detectedTitle,
        author:  prev.author || analysis.detectedAuthor,
        edition: prev.edition || analysis.detectedEdition,
      }));

      addToast(
        `AI Appraisal: ${analysis.conditionGrade} (${analysis.calculatedCoins} Coins)`,
        'success'
      );
    } catch (err) {
      clearTimers();
      console.error('[ListBookPage] AI appraisal error:', err);
      setScanProgress(0);
      setScanPhase('');
      setAttemptCount(c => c + 1);
      const isTimeout = err.message?.toLowerCase().includes('taking longer');
      setAiError(
        isTimeout
          ? 'Appraisal is taking longer than expected. Check your connection and try again.'
          : (err.message || 'Inspection failed. Please retry or re-upload clearer photos.')
      );
    } finally {
      setAiLoading(false);
    }
  }, [photos, photoFiles, formData, currentUser, addToast]);

  // Quick form fill (no preset images / mock data)
  const handleQuickFill = () => {
    setFormData({
      title: 'Concepts of Physics (Vol 1)',
      author: 'Dr. H.C. Verma',
      category: 'JEE / Physics',
      edition: '2024 Revised Edition',
      originalMrp: '450',
      courseCode: 'JEE-PHY',
      isbn: '978-817709' + Math.floor(1000 + Math.random() * 9000),
      description: 'Verified condition textbook. Inspected by BookLoop AI.',
    });
    addToast('Quick fill applied — upload your 5 photos to continue.', 'info');
  };

  // Trigger appraisal when entering Step 3, reset attempt counter on fresh entry
  useEffect(() => {
    if (currentStep === 3) {
      setAttemptCount(0);
      executeAiInspection();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Skip AI fallback — seller opts into manual review ───────────────────
  const handleSkipToManualReview = () => {
    setAiError(null);
    setAiLoading(false);
    // Create a synthetic result with null grade → pending_review
    setAiResult({
      detectedTitle:      formData.title,
      detectedAuthor:     formData.author,
      detectedEdition:    formData.edition,
      detectedCategory:   formData.category,
      detectedGrade:      null,
      detectedScore:      0,
      confidence:         'N/A',
      conditionReasoning: 'AI inspection skipped — submitted for manual review.',
      needsManualReview:  true,
      calculatedCoins:    0,
      _uploadedUrls:      {},
    });
    setScanProgress(100);
    setScanPhase('Submitted for manual review.');
    addToast('Your listing will be reviewed by our team before coins are credited.', 'info');
  };

  // ── Step 4: Insert book (photos already uploaded during AI step) ─────────
  const handleFinalConfirm = async () => {
    if (!aiResult) {
      addToast('AI condition appraisal must complete before publishing.', 'error');
      return;
    }
    setUploadingPhotos(true);

    // Reuse URLs captured during the appraisal upload step
    // If skipped/manual, fall back to preview URLs
    const photoUrls = aiResult._uploadedUrls || {};
    const slots = ['front', 'back', 'spine', 'pages', 'distance'];
    const slotToDbKey = { front: 'front', back: 'back', spine: 'spine', pages: 'inside', distance: 'distance' };
    for (const slot of slots) {
      if (!photoUrls[slotToDbKey[slot]]) {
        photoUrls[slotToDbKey[slot]] = photos[slot];
      }
    }

    const result = await listNewBook({
      title:              formData.title || aiResult.detectedTitle,
      author:             formData.author || aiResult.detectedAuthor,
      category:           formData.category || aiResult.detectedCategory,
      edition:            formData.edition || aiResult.detectedEdition,
      originalMrp:        Number(formData.originalMrp) || 500,
      isbn:               formData.isbn,
      description:        formData.description || aiResult.conditionReasoning,
      detectedGrade:      aiResult.detectedGrade,
      detectedScore:      aiResult.detectedScore,
      calculatedCoins:    aiResult.calculatedCoins,
      conditionReasoning: aiResult.conditionReasoning,
      needsManualReview:  aiResult.needsManualReview,
      photoUrls,
    });

    setUploadingPhotos(false);

    if (!result.success) return;

    setIsPendingReview(Boolean(result.pendingReview));
    setFinalEarnedCoins(result.earnedCoins || aiResult.calculatedCoins || 0);
    setCurrentStep(4);

    if (!result.pendingReview) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#3F6248', '#D97706', '#10B981', '#F59E0B'] });
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
      {/* Top Wizard Steps Indicator */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI-Assisted Listing Wizard
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '4px' }}>
            List a Book & Earn BookCoins
          </h1>
        </div>

        {/* 4-Step Progress Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          position: 'relative'
        }}>
          {[
            { num: 1, label: "Book Details" },
            { num: 2, label: "5-Photo Upload" },
            { num: 3, label: "AI Appraisal" },
            { num: 4, label: "Earn Coins" }
          ].map((s) => (
            <div 
              key={s.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: currentStep === s.num 
                  ? 'var(--primary-forest)' 
                  : currentStep > s.num 
                  ? '#2D6A4F' 
                  : '#E5EDE7',
                color: currentStep >= s.num ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: currentStep === s.num ? '0 4px 12px rgba(63, 98, 72, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {currentStep > s.num ? <Check size={18} /> : s.num}
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: currentStep === s.num ? '700' : '500',
                color: currentStep === s.num ? 'var(--primary-forest)' : 'var(--text-muted)',
                textAlign: 'center'
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= STEP 1: BOOK DETAILS ================= */}
      {currentStep === 1 && (
        <div className="card-white" style={{
          padding: '36px',
          borderRadius: '24px',
          border: '1.5px solid #DCE6DF',
          boxShadow: '0 12px 36px rgba(22, 36, 28, 0.06)'
        }}>
          {/* Quick Fill Banner */}
          <div style={{
            backgroundColor: '#F3F8F4',
            border: '1px solid #D1E5D6',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-forest)' }}>⚡ Quick Form Fill</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Auto-populate a sample book to test the listing flow.</div>
            </div>
            <button
              onClick={handleQuickFill}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #C4D9C8',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={13} color="#D97706" />
              <span>Fill Sample Data</span>
            </button>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
            Enter Textbook Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-grid">
            {/* Title */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Textbook Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Introduction to Algorithms (CLRS)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Author */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Author(s) *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Cormen, Leiserson, Rivest"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Discipline / Subject Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="JEE / Physics">JEE / Physics</option>
                <option value="JEE / Chemistry">JEE / Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering (Mech/Civil/EE)</option>
                <option value="Medical">Medical (MBBS)</option>
                <option value="School / CBSE">School / CBSE Class 11-12</option>
                <option value="Economics / Management">Economics / Management</option>
              </select>
            </div>

            {/* Edition */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Edition & Publisher
              </label>
              <input
                type="text"
                value={formData.edition}
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                placeholder="e.g. 4th Global Edition, MIT Press"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Original MRP */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Original Retail MRP (₹) *
              </label>
              <input
                type="number"
                value={formData.originalMrp}
                onChange={(e) => setFormData({ ...formData, originalMrp: e.target.value })}
                placeholder="e.g. 850"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Condition Self Assessment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Your Condition Assessment
              </label>
              <select
                value={formData.conditionAssessment}
                onChange={(e) => setFormData({ ...formData, conditionAssessment: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="Like New">Like New (Perfect, unread)</option>
                <option value="Good">Good (Minor wear, no markings)</option>
                <option value="Fair">Fair (Noticeable wear, some markings)</option>
                <option value="Worn">Worn (Heavy wear, cover damage, intact)</option>
              </select>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AI Vision will verify this during Step 3.
              </span>
            </div>

            {/* Description */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Student Notes / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe page condition, included formula sheets, or course details..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #D1DFD4',
                  fontSize: '0.92rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem' }}
              onClick={() => {
                if (!formData.title || !formData.author || !formData.originalMrp) {
                  addToast('Please fill in title, author and MRP', 'warning');
                  return;
                }
                setCurrentStep(2);
              }}
            >
              <span>Next: Upload 5 Photos</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: 5-PHOTO UPLOAD GRID ================= */}
      {currentStep === 2 && (
        <div className="card-white" style={{
          padding: '36px',
          borderRadius: '24px',
          border: '1.5px solid #DCE6DF',
          boxShadow: '0 12px 36px rgba(22, 36, 28, 0.06)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>
              Upload 5 Required Inspection Photos
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Our AI vision appraisal needs these 5 standardized angles to compute your condition grade and instant BookCoins.
            </p>
          </div>

          {/* 5-Angle Grid with file pickers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {PHOTO_STEPS.map((angle) => (
              <div
                key={angle.id}
                style={{
                  border: photoFiles[angle.id] ? '2px solid var(--primary-forest)' : '1.5px solid #DCE6DE',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#FAFDFB',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRefs[angle.id]?.current?.click()}
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRefs[angle.id]}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect(angle.id)}
                />

                <div style={{
                  height: '140px',
                  backgroundColor: '#16241C',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img
                    src={photos[angle.id]}
                    alt={angle.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Upload overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: photoFiles[angle.id] ? 'rgba(22,36,28,0)' : 'rgba(22,36,28,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {photoFiles[angle.id] ? (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2D6A4F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#FAF6EC' }}>
                        <Upload size={22} />
                        <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Click to Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: photoFiles[angle.id] ? 'var(--primary-forest)' : 'var(--text-main)' }}>
                    {angle.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>
                    {photoFiles[angle.id] ? '✓ Photo selected' : angle.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => setCurrentStep(1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Details</span>
            </button>

            <button
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem' }}
              onClick={() => setCurrentStep(3)}
            >
              <Sparkles size={18} />
              <span>Run AI Condition Appraisal</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: REAL AI VISION REVIEW ================= */}
      {currentStep === 3 && (
        <div className="card-white" style={{
          padding: '36px',
          borderRadius: '24px',
          border: '1.5px solid #DCE6DF',
          boxShadow: '0 12px 36px rgba(22, 36, 28, 0.06)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Sparkles size={28} />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
              Multimodal AI Quality & Valuation Appraisal
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Inspecting 5 angles with Google Gemini Computer Vision in real time.
            </p>
          </div>

          {/* Realtime Progress Bar & Status */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              fontWeight: '700',
              marginBottom: '6px',
              color: 'var(--primary-forest)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {aiLoading && <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} />}
                <span>{scanPhase}</span>
              </span>
              <span>{scanProgress}%</span>
            </div>

            <div style={{
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: '#E5EDE7',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${scanProgress}%`,
                backgroundColor: scanProgress === 100 ? '#2D6A4F' : '#D97706',
                borderRadius: '9999px',
                transition: 'width 0.4s ease-in-out'
              }} />
            </div>
          </div>

          {/* ── Error Banner: Retry (1st fail) → Fallback (2nd fail) ─────────── */}
          {aiError && (
            <div style={{
              padding: '22px',
              borderRadius: '18px',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              color: '#991B1B',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {attemptCount >= 2 ? 'Repeated Appraisal Failure' : 'AI Inspection Unsuccessful'}
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 14px', color: '#7F1D1D', lineHeight: '1.5' }}>
                    {aiError}
                  </p>

                  {/* Attempt 1 — simple retry */}
                  {attemptCount < 2 ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-primary"
                        onClick={executeAiInspection}
                        style={{ padding: '9px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <RotateCw size={14} />
                        <span>Try Again</span>
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setCurrentStep(2)}
                        style={{ padding: '9px 14px', fontSize: '0.84rem' }}
                      >
                        <span>Re-upload Clearer Photos</span>
                      </button>
                    </div>
                  ) : (
                    /* Attempt 2+ — show fallback option */
                    <div>
                      <div style={{
                        fontSize: '0.83rem', color: '#7F1D1D', marginBottom: '12px',
                        padding: '10px 14px', borderRadius: '10px',
                        backgroundColor: 'rgba(220, 38, 38, 0.07)',
                        border: '1px solid rgba(220, 38, 38, 0.15)'
                      }}>
                        Two consecutive appraisals failed. You can retry once more, or skip AI and let our team manually review your listing before crediting coins.
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary"
                          onClick={executeAiInspection}
                          style={{ padding: '9px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <RotateCw size={14} />
                          <span>Retry Once More</span>
                        </button>
                        <button
                          onClick={handleSkipToManualReview}
                          style={{
                            padding: '9px 18px', fontSize: '0.84rem',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'none', border: '1.5px solid #FCA5A5',
                            borderRadius: '9999px', color: '#991B1B',
                            cursor: 'pointer', fontWeight: '600'
                          }}
                        >
                          <SkipForward size={14} />
                          <span>Skip AI — Submit for Manual Review</span>
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => setCurrentStep(2)}
                          style={{ padding: '9px 14px', fontSize: '0.84rem' }}
                        >
                          <span>Re-upload Photos</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detected Textbook Meta Summary */}
          {!aiLoading && !aiError && aiResult && (
            <div style={{
              backgroundColor: '#F3F8F4',
              border: '1px solid #D1E5D6',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary-forest)', fontWeight: '700' }}>
                  OCR Detected Textbook
                </span>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {aiResult.detectedTitle}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  by {aiResult.detectedAuthor} • {aiResult.detectedEdition}
                </div>
              </div>
              <span className="badge-pill badge-subject" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                {aiResult.detectedCategory}
              </span>
            </div>
          )}

          {/* AI Inspection Findings Card */}
          {!aiLoading && !aiError && aiResult && (
            <div style={{
              backgroundColor: '#F8FAF8',
              border: '1.5px solid #DCE6DE',
              borderRadius: '18px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                    Assigned Condition Grade
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <ConditionBadge grade={aiResult.detectedGrade} score={aiResult.detectedScore} size="lg" showScore />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                    Vision Model Confidence
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: aiResult.detectedScore >= 60 ? '#2D6A4F' : '#D97706' }}>
                    {aiResult.confidence}
                  </div>
                </div>
              </div>

              {/* AI Reasoning Sentence */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1px solid #E2ECE5',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
                fontStyle: 'italic',
                display: 'flex',
                gap: '8px',
                marginBottom: aiResult.findings?.length ? '14px' : '0'
              }}>
                <Info size={16} color="var(--primary-forest)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>"{aiResult.conditionReasoning}"</span>
              </div>

              {/* Visual Inspection Angle Findings */}
              {aiResult.findings && aiResult.findings.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '8px',
                  paddingTop: '8px'
                }}>
                  {aiResult.findings.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.81rem',
                      color: 'var(--text-main)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5EDE7'
                    }}>
                      <CheckCircle2 size={14} color="#2D6A4F" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculated BookCoin Valuation & Pricing Transparency Box */}
          {!aiLoading && !aiError && aiResult && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '2px solid #FDE68A',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#92400E', fontWeight: '700', textTransform: 'uppercase' }}>
                    {aiResult.needsManualReview ? 'Estimated Reward (Pending Verification)' : 'Calculated Listing Reward'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Coins size={28} color="#D97706" style={{ fill: '#F59E0B' }} />
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B45309', fontFamily: 'var(--font-serif)', lineHeight: '1' }}>
                      {aiResult.needsManualReview ? '?' : `+${aiResult.calculatedCoins}`}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#92400E' }}>
                      BookCoins
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    backgroundColor: aiResult.needsManualReview ? 'rgba(202, 138, 4, 0.15)' : 'rgba(45, 106, 79, 0.12)',
                    color: aiResult.needsManualReview ? '#B45309' : '#2D6A4F',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontWeight: '700'
                  }}>
                    {aiResult.needsManualReview ? '⏳ Pending Review' : '⚡ Instant Credit'}
                  </span>
                </div>
              </div>

              {/* Pricing Transparency Breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                paddingTop: '14px',
                borderTop: '1px dashed #E6D7B8',
                fontSize: '0.82rem',
                color: '#78350F'
              }}>
                <div>
                  <span style={{ opacity: 0.8 }}>Seller MRP:</span>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>₹{formData.originalMrp}</div>
                </div>
                <div>
                  <span style={{ opacity: 0.8 }}>Condition Band:</span>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    {aiResult.detectedGrade || 'Manual Review'}
                    {aiResult.detectedGrade && ` (${((GRADE_PERCENTAGES[aiResult.detectedGrade] || 0) * 100).toFixed(0)}%)`}
                  </div>
                </div>
                <div>
                  <span style={{ opacity: 0.8 }}>AI Confidence:</span>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{aiResult.confidence}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Manual Review Notice Banner */}
          {!aiLoading && !aiError && aiResult?.needsManualReview && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: '#FEF9C3',
              border: '1.5px solid #FDE047',
              color: '#854D0E',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} color="#CA8A04" />
              <div style={{ fontSize: '0.86rem', lineHeight: '1.4' }}>
                <strong>Manual Review Notice:</strong> Your listing needs a quick manual check before coins are credited — our team will review it shortly.
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              className="btn-secondary"
              onClick={() => setCurrentStep(2)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Photos</span>
            </button>

            {aiError ? (
              <button
                className="btn-secondary"
                disabled
                style={{
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  opacity: 0.55,
                  cursor: 'not-allowed',
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  border: '1.5px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertCircle size={16} color="#DC2626" />
                <span>Inspection Required to Proceed</span>
              </button>
            ) : (aiLoading || !aiResult) ? (
              <button
                className="btn-secondary"
                disabled
                style={{
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F3F8F4',
                  color: 'var(--primary-forest)',
                  border: '1.5px solid #D1E5D6',
                }}
              >
                <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                <span>AI Appraisal in Progress…</span>
              </button>
            ) : (
              <button
                className="btn-gold"
                style={{ padding: '16px 36px', fontSize: '1.05rem', opacity: uploadingPhotos ? 0.7 : 1 }}
                onClick={handleFinalConfirm}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 0.7s linear infinite' }} />
                    <span>Uploading Photos & Publishing…</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : aiResult.needsManualReview ? (
                  <>
                    <Clock size={19} />
                    <span>Submit for Manual Review</span>
                  </>
                ) : (
                  <>
                    <Coins size={20} />
                    <span>Accept & Credit +{aiResult.calculatedCoins} BookCoins</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= STEP 4: CELEBRATION OR REVIEW NOTICE ================= */}
      {currentStep === 4 && (
        <div className="card-white" style={{
          padding: '48px 36px',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1.5px solid #DCE6DF',
          boxShadow: '0 16px 45px rgba(22, 36, 28, 0.09)'
        }}>
          {isPendingReview ? (
            /* Pending Manual Review Submitted State */
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                border: '2px solid #EAB308',
                color: '#854D0E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.25)'
              }}>
                <Clock size={40} />
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📋 Listing Submitted for Review
              </span>

              <h2 style={{ fontSize: '2.2rem', marginTop: '6px', marginBottom: '8px' }}>
                Manual Check in Progress
              </h2>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 28px' }}>
                Your listing needs a quick manual check before coins are credited — our team will review it shortly. Once verified, +<strong>{finalEarnedCoins} BookCoins</strong> will be credited to your wallet.
              </p>
            </>
          ) : (
            /* Auto-Approved Celebration State */
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '2px solid #F59E0B',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)'
              }}>
                <Coins size={42} style={{ fill: '#F59E0B' }} />
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🎉 Listing Published Successfully!
              </span>

              <h2 style={{ fontSize: '2.2rem', marginTop: '6px', marginBottom: '8px' }}>
                +{finalEarnedCoins} BookCoins Credited
              </h2>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 28px' }}>
                Your book <strong>{formData.title}</strong> is now live in the {currentUser?.campus_name || 'Campus'} marketplace. Drop it off at your campus locker point within 48 hours.
              </p>
            </>
          )}

          {/* Live Published Listing Mini Preview */}
          <div style={{
            maxWidth: '420px',
            margin: '0 auto 32px',
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#F8FAF8',
            border: '1px solid #DCE6DF',
            display: 'flex',
            gap: '14px',
            textAlign: 'left',
            alignItems: 'center'
          }}>
            <img
              src={photos.front}
              alt="Book cover"
              style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <ConditionBadge grade={aiResult.detectedGrade} score={aiResult.detectedScore} size="sm" />
                <span className="badge-pill badge-subject" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                  {formData.category}
                </span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', lineHeight: '1.3' }}>
                {formData.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                by {formData.author}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-forest)', fontWeight: '600', marginTop: '4px' }}>
                🏛️ {currentUser?.campus_name || 'Campus'} Drop Hub
              </div>
            </div>
          </div>

          {/* Post-Listing Navigation Options */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onNavigate('dashboard')}
              style={{ padding: '12px 26px' }}
            >
              <span>View in Dashboard</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="btn-secondary"
              onClick={() => onNavigate('browse')}
              style={{ padding: '12px 24px' }}
            >
              <span>Browse Marketplace</span>
            </button>

            <button
              className="btn-ghost"
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  title: "",
                  author: "",
                  category: "Computer Science",
                  edition: "",
                  originalMrp: "",
                  courseCode: "",
                  isbn: "",
                  description: ""
                });
              }}
              style={{ padding: '12px 18px' }}
            >
              <RefreshCw size={15} />
              <span>List Another Book</span>
            </button>
          </div>
        </div>
      )}

      {/* Responsive Form Grid */}
      <style>{`
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ListBookPage;
