-- CreateTable
CREATE TABLE "UpsellProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "imageUrl" TEXT,
    "price" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "UpsellProduct_shop_variantId_key" ON "UpsellProduct"("shop", "variantId");
