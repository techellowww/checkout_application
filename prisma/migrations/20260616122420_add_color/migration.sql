-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CheckoutBranding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#d40000',
    "secondaryColor" TEXT NOT NULL DEFAULT '#646464',
    "fontFamily" TEXT NOT NULL DEFAULT 'system-ui',
    "mainSectionPadding" TEXT NOT NULL DEFAULT 'LARGE_400',
    "mainSectionCornerRadius" TEXT NOT NULL DEFAULT 'BASE',
    "mainSectionColorScheme" TEXT NOT NULL DEFAULT 'COLOR_SCHEME1',
    "orderSummarySectionPadding" TEXT NOT NULL DEFAULT 'LARGE_400',
    "orderSummarySectionCornerRadius" TEXT NOT NULL DEFAULT 'BASE',
    "orderSummarySectionColorScheme" TEXT NOT NULL DEFAULT 'COLOR_SCHEME1',
    "checkoutProfileId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CheckoutBranding" ("checkoutProfileId", "createdAt", "fontFamily", "id", "mainSectionColorScheme", "mainSectionCornerRadius", "mainSectionPadding", "orderSummarySectionColorScheme", "orderSummarySectionCornerRadius", "orderSummarySectionPadding", "primaryColor", "secondaryColor", "shop", "updatedAt") SELECT "checkoutProfileId", "createdAt", "fontFamily", "id", "mainSectionColorScheme", "mainSectionCornerRadius", "mainSectionPadding", "orderSummarySectionColorScheme", "orderSummarySectionCornerRadius", "orderSummarySectionPadding", "primaryColor", "secondaryColor", "shop", "updatedAt" FROM "CheckoutBranding";
DROP TABLE "CheckoutBranding";
ALTER TABLE "new_CheckoutBranding" RENAME TO "CheckoutBranding";
CREATE UNIQUE INDEX "CheckoutBranding_shop_key" ON "CheckoutBranding"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
