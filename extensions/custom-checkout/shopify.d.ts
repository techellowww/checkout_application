import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/ShippingNote.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.shipping-option-list.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/UpsellCards.jsx' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.cart-line-list.render-after').Api
    | import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/CutoffTimer.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/LimitedOffer.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/TrustpilotReviews.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/VipClub.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}
