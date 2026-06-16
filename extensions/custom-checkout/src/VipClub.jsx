import "@shopify/ui-extensions/preact";

export default function VipClub() {
  return (
    <s-box
      padding="base"
      border="base base solid"
      borderRadius="base"
      background="base"
    >
      <s-stack gap="small">

        <s-stack
          direction="inline"
          justifyContent="space-between"
          alignItems="center"
        >
          <s-text type="strong">
            Join The Prime VIP Club!
          </s-text>

          <s-badge tone="success">
            FREE TRIAL
          </s-badge>
        </s-stack>

        <s-text size="small">
          Join Prime VIP Club and enjoy 10% off every order,
          free express 2-day shipping and priority processing.
        </s-text>

        <s-box
          padding="small"
          background="subdued"
          borderRadius="base"
        >
          <s-stack gap="tight">

            <s-stack
              direction="inline"
              justifyContent="space-between"
            >
              <s-text size="small">
                10% VIP Discount
              </s-text>

              <s-text type="strong">
                $16.25
              </s-text>
            </s-stack>

            <s-stack
              direction="inline"
              justifyContent="space-between"
            >
              <s-text size="small">
                Free 2-Day Shipping
              </s-text>

              <s-text type="strong">
                $25.00
              </s-text>
            </s-stack>

            <s-divider />

            <s-stack
              direction="inline"
              justifyContent="space-between"
            >
              <s-text type="strong">
                Total Savings
              </s-text>

              <s-text type="strong">
                $41.25
              </s-text>
            </s-stack>

          </s-stack>
        </s-box>

        <s-checkbox>
          Join VIP Membership
        </s-checkbox>

      </s-stack>
    </s-box>
  );
}
