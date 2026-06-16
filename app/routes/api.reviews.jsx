/**
 * GET /api/reviews
 *
 * Public endpoint (no auth needed — called from checkout extension sandbox).
 * Fetches 5-star reviews from Trustpilot's Business API and returns them as JSON.
 *
 * Required env vars (add to your .env):
 *   TRUSTPILOT_API_KEY      — from https://businessapp.b2b.trustpilot.com/api
 *   TRUSTPILOT_BUSINESS_ID  — your Trustpilot business unit ID
 *
 * If env vars are missing it returns fallback static reviews so the checkout
 * never shows an empty state.
 */

const FALLBACK_REVIEWS = [
  {
    id: "1",
    author: "Nick Pirollo",
    date: "2 days ago",
    rating: 5,
    title: "Quality products",
    body: "Great products and amazing delivery timing.",
  },
  {
    id: "2",
    author: "Lily Brown",
    date: "2 days ago",
    rating: 5,
    title: "Great customer service",
    body: "Great customer service. Impressive packaging and good quality.",
  },
  {
    id: "3",
    author: "James Carter",
    date: "3 days ago",
    rating: 5,
    title: "Fast shipping",
    body: "Arrived faster than expected. Will definitely order again.",
  },
];

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return "1 month ago";
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return "recently";
  }
}

export async function loader({ request }) {
  // CORS headers — required so the checkout extension sandbox can call this
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    // Cache for 10 minutes to avoid hitting Trustpilot rate limits
    "Cache-Control": "public, max-age=600",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const apiKey = process.env.TRUSTPILOT_API_KEY;
  const businessId = process.env.TRUSTPILOT_BUSINESS_ID;

  // No credentials — return fallback immediately
  if (!apiKey || !businessId) {
    return new Response(
      JSON.stringify({
        source: "fallback",
        summary: { rating: 4.9, total: 879 },
        reviews: FALLBACK_REVIEWS,
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    // Fetch business summary (overall rating + total reviews)
    const [summaryRes, reviewsRes] = await Promise.all([
      fetch(
        `https://api.trustpilot.com/v1/business-units/${businessId}`,
        { headers: { apikey: apiKey } }
      ),
      fetch(
        `https://api.trustpilot.com/v1/business-units/${businessId}/reviews?stars=5&perPage=5&orderBy=createdat.desc`,
        { headers: { apikey: apiKey } }
      ),
    ]);

    if (!summaryRes.ok || !reviewsRes.ok) {
      throw new Error(`Trustpilot API error: ${summaryRes.status} / ${reviewsRes.status}`);
    }

    const summaryData = await summaryRes.json();
    const reviewsData = await reviewsRes.json();

    const reviews = (reviewsData.reviews || []).map((r) => ({
      id: r.id,
      author: r.consumer?.displayName || "Verified Customer",
      date: formatDate(r.createdat),
      rating: r.stars,
      title: r.title || "",
      body: r.text || "",
    }));

    return new Response(
      JSON.stringify({
        source: "trustpilot",
        summary: {
          rating: summaryData.score?.trustScore || 4.9,
          total: summaryData.numberOfReviews?.total || 0,
        },
        reviews: reviews.length > 0 ? reviews : FALLBACK_REVIEWS,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Trustpilot fetch error:", err);
    // On any error, return fallback so checkout never breaks
    return new Response(
      JSON.stringify({
        source: "fallback",
        summary: { rating: 4.9, total: 879 },
        reviews: FALLBACK_REVIEWS,
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}
