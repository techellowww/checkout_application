// import "@shopify/ui-extensions/preact";
// import { render } from "preact";
// import { useState, useEffect } from "preact/hooks";
// import {
//   useApi,
//   useCartLines,
//   useApplyCartLinesChange,
// } from "@shopify/ui-extensions/checkout/preact";

// export default async () => {
//   render(<UpsellCards />, document.body);
// };

// function ImageOrPlaceholder({ imageUrl }) {
//   if (imageUrl) {
//     return (
//       <s-image
//         src={imageUrl}
//         inlineSize={50}
//         aspectRatio={1}
//         borderRadius="base"
//       />
//     );
//   }
//   return (
//     <s-stack
//       inlineSize={50}
//       minBlockSize={50}
//       background="subdued"
//       borderRadius="base"
//       alignItems="center"
//       justifyContent="center"
//     >
//       <s-icon type="gift-card" size="base" tone="neutral" />
//     </s-stack>
//   );
// }

// function UpsellCards() {
//   const api = useApi();
//   const cartLines = useCartLines();
//   const applyCartLinesChange = useApplyCartLinesChange();
//   const [loadingId, setLoadingId] = useState(null);

//   const [resolvedProducts, setResolvedProducts] = useState({
//     vip: {
//       id: "gid://shopify/ProductVariant/mock-vip",
//       title: "Join The Prime VIP Club!",
//       price: "0.00",
//       currencyCode: "USD",
//       description: "Join Prime VIP Club and enjoy 10% off every order, free express 2-day shipping, and priority processing — so your orders always ship first. You're also covered by our 120 day no risk guarantee for full peace of mind. As a VIP member, you'll get exclusive access to members-only products, research ebooks, and special discounts tailored to your needs. Membership is $35/month and you can cancel anytime — just contact us or use the Manage Membership form on our website.",
//       badge: "+ FREE TRIAL",
//       badgeTone: "success",
//       isVip: true
//     },
//     bac: {
//       id: "gid://shopify/ProductVariant/mock-bac",
//       title: "Don't Forget Your Bac Water!",
//       price: "15.00",
//       currencyCode: "USD",
//       description: "Add 10 mL of bacteriostatic water in one click. Required to properly dilute the product.",
//       badge: "💧 SAVE $5",
//       badgeTone: "info"
//     },
//     priority: {
//       id: "gid://shopify/ProductVariant/mock-priority",
//       title: "Priority Processing",
//       price: "25.00",
//       currencyCode: "USD",
//       description: "Move to the front of the line for same-day shipping (orders placed before 2PM EST Mon-Fri).",
//       badge: "⚡ FAST",
//       badgeTone: "warning"
//     },
//     shield: {
//       id: "gid://shopify/ProductVariant/mock-shield",
//       title: "Prime Shield+ — Shipping & Packaging Protection",
//       price: "12.50",
//       currencyCode: "USD",
//       description: "",
//       badge: ""
//     }
//   });

//   useEffect(() => {
//     async function loadProducts() {
//       try {
//         const res = await api.query(`
//           query GetProducts {
//             products(first: 50) {
//               nodes {
//                 id
//                 title
//                 handle
//                 featuredImage { url }
//                 variants(first: 1) {
//                   nodes {
//                     id
//                     price { amount currencyCode }
//                   }
//                 }
//               }
//             }
//           }
//         `);
//         if (res.data?.products?.nodes) {
//           const nodes = res.data.products.nodes;

//           const findAndMapVariant = (keywords, defaultObj) => {
//             const match = nodes.find(n =>
//               keywords.some(k => n.title.toLowerCase().includes(k) || n.handle.toLowerCase().includes(k))
//             );
//             if (match && match.variants?.nodes?.[0]) {
//               const v = match.variants.nodes[0];
//               return {
//                 ...defaultObj,
//                 id: v.id,
//                 title: match.title,
//                 price: v.price.amount,
//                 currencyCode: v.price.currencyCode,
//                 imageUrl: match.featuredImage?.url
//               };
//             }
//             return defaultObj;
//           };

