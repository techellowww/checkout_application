import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useSettings } from "@shopify/ui-extensions/checkout/preact";

export default async () => {
  render(<ShippingNote />, document.body);
};

function ShippingNote() {
  const settings = useSettings();
  const noteText =
    settings.shipping_note_text ||
    "Shipping times shown above do not include processing.";

  return (
    // <s-banner tone="info">
    //   <s-text type="strong">+ Note: </s-text>
    //   <s-text>{noteText}</s-text>
    // </s-banner>
    <s-box></s-box>
  );
}
