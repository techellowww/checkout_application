import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useExtensionData } from "@shopify/ui-extensions/checkout/preact";

// export default async () => {
//   render(<TrustpilotReviews />, document.body);
// };

/**
 * TrustpilotReviews — fetches live reviews from the app backend (/api/reviews)
 * which proxies Trustpilot's API. Falls back to static data if the fetch fails.
 *
 * Target: purchase.checkout.contact.render-after
 */

const FALLBACK = {
  summary: { rating: 4.9, total: 879 },
  reviews: [
    { id: "1", author: "Nick Pirollo",  date: "2 days ago", rating: 5, title: "Quality products",      body: "Great products and amazing delivery timing and good quality." },
    { id: "2", author: "Lily Brown",    date: "2 days ago", rating: 5, title: "Great customer service", body: "Great customer service. Impressive packaging and good quality." },
    { id: "3", author: "James Carter",  date: "3 days ago", rating: 5, title: "Fast shipping",          body: "Arrived faster than expected. Will definitely order again." },
  ],
};

function Stars({ count = 5 }) {
  return (
    <s-stack direction="inline" gap="extra-tight" alignItems="center">
      {Array.from({ length: count }).map((_, i) => (
        <s-icon key={i} type="star-filled" size="small" tone="success" />
      ))}
    </s-stack>
  );
}

export default function TrustpilotReviews() {
  const { extensionPoint } = useExtensionData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // extensionPoint.metafields gives us the app URL via metafields,
    // but the simplest approach in checkout extensions is to use the
    // shopify global which exposes the app URL.
    const appUrl = globalThis.shopify?.config?.app?.url
      || window.__SHOPIFY_DEV_HOST__
      || null;

    if (!appUrl) {
      setData(FALLBACK);
      setLoading(false);
      return;
    }

    const url = `${appUrl.replace(/\/$/, "")}/api/reviews`;

    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setData({
          summary: json.summary || FALLBACK.summary,
          reviews: json.reviews?.length > 0 ? json.reviews : FALLBACK.reviews,
        });
      })
      .catch((err) => {
        console.error("TrustpilotReviews fetch error:", err);
        setData(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  const { summary, reviews } = data || FALLBACK;
  const totalDisplay = summary.total > 0
    ? summary.total.toLocaleString()
    : "879";
  const ratingDisplay = Number(summary.rating).toFixed(1);

  return (
    <s-stack gap="base">

      {/* ── Trustpilot rating header + review cards ── */}
      <s-box padding="base" border="base base solid" borderRadius="base" background="base">
        <s-stack gap="small" alignItems="center">
          <s-text type="strong">Excellent</s-text>
          <Stars />
          <s-text type="small" color="subdued">
            Based on {totalDisplay} reviews on Trustpilot
          </s-text>
          <s-divider />
          <s-text type="small" color="subdued">Showing our 5 star reviews</s-text>

          {loading ? (
            <s-text type="small" color="subdued">Loading reviews…</s-text>
          ) : (
            reviews.map((r) => (
              <s-box
                key={r.id}
                padding="small"
                border="base base solid"
                borderRadius="base"
                background="base"
              >
                <s-stack gap="extra-tight">
                  <Stars count={r.rating} />
                  <s-stack direction="inline" gap="extra-tight" alignItems="center">
                    <s-text type="strong">{r.author}</s-text>
                    <s-text type="small" color="subdued">, {r.date}</s-text>
                  </s-stack>
                  <s-stack direction="inline" gap="extra-tight" alignItems="center">
                    {/*<s-icon type="checkmark-circle" size="small" tone="subdued" /> */}
                    <s-text color="subdued" type="small"><s-text type="small" tone="success">✔ </s-text>Verified</s-text>
                  </s-stack>
                  {r.title ? <s-text type="strong">{r.title}</s-text> : null}
                  <s-text type="small">{r.body}</s-text>
                </s-stack>
              </s-box>
            ))
          )}
        </s-stack>
      </s-box>

      {/* ── 4 Trust Badges ── */}
      <s-box padding="small" border="base base solid" borderRadius="base" background="base">
        <s-stack gap="base">
          <s-stack direction="inline" gap="base" alignItems="center">
            <s-icon type="star-filled" size="base" tone="success" />
            <s-stack gap="none">
              <s-text type="strong">Trustpilot</s-text>
              <s-text type="small" color="subdued">
                Rated ★ {ratingDisplay}/5 by real researchers on Trustpilot.
              </s-text>
            </s-stack>
          </s-stack>

          <s-divider />

          <s-stack direction="inline" gap="base" alignItems="center">
            <s-icon type="delivery" size="base" tone="success" />
            <s-stack gap="none">
              <s-text type="strong">48h Shipping</s-text>
              <s-text type="small" color="subdued">
                Get ultra-fast shipping with tracking in just 48 hours.
              </s-text>
            </s-stack>
          </s-stack>

          <s-divider />

          <s-stack direction="inline" gap="base" alignItems="center">
            <s-icon type="star" size="base" tone="success" />
            <s-stack gap="none">
              <s-text type="strong">99% Purity</s-text>
             <s-stack gap="none">
              <s-text type="small" color="subdued">
                All our products are routinely tested for optimal 
              </s-text>
              <s-text type="small" color="subdued">
                quality.
              </s-text>
            </s-stack>
            </s-stack>
          </s-stack>

          <s-divider />

          <s-stack direction="inline" gap="base" alignItems="center">
            <s-icon type="profile" size="base" tone="success" />
            <s-stack gap="none">
              <s-text type="strong">Customer Service</s-text>
              <s-stack gap="none">
                <s-text type="small" color="subdued">
                  We answer your questions Monday to Friday 
                </s-text>
                <s-text type="small" color="subdued">
                  from 9am to 6pm.
                </s-text>
              </s-stack>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-box>

    </s-stack>
  );
}
