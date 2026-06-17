import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useApi } from "@shopify/ui-extensions/checkout/preact";

export default async () => {
  render(<CutoffTimer />, document.body);
};

function CutoffTimer() {
  const api = useApi();
  const [timeLeft, setTimeLeft] = useState(8 * 3600);

  useEffect(() => {
    let timer;
    let isMounted = true;

    async function init() {
      const storageKey = "checkout_timer_start_time";
      let startStr = await api.storage.read(storageKey);

      let startTime;
      if (!startStr) {
        startTime = Date.now();
        // Fallback to memory in case write fails
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
        const remaining = 8 * 3600 - (elapsedSeconds % (8 * 3600));
        setTimeLeft(remaining);
      }, 1000);
    }

    init();

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [api]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  return (
    <s-box
      padding="large"
      border="base base solid"
      borderRadius="large"
      background="base"
    >
      <s-stack gap="none" alignItems="start">
        <s-stack direction="inline" gap="small-100" alignItems="start">
          {/* <s-icon type="clock" size="small" tone="success" /> */}
          <s-text type="strong">SHIPPING CUTOFF</s-text>
        </s-stack>
        <s-stack direction="inline" gap="small-100" alignItems="start" padding="small none none none">
          <s-text type="strong">Order within</s-text>

          <s-text type="strong">
            {hours}h {String(minutes).padStart(2, "0")}m
          </s-text>

          <s-badge tone="neutral">
            <s-text>SAME-DAY</s-text>
          </s-badge>
        </s-stack>
          <s-text type="small" color="subdued">
            For Same-day processing (Mon-Fri, cutoff 2:00 PM EST)
          </s-text>
      </s-stack>
    </s-box>
  );
}