//           setResolvedProducts({
//             vip: findAndMapVariant(['vip', 'membership', 'club'], resolvedProducts.vip),
//             bac: findAndMapVariant(['bac', 'water', 'bacteriostatic'], resolvedProducts.bac),
//             priority: findAndMapVariant(['priority', 'dispatch', 'processing'], resolvedProducts.priority),
//             shield: findAndMapVariant(['shield', 'protection'], resolvedProducts.shield)
//           });
//         }
//       } catch (err) {
//         console.error("Failed to query products:", err);
//       }
//     }
//     loadProducts();
//   }, [api]);

//   const getCartLine = (item) => {
//     return cartLines.find(line =>
//       line.merchandise.id === item.id ||
//       line.merchandise.title.toLowerCase().includes(item.title.toLowerCase())
//     );
//   };

//   const handleToggle = async (item) => {
//     const line = getCartLine(item);
//     const isAdded = !!line;
//     setLoadingId(item.id);
//     try {
//       if (!isAdded) {
//         const result = await applyCartLinesChange({
//           type: 'addCartLine',
//           merchandiseId: item.id,
//           quantity: 1,
//         });
//         if (result.type === 'error') {
//           console.error("Failed to add:", result.message);
//         }
//       } else {
//         const result = await applyCartLinesChange({
//           type: 'removeCartLine',
//           id: line.id,
//           quantity: line.quantity
//         });
//         if (result.type === 'error') {
//           console.error("Failed to remove:", result.message);
//         }
//       }
//     } catch (err) {
//       console.error("Error toggling cart line:", err);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const items = [
//     resolvedProducts.vip,
//     resolvedProducts.bac,
//     resolvedProducts.priority,
//     resolvedProducts.shield
//   ];

//   return (
//     <s-stack gap="base">
//       <s-stack gap="none">
//         <s-text type="strong">Recommended add-ons</s-text>
//         <s-text type="small" color="subdued">Complete your order with these popular additions.</s-text>
//       </s-stack>

//       {items.map(item => {
//         const line = getCartLine(item);
//         const isAdded = !!line;
//         const formattedPrice = item.price === "0.00" || parseFloat(item.price) === 0
//           ? ""
//           : new Intl.NumberFormat(undefined, {
//               style: 'currency',
//               currency: item.currencyCode || 'USD'
//             }).format(parseFloat(item.price));

//         return (
//           <s-box
//             key={item.id}
//             padding="base"
//             border="base base solid"
//             borderRadius="base"
//             background={isAdded ? "subdued" : "base"}
//           >
//             <s-stack direction="inline" gap="small" alignItems="start">
//               <s-checkbox
//                 checked={isAdded}
//                 disabled={loadingId !== null}
//                 onChange={() => handleToggle(item)}
//               />
//               {item.imageUrl && !item.isVip && (
//                 <ImageOrPlaceholder imageUrl={item.imageUrl} />
//               )}
//               <s-stack gap="small-100">
//                 <s-stack direction="inline" gap="small" alignItems="center" justifyContent="space-between">
//                   <s-stack direction="inline" gap="small" alignItems="center">
//                     <s-text type="strong">{item.title}</s-text>
//                     {item.badge && (
//                       <s-badge tone={item.badgeTone}>{item.badge}</s-badge>
//                     )}
//                   </s-stack>
//                   {formattedPrice && <s-text type="strong">{formattedPrice}</s-text>}
//                 </s-stack>

//                 {item.description && (
//                   <s-text color="subdued" type="small">{item.description}</s-text>
//                 )}

//                 {item.isVip && (
//                   <s-box padding="small" background="base" border="base base solid" borderRadius="base">
//                     <s-stack gap="small-100">
//                       <s-text type="small" type="strong" tone="success">By joining, you save on this order:</s-text>
//                       <s-stack direction="inline" justifyContent="space-between">
//                         <s-text type="small" tone="success">+ 10% VIP Discount</s-text>
//                         <s-text type="small" tone="success">$16.25</s-text>
//                       </s-stack>
//                       <s-stack direction="inline" justifyContent="space-between">
//                         <s-text type="small" tone="success">+ Free 2-Day Shipping</s-text>
//                         <s-text type="small" tone="success">$25.00</s-text>
//                       </s-stack>
//                       <s-divider />
//                       <s-stack direction="inline" justifyContent="space-between">
//                         <s-text type="small" type="strong" tone="success">Total</s-text>
//                         <s-text type="small" type="strong" tone="success">$41.25</s-text>
//                       </s-stack>
//                     </s-stack>
//                   </s-box>
//                 )}
//               </s-stack>
//             </s-stack>
//           </s-box>
//         );
//       })}
//     </s-stack>
//   );
// }

