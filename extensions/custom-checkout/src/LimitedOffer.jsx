import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useSettings, useApi } from "@shopify/ui-extensions/checkout/preact";
import TrustpilotReviews from "./TrustpilotReviews.jsx";
import UpsellCards from "./UpsellCards.jsx";
import VipClub from "./VipClub.jsx";

export default async () => {
  render(<CheckoutAfterDiscounts />, document.body);
};

function CheckoutAfterDiscounts() {
  return (
    <s-stack gap="base">
      <LimitedOffer />
      <VipClub />
      <UpsellCards />
      <TrustpilotReviews />
    </s-stack>
  );
}

function LimitedOffer() {
  const settings = useSettings();
  const api = useApi();
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    let timer;
    let isMounted = true;

    async function init() {
      const storageKey = 'checkout_timer_start_time';
      let startStr = await api.storage.read(storageKey);
      
      let startTime;
      if (!startStr) {
        startTime = Date.now();
        globalThis.__APP_START_TIME__ = startTime;
        try {
          await api.storage.write(storageKey, startTime.toString());
        } catch (err) {}
      } else {
        startTime = parseInt(startStr, 10);
      }

      if (!isMounted) return;

      timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remaining = (10 * 60) - (elapsedSeconds % (10 * 60));
        setTimeLeft(remaining);
      }, 1000);
    }

    init();

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [api]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const rawCode = settings.limited_offer_code || "SAVE10 + VIP Membership";
  let codeMain = "SAVE10";
  let codeSuffix = " + VIP Membership";

  if (!rawCode.includes("SAVE10")) {
    codeMain = rawCode;
    codeSuffix = "";
  }

return (
  <s-box
    padding="large"
    border="base base solid"
    borderRadius="large"
    background="subdued"
  >
    <s-stack gap="base" alignItems="center">
      <s-text tone="info" emphasis="bold">
        🔥 LIMITED OFFER
      </s-text>

      <s-heading level="2">
        20% OFF Your Order
      </s-heading>

      <s-text>
        Use code{" "}
        <s-text emphasis="bold" tone="info">
          {codeMain}
        </s-text>
        {codeSuffix}
      </s-text>

      <s-box
        padding="small"
        border="base base solid"
        borderRadius="large"
        background="base"
      >
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-text tone="critical" emphasis="bold">
            ⏰ Expires in {minutes}:{seconds}
          </s-text>
        </s-stack>
      </s-box>
    </s-stack>
  </s-box>
 );
}
