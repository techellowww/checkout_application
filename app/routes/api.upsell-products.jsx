/**
 * GET /api/upsell-products?shop=xxx.myshopify.com
 *
 * Public endpoint (no auth — called from checkout extension sandbox).
 * Returns the merchant's saved upsell product selection from Prisma.
 */

import prisma from "../db.server";

export async function loader({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const products = await prisma.upsellProduct.findMany({
      where: { shop },
      orderBy: { position: "asc" },
    });

    return new Response(
      JSON.stringify({
        products: products.map((p) => ({
          variantId: p.variantId,
          productId: p.productId,
          title: p.title,
          handle: p.handle,
          imageUrl: p.imageUrl,
          price: p.price,
          currencyCode: p.currencyCode,
        })),
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (err) {
    console.error("upsell-products fetch error:", err);
    return new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: corsHeaders,
    });
  }
}