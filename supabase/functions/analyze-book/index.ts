// Supabase Edge Function: analyze-book
// Securely calls Gemini Vision API using server-stored secret key.
// Never exposes the API key to the frontend.
//
// POST body: { images: Array<{ data: string, mimeType: string }>, title: string, originalPrice: number }
// Returns:   { detected_title, detected_author, detected_edition_or_year,
//              detected_subject_category, condition_grade, condition_reasoning,
//              confidence_score, needs_manual_review }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_GRADES = ["Like New", "Good", "Fair", "Worn"] as const;
type Grade = typeof VALID_GRADES[number];

// Real, verified Google Gemini API vision models tried in priority order
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

// Internal timeout: 18s (frontend has 25s, so this will cleanly error first)
const INTERNAL_TIMEOUT_MS = 18_000;

interface GeminiResult {
  detected_title: string;
  detected_author: string;
  detected_edition_or_year: string;
  detected_subject_category: string;
  condition_grade: Grade;
  condition_reasoning: string;
  confidence_score: number;
  needs_manual_review: boolean;
}

// Validate parsed response has all required fields with correct types/values
function validateResult(parsed: unknown): parsed is GeminiResult {
  if (!parsed || typeof parsed !== "object") return false;
  const r = parsed as Record<string, unknown>;
  if (typeof r.detected_title !== "string") return false;
  if (typeof r.detected_author !== "string") return false;
  if (typeof r.detected_edition_or_year !== "string") return false;
  if (typeof r.detected_subject_category !== "string") return false;
  if (!VALID_GRADES.includes(r.condition_grade as Grade)) return false;
  if (typeof r.condition_reasoning !== "string") return false;
  if (typeof r.confidence_score !== "number") return false;
  if (typeof r.needs_manual_review !== "boolean") return false;
  return true;
}

