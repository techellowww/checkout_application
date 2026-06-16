import { useState, useCallback } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const products = await prisma.upsellProduct.findMany({
    where: { shop: session.shop },
    orderBy: { position: "asc" },
  });

  return { products };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const products = JSON.parse(formData.get("products") || "[]");

  // Replace the saved selection with whatever is currently in the form
  await prisma.$transaction([
    prisma.upsellProduct.deleteMany({ where: { shop: session.shop } }),
    prisma.upsellProduct.createMany({
      data: products.map((p, index) => ({
        shop: session.shop,
        productId: p.productId,
        variantId: p.variantId,
        title: p.title,
        handle: p.handle,
        imageUrl: p.imageUrl || null,
        price: p.price,
        currencyCode: p.currencyCode,
        position: index,
      })),
    }),
  ]);

  // Get the app installation id (owner for $app metafields)
  const installationRes = await admin.graphql(
    `#graphql
      query GetAppInstallation {
        currentAppInstallation { id }
      }`,
  );
  const installationJson = await installationRes.json();
  const ownerId = installationJson.data.currentAppInstallation.id;

  // Sync resolved product data so the checkout extension can read it directly
  const metafieldValue = JSON.stringify(
    products.map((p) => ({
      variantId: p.variantId,
      productId: p.productId,
      title: p.title,
      handle: p.handle,
      imageUrl: p.imageUrl || null,
      price: p.price,
      currencyCode: p.currencyCode,
    })),
  );

  const metafieldRes = await admin.graphql(
    `#graphql
      mutation SetUpsellProducts($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id key }
          userErrors { field message }
        }
      }`,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: "$app",
            key: "upsell_products",
            type: "json",
            value: metafieldValue,
          },
        ],
      },
    },
  );
  const metafieldJson = await metafieldRes.json();
  const userErrors = metafieldJson.data?.metafieldsSet?.userErrors;
  if (userErrors?.length) {
    return { ok: false, errors: userErrors };
  }

  return { ok: true, products };
};

export default function UpsellProductsPage() {
  const { products: initialProducts } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const [products, setProducts] = useState(initialProducts);

  const isSaving =
    fetcher.state !== "idle" && fetcher.formMethod === "POST";

  const handleAddProducts = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      filter: { variants: true },
    });

    if (!selection) return;

    const mapped = selection
      .map((product) => {
        const variant = product.variants?.[0];
        if (!variant) return null;
        return {
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          handle: product.handle,
          imageUrl: product.images?.[0]?.originalSrc || null,
          price: variant.price,
          currencyCode: variant.currencyCode || "USD",
        };
      })
      .filter(Boolean);

    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.variantId));
      const newOnes = mapped.filter((p) => !existingIds.has(p.variantId));
      return [...prev, ...newOnes];
    });
  }, [shopify]);

  const handleRemove = (variantId) => {
    setProducts((prev) => prev.filter((p) => p.variantId !== variantId));
  };

  const handleSave = () => {
    fetcher.submit(
      { products: JSON.stringify(products) },
      { method: "POST" },
    );
  };

  return (
    <s-page heading="Checkout Upsell Products">
      <s-button slot="primary-action" onClick={handleSave} {...(isSaving ? { loading: true } : {})}>
        {initialProducts.length > 0 ? "Update" : "Save"}
      </s-button>

      <s-section heading="Selected products">
        {products.length === 0 ? (
          <s-paragraph>
            No products selected yet. Add products to show them as upsells
            in checkout.
          </s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {products.map((p) => (
              <s-box
                key={p.variantId}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack
                  direction="inline"
                  gap="base"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <s-stack direction="inline" gap="base" alignItems="center">
                    {p.imageUrl && (
                      <s-image
                        src={p.imageUrl}
                        inlineSize={48}
                        aspectRatio={1}
                        borderRadius="base"
                      />
                    )}
                    <s-stack gap="none">
                      <s-text type="strong">{p.title}</s-text>
                      <s-text type="small" color="subdued">
                        {p.currencyCode} {p.price}
                      </s-text>
                    </s-stack>
                  </s-stack>
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    onClick={() => handleRemove(p.variantId)}
                  >
                    Remove
                  </s-button>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}

        <s-button onClick={handleAddProducts}>Add products</s-button>
      </s-section>
    </s-page>
  );
}
