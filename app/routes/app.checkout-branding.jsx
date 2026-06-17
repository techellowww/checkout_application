import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function CheckoutBrandingPage() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const [branding, setBranding] = useState({
    customizations: {
      main: {
        section: {
          padding: "LARGE_400",
          cornerRadius: "BASE",
          colorScheme: "COLOR_SCHEME1",
        },
      },
      orderSummary: {
        section: {
          padding: "LARGE_400",
          cornerRadius: "BASE",
          colorScheme: "COLOR_SCHEME1",
        },
      },
    },
  });

  const [checkoutProfileId, setCheckoutProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial branding settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/checkout-branding");
        const data = await res.json();

        if (data.checkoutProfileId) {
          setCheckoutProfileId(data.checkoutProfileId);
        }

        if (data.branding) {
          setBranding({
            customizations: {
              main: {
                section: {
                  padding: data.branding.mainSectionPadding || "LARGE_400",
                  cornerRadius: data.branding.mainSectionCornerRadius || "BASE",
                  colorScheme:
                    data.branding.mainSectionColorScheme || "COLOR_SCHEME1",
                },
              },
              orderSummary: {
                section: {
                  padding:
                    data.branding.orderSummarySectionPadding || "LARGE_400",
                  cornerRadius:
                    data.branding.orderSummarySectionCornerRadius || "BASE",
                  colorScheme:
                    data.branding.orderSummarySectionColorScheme ||
                    "COLOR_SCHEME1",
                },
              },
            },
          });
        }
      } catch (error) {
        console.error("Error fetching branding settings:", error);
        shopify.toast.show("Error loading settings", { isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!checkoutProfileId) {
      shopify.toast.show("Error: Checkout profile not found", {
        isError: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/checkout-branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutProfileId,
          brandingInput: branding,
        }),
      });

      const result = await response.json();

      if (result.success) {
        shopify.toast.show("Checkout branding updated successfully!");
      } else {
        shopify.toast.show(
          `Error: ${result.error || "Failed to update branding"}`,
          { isError: true },
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      shopify.toast.show("Error saving branding settings", { isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <s-page heading="Checkout Branding">
        <s-section>
          <s-text>Loading...</s-text>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Checkout Branding">
      <s-button
        slot="primary-action"
        onClick={handleSave}
        {...(isSaving ? { loading: true, disabled: true } : {})}
      >
        Save Branding
      </s-button>

      {/* Design System - Colors */}
      <s-section heading="Design System - Global Colors">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Set the primary and secondary colors that will be used throughout
            your checkout. These colors form the foundation of your checkout
            design system.
          </s-paragraph>

          {/* <s-form-field label="Primary Color">
            <input
              type="color"
              value={branding.designSystem.colors.primaryColor}
              onChange={(e) =>
                setBranding({
                  ...branding,
                  designSystem: {
                    ...branding.designSystem,
                    colors: {
                      ...branding.designSystem.colors,
                      primaryColor: e.target.value,
                    },
                  },
                })
              }
              style={{
                width: "100%",
                height: "40px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <s-text size="small" appearance="subdued">
              Used for buttons, links, and key elements
            </s-text>
          </s-form-field>

          <s-form-field label="Secondary Color">
            <input
              type="color"
              value={branding.designSystem.colors.secondaryColor}
              onChange={(e) =>
                setBranding({
                  ...branding,
                  designSystem: {
                    ...branding.designSystem,
                    colors: {
                      ...branding.designSystem.colors,
                      secondaryColor: e.target.value,
                    },
                  },
                })
              }
              style={{
                width: "100%",
                height: "40px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <s-text size="small" appearance="subdued">
              Used for backgrounds and secondary elements
            </s-text>
          </s-form-field> */}
        </s-stack>
      </s-section>

      {/* Main Section Customization */}
      <s-section heading="Main Section Customization">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Customize the main checkout form section (address, payment, etc.)
          </s-paragraph>

          <div>
            <s-form-field label="Padding">
              <select
                value={branding.customizations.main.section.padding}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      main: {
                        ...branding.customizations.main,
                        section: {
                          ...branding.customizations.main.section,
                          padding: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="SMALL_100">Small</option>
                <option value="BASE_200">Base</option>
                <option value="LARGE_300">Large</option>
                <option value="LARGE_400">Extra Large</option>
              </select>
            </s-form-field>
          </div>

          <div>
            <s-form-field label="Corner Radius">
              <select
                value={branding.customizations.main.section.cornerRadius}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      main: {
                        ...branding.customizations.main,
                        section: {
                          ...branding.customizations.main.section,
                          cornerRadius: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="NONE">None (Sharp)</option>
                <option value="BASE">Base (Slightly Rounded)</option>
                <option value="LARGE">Large (Very Rounded)</option>
              </select>
            </s-form-field>
          </div>

          <div>
            <s-form-field label="Color Scheme">
              <select
                value={branding.customizations.main.section.colorScheme}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      main: {
                        ...branding.customizations.main,
                        section: {
                          ...branding.customizations.main.section,
                          colorScheme: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="COLOR_SCHEME1">Color Scheme 1</option>
                <option value="COLOR_SCHEME2">Color Scheme 2</option>
                <option value="COLOR_SCHEME3">Color Scheme 3</option>
              </select>
            </s-form-field>
          </div>
        </s-stack>
      </s-section>

      {/* Order Summary Customization */}
      <s-section heading="Order Summary Customization">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Customize the order summary section (cart items, totals, etc.)
          </s-paragraph>

          <div>
            <s-form-field label="Padding">
              <select
                value={branding.customizations.orderSummary.section.padding}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      orderSummary: {
                        ...branding.customizations.orderSummary,
                        section: {
                          ...branding.customizations.orderSummary.section,
                          padding: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="SMALL_100">Small</option>
                <option value="BASE_200">Base</option>
                <option value="LARGE_300">Large</option>
                <option value="LARGE_400">Extra Large</option>
              </select>
            </s-form-field>
          </div>

          <div>
            <s-form-field label="Corner Radius">
              <select
                value={
                  branding.customizations.orderSummary.section.cornerRadius
                }
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      orderSummary: {
                        ...branding.customizations.orderSummary,
                        section: {
                          ...branding.customizations.orderSummary.section,
                          cornerRadius: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="NONE">None (Sharp)</option>
                <option value="BASE">Base (Slightly Rounded)</option>
                <option value="LARGE">Large (Very Rounded)</option>
              </select>
            </s-form-field>
          </div>

          <div>
            <s-form-field label="Color Scheme">
              <select
                value={branding.customizations.orderSummary.section.colorScheme}
                onChange={(e) =>
                  setBranding({
                    ...branding,
                    customizations: {
                      ...branding.customizations,
                      orderSummary: {
                        ...branding.customizations.orderSummary,
                        section: {
                          ...branding.customizations.orderSummary.section,
                          colorScheme: e.target.value,
                        },
                      },
                    },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="COLOR_SCHEME1">Color Scheme 1</option>
                <option value="COLOR_SCHEME2">Color Scheme 2</option>
                <option value="COLOR_SCHEME3">Color Scheme 3</option>
              </select>
            </s-form-field>
          </div>
        </s-stack>
      </s-section>

      {/* Info Section */}
      <s-section slot="aside" heading="About Checkout Branding">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text weight="bold">Changes apply immediately</s-text>
            to your published checkout. Customers will see the updated design on
            their next visit.
          </s-paragraph>

          <s-paragraph>
            <s-text weight="bold">Design System</s-text>
            colors are applied globally throughout the checkout, while
            customizations let you fine-tune specific sections.
          </s-paragraph>

          <s-paragraph>
            <s-link
              href="https://shopify.dev/docs/apps/checkout/styling"
              target="_blank"
            >
              Learn more about checkout branding →
            </s-link>
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}