async function callGemini(
  apiKey: string,
  imageParts: Array<{ inlineData: { data: string; mimeType: string } }>,
  title: string,
  originalPrice: number
): Promise<{ result: GeminiResult; debugErrors: string[] }> {
  const systemPrompt = `You are the BookLoop Academic Book Appraisal AI. You receive photos of a used student textbook and must assess its condition.

BOOK INFO FROM SELLER:
- Title: "${title}"
- Retail Price (INR): ₹${originalPrice}

INSPECTION PHOTOS PROVIDED (in order):
1. Front Cover
2. Back Cover
3. Spine & Binding
4. Sample Inside Page
5. Full Distance Shot

GRADING RULES — apply exactly:
- "Like New": No visible damage, no tears, no stains, minimal shelf wear, spine looks tight. High confidence.
- "Good": Minor shelf wear or light cover scuffing only. No tears, no missing pages, pages are clean. No annotations.
- "Fair": Visible wear, small tears or corner damage, minor stains, some highlighting or writing inside. Fully usable and complete.
- "Worn": Heavy damage — significant tears, loose/detached pages, heavy staining, or missing pages. Set needs_manual_review to true.

CONFIDENCE RULES:
- If photos are unclear, blurry, or too dark, lower confidence_score accordingly (0–100).
- If confidence_score < 60 OR damage is severe, set needs_manual_review to true.

RESPONSE FORMAT — return ONLY valid JSON matching this exact schema. No markdown, no code fences, no extra text:
{
  "detected_title": "string",
  "detected_author": "string",
  "detected_edition_or_year": "string",
  "detected_subject_category": "School" | "JEE-NEET" | "College" | "Other",
  "condition_grade": "Like New" | "Good" | "Fair" | "Worn",
  "condition_reasoning": "string (1-2 sentences of visual evidence)",
  "confidence_score": number,
  "needs_manual_review": boolean
}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          ...imageParts,
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 512,
    },
  };

  console.log("[analyze-book] Gemini request:", JSON.stringify({
    imageCount: imageParts.length,
    promptChars: systemPrompt.length,
  }));

  const debugErrors: string[] = [];
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`[analyze-book] Trying model: ${model}`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);

      let res: Response;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        const errBodyText = await res.text().catch(() => "(unreadable body)");
        let errMsg: string;
        try {
          const errJson = JSON.parse(errBodyText) as { error?: { message?: string } };
          errMsg = errJson?.error?.message || errBodyText;
        } catch {
          errMsg = errBodyText;
        }
        const fullErr = `Model ${model} HTTP ${res.status}: ${errMsg}`;
        console.error(`[analyze-book] ${fullErr}`);
        debugErrors.push(fullErr);
        lastError = new Error(fullErr);
        continue;
      }

      const data = await res.json() as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }>};
          finishReason?: string;
        }>;
        error?: { message?: string };
      };

      if (data.error) {
        const errMsg = `Model ${model} API error in response body: ${data.error.message}`;
        console.error(`[analyze-book] ${errMsg}`);
        debugErrors.push(errMsg);
        lastError = new Error(errMsg);
        continue;
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText) {
        const finishReason = data?.candidates?.[0]?.finishReason ?? "unknown";
        const errMsg = `Model ${model} empty response, finishReason=${finishReason}`;
        console.error(`[analyze-book] ${errMsg}`);
        debugErrors.push(errMsg);
        lastError = new Error(errMsg);
        continue;
      }

      const cleanText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanText);
      } catch (e) {
        const errMsg = `Model ${model} JSON parse failed. Raw: ${rawText.slice(0, 300)}`;
        console.error(`[analyze-book] ${errMsg}`, e);
        debugErrors.push(errMsg);
        lastError = new Error("AI returned malformed JSON");
        continue;
      }

      if (!validateResult(parsed)) {
        const errMsg = `Model ${model} schema validation failed: ${JSON.stringify(parsed).slice(0, 300)}`;
        console.error(`[analyze-book] ${errMsg}`);
        debugErrors.push(errMsg);
        lastError = new Error("AI response failed schema validation");
        continue;
      }

      parsed.confidence_score = Math.min(100, Math.max(0, Math.round(parsed.confidence_score)));

      if (parsed.confidence_score < 60) {
        parsed.needs_manual_review = true;
      }

      console.log(`[analyze-book] SUCCESS model=${model} grade=${parsed.condition_grade} confidence=${parsed.confidence_score}`);
      return { result: parsed, debugErrors };

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const fullErr = `Model ${model} threw: ${msg}`;
      console.error(`[analyze-book] ${fullErr}`);
      debugErrors.push(fullErr);
      lastError = err instanceof Error ? err : new Error(msg);
    }
  }

  throw Object.assign(lastError ?? new Error("All Gemini models failed"), { debugErrors });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("[analyze-book] CRITICAL: GEMINI_API_KEY secret not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY not set" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  let body: {
    images?: Array<{ data: string; mimeType: string }>;
    title?: unknown;
    originalPrice?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const rawImages = Array.isArray(body.images) ? body.images : [];
  const title = typeof body.title === "string" ? body.title : "Unknown Book";
  const originalPrice = typeof body.originalPrice === "number" ? body.originalPrice : 500;

  console.log(`[analyze-book] Request: title="${title}" price=${originalPrice} imageCount=${rawImages.length}`);

  if (rawImages.length === 0) {
    return new Response(JSON.stringify({ error: "At least one image is required" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const imageParts = rawImages
    .slice(0, 5)
    .filter((img) => img && typeof img.data === "string" && img.data.length > 0)
    .map((img) => ({
      inlineData: {
        data: img.data,
        mimeType: (typeof img.mimeType === "string" && img.mimeType) ? img.mimeType : "image/jpeg",
      },
    }));

  if (imageParts.length === 0) {
    return new Response(JSON.stringify({ error: "No valid image data received" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const analysisPromise = (async () => {
    return await callGemini(apiKey, imageParts, title, originalPrice);
  })();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Analysis timed out after 18 seconds")), INTERNAL_TIMEOUT_MS)
  );

  try {
    const { result } = await Promise.race([analysisPromise, timeoutPromise]);
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const debugErrors: string[] = (err as { debugErrors?: string[] }).debugErrors ?? [];
    console.error("[analyze-book] Final error:", message);
    return new Response(JSON.stringify({
      success: false,
      error: message,
      _debug_errors: debugErrors,
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
