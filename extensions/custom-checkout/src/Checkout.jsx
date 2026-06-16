import React, { useEffect, useState } from "react";
import {
  reactExtension,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Separator,
  Icon,
  View,
  Grid,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";

// Target the main dynamic region inside the checkout framework
export default reactExtension("purchase.checkout.block.render", () => (
  <ExtensionApp />
));

function ExtensionApp() {
  // Read any configuration properties initialized in your Shopify Customizer settings
  const { banner_text, target_minutes } = useSettings();

  // 1. Countdown Timer State Logic (Defaulting to 10 minutes)
  const initialMinutes = parseInt(target_minutes, 10) || 10;
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <BlockStack spacing="loose">
      {/* SECTION 1: COUNTDOWN RESERVATION TIMER */}
      {timeLeft > 0 && (
        <View
          border="none"
          padding="base"
          cornerRadius="base"
          background="criticalSubdued"
        >
          <InlineStack
            spacing="tight"
            inlineAlignment="center"
            blockAlignment="center"
          >
            <Icon source="clock" appearance="critical" />
            <Text size="base" appearance="critical" weight="bold">
              {banner_text || "Your order is reserved for"}{" "}
              {formatTime(timeLeft)} minutes
            </Text>
          </InlineStack>
        </View>
      )}

      {/* SECTION 2: TRUST BADGES & SECURITY BLOCK */}
      <View
        border="base"
        padding="base"
        cornerRadius="base"
        borderColor="muted"
      >
        <BlockStack spacing="base">
          <InlineStack inlineAlignment="center" spacing="tight">
            <Icon source="lock" size="small" />
            <Text size="small" weight="bold" appearance="subdued">
              SSL SECURED & ENCRYPTED CHECKOUT
            </Text>
          </InlineStack>

          <Separator />

          <Grid columns={["1fr", "1fr", "1fr"]} spacing="extraTight">
            <BlockStack inlineAlignment="center" spacing="extraTight">
              <Icon source="checkmark" size="fill" appearance="success" />
              <Text size="extraSmall" alignment="center" weight="bold">
                Safe Payments
              </Text>
            </BlockStack>

            <BlockStack inlineAlignment="center" spacing="extraTight">
              <Icon source="truck" size="fill" appearance="info" />
              <Text size="extraSmall" alignment="center" weight="bold">
                Tracked Delivery
              </Text>
            </BlockStack>

            <BlockStack inlineAlignment="center" spacing="extraTight">
              <Icon source="star" size="fill" appearance="warning" />
              <Text size="extraSmall" alignment="center" weight="bold">
                Money-Back Guarantee
              </Text>
            </BlockStack>
          </Grid>
        </BlockStack>
      </View>

      {/* SECTION 3: SOCIAL PROOF / CUSTOMER REVIEW SNIPPET */}
      <View background="subdued" padding="base" cornerRadius="base">
        <BlockStack spacing="tight">
          <InlineStack spacing="extraTight">
            <Icon source="star" size="small" appearance="warning" />
            <Icon source="star" size="small" appearance="warning" />
            <Icon source="star" size="small" appearance="warning" />
            <Icon source="star" size="small" appearance="warning" />
            <Icon source="star" size="small" appearance="warning" />
          </InlineStack>

          <Text size="small" role="emphasis">
            "Outstanding experience! The checkout was fast, secure, and shipping
            updates kept me informed every single step of the way."
          </Text>

          <InlineStack spacing="extraTight" blockAlignment="center">
            <Text size="extraSmall" weight="bold">
              - Sarah M.
            </Text>
            <Icon source="checkmark" size="small" appearance="success" />
            <Text size="extraSmall" appearance="success">
              Verified Purchase
            </Text>
          </InlineStack>
        </BlockStack>
      </View>
    </BlockStack>
  );
}
