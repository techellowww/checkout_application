import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const CHECKOUT_BRANDING_MUTATION = `
  mutation CheckoutBrandingUpsert($checkoutProfileId: ID!, $input: CheckoutBrandingInput!) {
    checkoutBrandingUpsert(checkoutProfileId: $checkoutProfileId, checkoutBrandingInput: $input) {
      checkoutBranding {
        customizations {
          main {
            section {
              colorScheme
              padding
              cornerRadius
            }
          }
          orderSummary {
            section {
              colorScheme
              padding
              cornerRadius
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CHECKOUT_PROFILE_QUERY = `
  query GetCheckoutProfile {
    checkoutProfiles(first: 10) {
      edges {
        node {
          id
          name
          isPublished
        }
      }
    }
  }
`;

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // Get stored branding settings from database
  const storedBranding = await prisma.checkoutBranding.findUnique({
    where: { shop },
  });

  // Get checkout profile ID from Shopify
  let checkoutProfileId = storedBranding?.checkoutProfileId;

  if (!checkoutProfileId) {
    try {
      const response = await admin.graphql(CHECKOUT_PROFILE_QUERY);
      const data = await response.json();

      if (data.data?.checkoutProfiles?.edges?.[0]) {
        checkoutProfileId = data.data.checkoutProfiles.edges[0].node.id;
      }
    } catch (error) {
      console.error("Error fetching checkout profile:", error);
    }
  }

  return {
    branding: storedBranding,
    checkoutProfileId,
  };
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const body = await request.json();
  const { brandingInput, checkoutProfileId } = body;

  if (!checkoutProfileId) {
    return Response.json(
      { error: "Checkout profile ID is required" },
      { status: 400 }
    );
  }

  try {
    // Call Shopify's checkoutBrandingUpsert mutation
    const response = await admin.graphql(CHECKOUT_BRANDING_MUTATION, {
      variables: {
        checkoutProfileId,
        input: brandingInput,
      },
    });

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return Response.json(
        { error: "GraphQL error", details: data.errors },
        { status: 400 }
      );
    }

    // Check for user errors from the mutation
    const userErrors = data.data?.checkoutBrandingUpsert?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("User Errors:", userErrors);
      return Response.json(
        { error: "Mutation error", details: userErrors },
        { status: 400 }
      );
    }

    // Save to database
    const updatedBranding = await prisma.checkoutBranding.upsert({
      where: { shop },
      create: {
        shop,
        checkoutProfileId,
        mainSectionPadding:
          brandingInput.customizations?.main?.section?.padding || "LARGE_400",
        mainSectionCornerRadius:
          brandingInput.customizations?.main?.section?.cornerRadius || "BASE",
        mainSectionColorScheme:
          brandingInput.customizations?.main?.section?.colorScheme ||
          "COLOR_SCHEME1",
        orderSummarySectionPadding:
          brandingInput.customizations?.orderSummary?.section?.padding ||
          "LARGE_400",
        orderSummarySectionCornerRadius:
          brandingInput.customizations?.orderSummary?.section?.cornerRadius ||
          "BASE",
        orderSummarySectionColorScheme:
          brandingInput.customizations?.orderSummary?.section?.colorScheme ||
          "COLOR_SCHEME1",
      },
      update: {
        checkoutProfileId,
        mainSectionPadding:
          brandingInput.customizations?.main?.section?.padding,
        mainSectionCornerRadius:
          brandingInput.customizations?.main?.section?.cornerRadius,
        mainSectionColorScheme:
          brandingInput.customizations?.main?.section?.colorScheme,
        orderSummarySectionPadding:
          brandingInput.customizations?.orderSummary?.section?.padding,
        orderSummarySectionCornerRadius:
          brandingInput.customizations?.orderSummary?.section?.cornerRadius,
        orderSummarySectionColorScheme:
          brandingInput.customizations?.orderSummary?.section?.colorScheme,
      },
    });

    return Response.json({
      success: true,
      branding: updatedBranding,
      shopifyResponse: data.data?.checkoutBrandingUpsert?.checkoutBranding,
    });
  } catch (error) {
    console.error("Checkout Branding Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