import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  useCartLines,
  useApplyCartLinesChange,
  useShop,
} from "@shopify/ui-extensions/checkout/preact";

// export default async () => {
//   render(<UpsellCards />, document.body);
// };

function ImageOrPlaceholder({ imageUrl }) {
  return (
    <s-box
      inlineSize="60px"
      blockSize="60px"
      overflow="hidden"
      borderRadius="base"
    >
      {imageUrl ? (
        <s-image src={imageUrl} aspectRatio={1} />
      ) : (
        <s-stack
          inlineSize="60px"
          blockSize="60px"
          background="subdued"
          alignItems="center"
          justifyContent="center"
        >
          <s-icon type="gift-card" size="small" tone="neutral" />
        </s-stack>
      )}
    </s-box>
  );
}

export default function UpsellCards() {
  const cartLines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const shop = useShop();
  const [items, setItems] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (!shop?.myshopifyDomain) {
      return;
    }

    const url = `https://agency-grade-speakers-unavailable.trycloudflare.com/api/upsell-products?shop=${encodeURIComponent(
      shop.myshopifyDomain,
    )}`;

    // console.log("FETCH URL", url);

    fetch(url)
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        setItems(data.products || []);
      })
      .catch((err) => {
        console.error("FETCH ERROR", err);
      });
  }, [shop?.myshopifyDomain]);

  if (items.length === 0) {
    return null;
  }

  const getCartLine = (item) =>
    cartLines.find((line) => line.merchandise.id === item.variantId);

  const handleToggle = async (item) => {
    const line = getCartLine(item);
    const isAdded = !!line;
    setLoadingId(item.variantId);
    try {
      if (!isAdded) {
        const result = await applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: item.variantId,
          quantity: 1,
        });
        if (result.type === "error") {
          console.error("Failed to add:", result.message);
        }
      } else {
        const result = await applyCartLinesChange({
          type: "removeCartLine",
          id: line.id,
          quantity: line.quantity,
        });
        if (result.type === "error") {
          console.error("Failed to remove:", result.message);
        }
      }
    } catch (err) {
      console.error("Error toggling cart line:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <s-stack gap="base">
      <s-stack gap="none">
        <s-text type="strong">Recommended add-ons</s-text>
        <s-text type="small" color="subdued">
          Complete your order with these popular additions.
        </s-text>
      </s-stack>

      {items.map((item) => {
        const line = getCartLine(item);
        const isAdded = !!line;
        const priceValue = parseFloat(item.price);
        const formattedPrice =
          !priceValue || priceValue === 0
            ? ""
            : new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: item.currencyCode || "USD",
              }).format(priceValue);

        return (
          <s-box
            key={item.variantId}
            padding="small"
            border="base base solid"
            borderRadius="base"
            background={isAdded ? "subdued" : "base"}
          >
            <s-stack direction="inline" gap="small" alignItems="start">
              <s-checkbox
                checked={isAdded}
                disabled={loadingId !== null}
                onChange={() => handleToggle(item)}
              />
              <s-box
                inlineSize="56px"
                blockSize="56px"
                border="base base solid"
                borderRadius="base base base base"
              >
                <s-image
                  src={item.imageUrl}
                  alt={item.title}
                  aspectRatio="1/1"
                  objectFit="cover"
                  border="none"
                  borderRadius="base base base base"
                />
              </s-box>
              <s-stack gap="small-100">
                <s-stack gap="none">
                  <s-text size="small">{item.title}</s-text>
                  {formattedPrice && (
                    <s-text type="small" color="subdued">
                      {formattedPrice}
                    </s-text>
                  )}
                </s-stack>
              </s-stack>
            </s-stack>
          </s-box>
        );
      })}
    </s-stack>
  );
}
